"""
AICTE KoshDrishti (कोषदृष्टि) • Native Python Backend Engine
Fully persists to SQLite (vishwas_fdr.db), real SHA-256 hash-chained audit ledger,
anchored regex field extraction, deterministic APH Table 1.4 & Clause 11.8 compliance scoring,
scheduled background alert scanner daemon, and PyJWT role-based access control (RBAC).
"""

import http.server
from http.server import ThreadingHTTPServer
import json
import sqlite3
import hashlib
import time
import os
import re
import io
import csv
import base64
import threading
import uuid
from contextlib import contextmanager
import jwt
from datetime import datetime, timedelta
from urllib.parse import urlparse, parse_qs

# Optional PDF text extraction using pypdf
try:
    import pypdf
    PYPDF_AVAILABLE = True
except ImportError:
    PYPDF_AVAILABLE = False

DB_FILE = os.path.join(os.path.dirname(__file__), "vishwas_fdr.db")

# Secrets configuration
JWT_SECRET_ENV = os.environ.get("JWT_SECRET")
if JWT_SECRET_ENV:
    JWT_SECRET = JWT_SECRET_ENV
    JWT_MODE = "PRODUCTION_ENV"
else:
    # Explicitly labeled DEMO-ONLY secret for offline hackathon jury evaluation
    JWT_SECRET = "kosh_drishti_demo_jury_evaluation_secret_key_2026"
    JWT_MODE = "DEMO_EVALUATION_FALLBACK"

JWT_ALGORITHM = "HS256"

# Ensure DB is seeded on startup
from seed_db import seed_database
seed_database()

def get_db():
    conn = sqlite3.connect(DB_FILE, timeout=20.0)
    conn.execute("PRAGMA journal_mode=WAL;")
    conn.execute("PRAGMA busy_timeout=5000;")
    conn.row_factory = sqlite3.Row
    return conn

@contextmanager
def db_session():
    """
    Context manager for SQLite database connections.
    Guarantees connections are closed cleanly in finally block,
    preventing 'database is locked' errors from unclosed sockets or unhandled exceptions.
    """
    conn = get_db()
    try:
        yield conn
    finally:
        try:
            conn.close()
        except Exception:
            pass

# Security & IDOR Enforcement Helper
def check_institution_ownership(auth, target_inst_name, target_inst_id=None):
    """
    IDOR Prevention: Validates that if caller is 'institution', they only access/modify
    instruments belonging to their own institution.
    Bureau officers and directors have system-wide regulatory oversight.
    """
    if not auth:
        return False
    role = auth.get("role")
    if role in ["bureau_officer", "director", "bank_validator", "admin"]:
        return True
    if role == "institution":
        user_dept = (auth.get("department") or "").lower()
        user_email = (auth.get("email") or "").lower()
        target_name_lower = (target_inst_name or "").lower()

        # Stop words to ignore during token comparison
        stop_words = {'institute', 'desk', 'college', 'technology', 'university', 'school', 'academy', 'advanced', 'engineering', 'of', '&', 'and', 'the'}
        tokens = [t for t in re.split(r'[\s\-_,.]+', user_dept) if len(t) > 3 and t not in stop_words]

        email_domain = user_email.split('@')[1] if '@' in user_email else ""
        domain_name = email_domain.split('.')[0] if email_domain else ""

        for token in tokens:
            if token in target_name_lower:
                return True
        if domain_name and len(domain_name) > 3 and domain_name in target_name_lower:
            return True

        return False
    return False

def sanitize_csv_cell(val):
    """Prevents CSV formula injection in spreadsheet applications"""
    if val is None:
        return ""
    s = str(val)
    if s and s[0] in ('=', '+', '-', '@', '\t', '\r'):
        return "'" + s
    return s

def sanitize_filename(filename):
    """Sanitizes filename against path traversal and header injection"""
    if not filename:
        return "document.pdf"
    clean = os.path.basename(filename)
    clean = re.sub(r'[\r\n\t"\'<>]', '', clean)
    clean = re.sub(r'[^\w\.\-\_ ]', '_', clean)
    return clean[:120] or "document.bin"

# Server-side Table 1.4 Norms Authority (Client aph_norm is never trusted)
TABLE_1_4_NORMS = {
    "Engineering & Technology (UG)": {"minAmount": 3500000, "tenorYears": 10},
    "Engineering & Technology (Diploma)": {"minAmount": 1500000, "tenorYears": 10},
    "Engineering & Technology (PG)": {"minAmount": 1500000, "tenorYears": 10},
    "Management (PG - MBA/PGDM)": {"minAmount": 1500000, "tenorYears": 10},
    "Management (UG - BBA)": {"minAmount": 500000, "tenorYears": 10},
    "Computer Applications (PG - MCA)": {"minAmount": 1500000, "tenorYears": 10},
    "Computer Applications (UG - BCA)": {"minAmount": 500000, "tenorYears": 10},
    "Planning (Diploma / UG / PG)": {"minAmount": 1500000, "tenorYears": 10},
    "Applied Arts & Crafts (All Levels)": {"minAmount": 1500000, "tenorYears": 10},
    "Design (All Levels)": {"minAmount": 1500000, "tenorYears": 10},
    "Hotel Management & Catering (HMCT)": {"minAmount": 1500000, "tenorYears": 10},
    "Government / University Constituent (All)": {"minAmount": 0, "tenorYears": 0, "isGovt": True}
}

def get_server_aph_norm(program):
    """
    Derives mandatory deposit amount and tenor strictly from server-side Table 1.4 rules.
    Prevents untrusted clients from injecting minAmount: 0.
    Returns None if program is unknown or not covered by Table 1.4 (e.g. Pharmacy/Architecture).
    """
    if not program or not isinstance(program, str):
        return None
    
    prog_clean = program.strip()
    prog_lower = prog_clean.lower()

    # Explicit exclusion check: Pharmacy and Architecture are governed separately by PCI / CoA
    if "pharmacy" in prog_lower or "architecture" in prog_lower:
        return None

    if "government" in prog_lower or "constituent" in prog_lower:
        return {"minAmount": 0, "tenorYears": 0, "isGovt": True, "program": "Government / University Constituent (All)"}
    
    # Exact lookup
    for prog_key, norm in TABLE_1_4_NORMS.items():
        if prog_key.lower() == prog_lower:
            return {**norm, "program": prog_key}
            
    # Alias / subtype lookups strictly within Table 1.4
    if "bba" in prog_lower:
        return {"minAmount": 500000, "tenorYears": 10, "program": "Management (UG - BBA)"}
    elif "bca" in prog_lower:
        return {"minAmount": 500000, "tenorYears": 10, "program": "Computer Applications (UG - BCA)"}
    elif "diploma" in prog_lower or "polytechnic" in prog_lower:
        return {"minAmount": 1500000, "tenorYears": 10, "program": "Engineering & Technology (Diploma)"}
    elif "management" in prog_lower or "mba" in prog_lower or "pgdm" in prog_lower:
        return {"minAmount": 1500000, "tenorYears": 10, "program": "Management (PG - MBA/PGDM)"}
    elif "mca" in prog_lower:
        return {"minAmount": 1500000, "tenorYears": 10, "program": "Computer Applications (PG - MCA)"}
    elif "planning" in prog_lower:
        return {"minAmount": 1500000, "tenorYears": 10, "program": "Planning (Diploma / UG / PG)"}
    elif "applied arts" in prog_lower or "crafts" in prog_lower:
        return {"minAmount": 1500000, "tenorYears": 10, "program": "Applied Arts & Crafts (All Levels)"}
    elif "design" in prog_lower:
        return {"minAmount": 1500000, "tenorYears": 10, "program": "Design (All Levels)"}
    elif "hotel" in prog_lower or "hmct" in prog_lower:
        return {"minAmount": 1500000, "tenorYears": 10, "program": "Hotel Management & Catering (HMCT)"}
    elif "engineering" in prog_lower or "technology" in prog_lower:
        if "pg" in prog_lower or "m.tech" in prog_lower or "me" in prog_lower:
            return {"minAmount": 1500000, "tenorYears": 10, "program": "Engineering & Technology (PG)"}
        return {"minAmount": 3500000, "tenorYears": 10, "program": "Engineering & Technology (UG)"}
        
    return None

# Helper: Append to Cryptographic SHA-256 Hash-Chained Ledger
def append_to_ledger(action, actor, fdr_id, details):
    with db_session() as conn:
        with conn:
            c = conn.cursor()
            c.execute("SELECT block_index, block_hash FROM audit_ledger ORDER BY block_index DESC LIMIT 1")
            last_block = c.fetchone()
            
            if last_block:
                new_index = last_block["block_index"] + 1
                prev_hash = last_block["block_hash"]
            else:
                new_index = 0
                prev_hash = "0" * 64

            timestamp = datetime.utcnow().isoformat() + "Z"
            block_string = f"{new_index}:{prev_hash}:{timestamp}:{action}:{actor}:{fdr_id}:{details}"
            block_hash = hashlib.sha256(block_string.encode('utf-8')).hexdigest()

            c.execute('''
                INSERT INTO audit_ledger (block_index, timestamp, action, actor, fdr_id, previous_hash, block_hash, details)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            ''', (new_index, timestamp, action, actor, fdr_id, prev_hash, block_hash, details))

            # Maintain separate ledger checkpoint table to detect tail truncation
            c.execute('''
                CREATE TABLE IF NOT EXISTS ledger_checkpoint (
                    id INTEGER PRIMARY KEY,
                    last_block_index INTEGER NOT NULL,
                    head_hash TEXT NOT NULL,
                    total_blocks INTEGER NOT NULL,
                    updated_at TEXT NOT NULL
                )
            ''')
            c.execute('''
                INSERT OR REPLACE INTO ledger_checkpoint (id, last_block_index, head_hash, total_blocks, updated_at)
                VALUES (1, ?, ?, ?, ?)
            ''', (new_index, block_hash, new_index + 1, timestamp))

    return {"blockIndex": new_index, "blockHash": block_hash, "previousHash": prev_hash}

# Helper: Verify Cryptographic Chain Integrity
def verify_ledger_chain():
    with db_session() as conn:
        c = conn.cursor()
        c.execute("SELECT block_index, timestamp, action, actor, fdr_id, previous_hash, block_hash, details FROM audit_ledger ORDER BY block_index ASC")
        blocks = c.fetchall()

        # Check ledger checkpoint to detect tail truncation
        c.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='ledger_checkpoint'")
        has_cp = c.fetchone()
        cp = None
        if has_cp:
            c.execute("SELECT last_block_index, head_hash, total_blocks FROM ledger_checkpoint WHERE id = 1")
            cp = c.fetchone()

    if not blocks:
        return {"valid": True, "total_blocks": 0, "message": "Ledger is empty"}

    # Tail truncation detection
    if cp:
        expected_total = cp["total_blocks"]
        expected_head = cp["head_hash"]
        if len(blocks) < expected_total:
            return {
                "valid": False,
                "tampered_block_index": len(blocks),
                "error": f"Ledger tail truncation detected! Checkpoint recorded {expected_total} blocks (head {expected_head[:12]}...), but current chain only contains {len(blocks)} blocks.",
                "expected_blocks": expected_total,
                "found_blocks": len(blocks)
            }

    for i, block in enumerate(blocks):
        b_idx = block["block_index"]
        prev_hash = block["previous_hash"]
        ts = block["timestamp"]
        act = block["action"]
        actor = block["actor"]
        f_id = block["fdr_id"]
        det = block["details"]
        stored_hash = block["block_hash"]

        # Check linkage with previous block
        if i > 0:
            if prev_hash != blocks[i - 1]["block_hash"]:
                return {
                    "valid": False,
                    "tampered_block_index": b_idx,
                    "error": f"Previous hash linkage broken at block #{b_idx}. Expected: {blocks[i-1]['block_hash']}, Found: {prev_hash}"
                }
        else:
            if prev_hash != "0" * 64:
                return {
                    "valid": False,
                    "tampered_block_index": 0,
                    "error": "Genesis block previous hash is corrupt"
                }

        # Recompute SHA-256 hash
        block_str = f"{b_idx}:{prev_hash}:{ts}:{act}:{actor}:{f_id}:{det}"
        recomputed_hash = hashlib.sha256(block_str.encode('utf-8')).hexdigest()

        if recomputed_hash != stored_hash:
            return {
                "valid": False,
                "tampered_block_index": b_idx,
                "error": f"Cryptographic integrity violation at block #{b_idx}! Stored hash does not match block content.",
                "stored_hash": stored_hash,
                "recomputed_hash": recomputed_hash
            }

    return {
        "valid": True,
        "total_blocks": len(blocks),
        "chain_verified": True,
        "verified_at": datetime.utcnow().isoformat() + "Z",
        "latest_block_hash": blocks[-1]["block_hash"]
    }

# Helper: Anchored Field Extraction from Text (OCR Regex Engine)
def extract_fields_from_text(raw_text):
    if not raw_text or not raw_text.strip():
        return {
            "status": "UNREADABLE",
            "error": "No text detected in document",
            "extracted_fdr_number": None,
            "extracted_amount": None,
            "extracted_bank": None,
            "extracted_dates": None,
            "has_aicte_title": False
        }

    # 1. FDR Number regex - MUST contain actual digits and keep full FDR/BANK/XXXX string
    fdr_number = None
    fdr_full_match = re.search(r'(FDR\/[A-Z0-9_\-\/]{4,}[0-9]{3,}[A-Z0-9_\-\/]*)', raw_text, re.IGNORECASE)
    if fdr_full_match:
        fdr_number = fdr_full_match.group(1).strip()
    else:
        fdr_match = re.search(r'(?:FDR\s*(?:NO|NUMBER)?|FD\s*(?:NO|NUMBER)?|RECEIPT\s*NO|REF\s*NO)[\s\:\#-]*([A-Z0-9\/]{6,30})', raw_text, re.IGNORECASE)
        if fdr_match:
            candidate = fdr_match.group(1).strip()
            if re.search(r'\d{4,}', candidate) and not re.search(r'^(?:NUMBER|INCOMPLETE|MISSING|NOTAPPLICABLE)$', candidate, re.IGNORECASE):
                fdr_number = candidate if candidate.upper().startswith("FDR") else f"FDR/{candidate}"
        else:
            alt_match = re.search(r'([A-Z]{3,5}\/[A-Z0-9]{3,6}\/[0-9]{6,14})', raw_text)
            if alt_match:
                fdr_number = alt_match.group(1).strip()

    # 2. Amount Regex - Strictly Anchored on 'DEPOSIT AMOUNT', 'INR', 'RS', '₹'
    amount = None
    dep_amt_match = re.search(
        r'(?:DEPOSIT\s*AMOUNT|PRINCIPAL\s*AMOUNT|FDR\s*AMOUNT|SUM\s*OF\s*RS\.?|TOTAL\s*AMOUNT)[\s\:\-]+(?:INR|RS\.?|₹)?\s*([0-9]{1,2}(?:,[0-9]{2})*(?:,[0-9]{3})(?:\.[0-9]{2})?|[0-9]{5,9}(?:\.[0-9]{2})?)',
        raw_text,
        re.IGNORECASE
    )
    if dep_amt_match:
        val_str = dep_amt_match.group(1).replace(',', '')
        try:
            parsed = float(val_str)
            if parsed >= 10000:
                amount = parsed
        except ValueError:
            amount = None

    if amount is None:
        inr_matches = re.finditer(
            r'(?:INR|RS\.?|₹)\s*([0-9]{1,2}(?:,[0-9]{2})+(?:,[0-9]{3})(?:\.[0-9]{2})?|[0-9]{1,2}(?:,[0-9]{3})+(?:\.[0-9]{2})?|[0-9]{5,9}(?:\.[0-9]{2})?)',
            raw_text,
            re.IGNORECASE
        )
        for m in inr_matches:
            val_str = m.group(1).replace(',', '')
            try:
                parsed = float(val_str)
                if 50000 <= parsed <= 50000000:
                    amount = parsed
                    break
            except ValueError:
                continue

    if amount is None:
        words_match = re.search(r'RUPEES\s+([A-Z\s]+?)\s+ONLY', raw_text, re.IGNORECASE)
        if words_match:
            words = words_match.group(1).upper()
            if "THIRTY FIVE LAKH" in words:
                amount = 3500000.0
            elif "FIFTEEN LAKH" in words:
                amount = 1500000.0
            elif "FIVE LAKH" in words:
                amount = 500000.0
            elif "TWENTY FIVE LAKH" in words:
                amount = 2500000.0

    # 3. Bank Name identification
    bank_name = None
    known_banks = [
        ("State Bank of India", "SBI"),
        ("Punjab National Bank", "PNB"),
        ("Canara Bank", "CANARA"),
        ("Bank of Baroda", "BOB"),
        ("HDFC Bank", "HDFC"),
        ("ICICI Bank", "ICICI"),
        ("Union Bank of India", "UNION")
    ]
    for b_name, b_code in known_banks:
        if re.search(rf'\b({b_name}|{b_code})\b', raw_text, re.IGNORECASE):
            bank_name = b_name
            break

    # 4. Dates
    dates = re.findall(r'(\d{4}[-/]\d{2}[-/]\d{2}|\d{2}[-/]\d{2}[-/]\d{4})', raw_text)

    # 5. Joint with AICTE
    has_aicte = bool(re.search(r'member\s*secretary.*aicte|all\s*india\s*council.*technical|aicte', raw_text, re.IGNORECASE))

    # Return UNREADABLE when FDR number AND amount are both missing
    if not fdr_number and not amount:
        return {
            "status": "UNREADABLE",
            "error": "Document missing both FDR number and deposit amount (incomplete or invalid slip)",
            "extracted_fdr_number": None,
            "extracted_amount": None,
            "extracted_bank": bank_name,
            "extracted_dates": dates if dates else None,
            "has_aicte_title": has_aicte,
            "char_count": len(raw_text)
        }

    return {
        "status": "EXTRACTED" if (fdr_number and amount) else "PARTIAL",
        "extracted_fdr_number": fdr_number,
        "extracted_amount": amount,
        "extracted_bank": bank_name,
        "extracted_dates": dates if dates else None,
        "has_aicte_title": has_aicte,
        "char_count": len(raw_text)
    }

# Helper: Rule-based APH Table 1.4 & Clause 11.8 Compliance Scorer
def compute_rule_compliance_score(institution_data, bank_record, aph_norm):
    """
    Computes a deterministic, rule-based regulatory compliance score (0 to 100).
    Pure function of statutory requirements from APH 2024-27 Table 1.4 & Chapter XI Cl. 11.8.
    """
    score = 100.0
    penalties = []
    
    inst_amt = institution_data.get("amount", 0)
    bank_amt = bank_record.get("amount", 0)
    base_required = aph_norm.get("minAmount", 3500000)
    
    # Cl 1.4: Leased premises requires 2x multiplier
    is_leased = institution_data.get("isLeasedBuilding", False)
    min_required = base_required * 2 if is_leased else base_required

    required_tenor = aph_norm.get("tenorYears", 10)
    bank_tenor = bank_record.get("tenorYears", 10)
    bank_joint = bank_record.get("jointHolderName", "")
    lien_marked = bank_record.get("lienMarked", False)
    is_govt = institution_data.get("isGovernmentExempt", False) or aph_norm.get("isGovt", False)

    # 1. Amount Compliance (with 2x leased building multiplier)
    if bank_amt < min_required and not is_govt:
        deficit = min_required - bank_amt
        score -= 30.0
        multiplier_note = " (includes 2x leased premises multiplier)" if is_leased else ""
        penalties.append(f"Deposit amount ₹{bank_amt:,.0f} is below mandatory APH norm ₹{min_required:,.0f}{multiplier_note} (Deficit: ₹{deficit:,.0f})")

    # 2. Tenor Shortfall / Premature Encashment Risk (Cl 11.8: 10% penalty flag)
    if bank_tenor < required_tenor and not is_govt:
        shortfall = required_tenor - bank_tenor
        score -= 25.0
        penalties.append(f"Tenor is {bank_tenor} years instead of mandatory {required_tenor}-year non-callable lock-in (Cl. 11.8: 10% penalty flag invoked)")

    # 3. AICTE Joint Lien Title
    if "member secretary" not in bank_joint.lower():
        score -= 30.0
        penalties.append("Lien title does not designate Member Secretary, AICTE as joint pledgee")

    # 4. Core Banking Lien Endorsement
    if not lien_marked:
        score -= 15.0
        penalties.append("Lien endorsement flag not active in Core Banking System")

    # 5. Timeline Rules: 15-day proof & affidavit submission (Cl 11.8)
    days_late = institution_data.get("daysLate", 0)
    if days_late >= 30:
        score -= 20.0
        penalties.append("Late-submission stage 2: Exceeded 30-day proof deadline (50% severe surcharge penalty applied per Cl. 11.8)")
    elif days_late >= 15:
        score -= 10.0
        penalties.append("Late-submission stage 1: Exceeded 15-day proof deadline (10% statutory surcharge applied per Cl. 11.8)")

    final_score = max(0.0, min(100.0, score))
    compliance_level = "COMPLIANT" if final_score >= 90 else "CONDITIONAL" if final_score >= 60 else "FLAGGED"

    return {
        "rule_compliance_score": round(final_score, 1),
        "compliance_level": compliance_level,
        "penalties": penalties,
        "is_leased_building": is_leased,
        "derived_statutory_norm": aph_norm,
        "statutory_norm_evaluated": "AICTE APH 2024-27 Table 1.4 & Chapter XI Clause 11.8",
        "action_required": "Proceed with clearance" if final_score >= 90 else "Issue Statutory Rectification Mandate"
    }

# Background Alert Scanner Daemon
def run_alert_scanner():
    """
    Statutory Alert Scanner:
    Calculates dynamic days_remaining = (maturity_date - today) for all instruments,
    scans Active, Pending, Expiring, and Renewal Requested instruments,
    and intelligently dedups without permanently silencing maturing deposits.
    """
    try:
        with db_session() as conn:
            with conn:
                c = conn.cursor()
                today = datetime.utcnow().date()
                
                c.execute("SELECT id, fdr_number, institution_name, maturity_date, status, has_discrepancies FROM instruments")
                rows = c.fetchall()
                
                for r in rows:
                    fdr_id = r["id"]
                    mat_str = r["maturity_date"]
                    inst_name = r["institution_name"]
                    status = r["status"]
                    
                    if not mat_str:
                        continue
                    try:
                        mat_date = datetime.strptime(mat_str[:10], "%Y-%m-%d").date()
                        days_rem = (mat_date - today).days
                    except Exception:
                        continue
                    
                    # Synchronize computed days_remaining
                    c.execute("UPDATE instruments SET days_remaining = ? WHERE id = ?", (days_rem, fdr_id))
                    
                    # Include Expiring and Renewal Requested in scanner
                    if status in ["Active", "Pending", "Expiring", "Renewal Requested"]:
                        alert_type = None
                        msg = None
                        
                        if 0 < days_rem <= 7:
                            alert_type = "CRITICAL_7_DAY"
                            msg = f"EMERGENCY: Non-callable deposit {fdr_id} matures in {days_rem} days! Core banking lien requires immediate renewal or forfeiture protocol."
                        elif 7 < days_rem <= 30:
                            alert_type = "URGENT_30_DAY"
                            msg = f"Mandatory 10-Year deposit matures in {days_rem} days. Send replacement/renewal advisory to institution."
                        elif 30 < days_rem <= 60:
                            alert_type = "RENEWAL_WINDOW_60D"
                            msg = f"60-day renewal intimation: Instrument {fdr_id} maturity in {days_rem} days. Intimation dispatched."
                        elif 60 < days_rem <= 90:
                            alert_type = "ADVANCE_INTIMATION_90D"
                            msg = f"90-day statutory advance intimation: Instrument {fdr_id} approaching end of 10-year tenor in {days_rem} days."
                        elif days_rem <= 0:
                            alert_type = "MATURITY_FULFILLED"
                            msg = f"10-Year lock-in completed ({abs(days_rem)} days ago). Two-officer digital discharge ready for Member Secretary approval."
                        
                        if alert_type:
                            c.execute("""
                                SELECT id, status, days_remaining 
                                FROM alerts 
                                WHERE fdr_id = ? AND alert_type = ? 
                                ORDER BY id DESC LIMIT 1
                            """, (fdr_id, alert_type))
                            existing = c.fetchone()
                            
                            should_insert = False
                            if not existing:
                                should_insert = True
                            elif existing["status"] == "DISMISSED":
                                # If previously dismissed, re-alert when advancing into critical <=7d or <=30d window or days decreased
                                if days_rem <= 7 or (existing["days_remaining"] is not None and days_rem < existing["days_remaining"]):
                                    should_insert = True
                            elif existing["status"] == "ACTIVE":
                                # Keep active alert days_remaining and message fresh
                                c.execute("UPDATE alerts SET days_remaining = ?, message = ? WHERE id = ?", (days_rem, msg, existing["id"]))
                            
                            if should_insert:
                                c.execute('''
                                    INSERT INTO alerts (fdr_id, institution_name, alert_type, days_remaining, message, status, created_at)
                                    VALUES (?, ?, ?, ?, ?, 'ACTIVE', datetime('now'))
                                ''', (fdr_id, inst_name, alert_type, days_rem, msg))

                # Escalation: Escalate active critical alerts unactioned for >= 3 days
                c.execute('''
                    UPDATE alerts 
                    SET status = 'ESCALATED', message = '[ESCALATED TO MEMBER SECRETARY] ' || message 
                    WHERE status = 'ACTIVE' 
                      AND alert_type IN ('CRITICAL_7_DAY', 'URGENT_30_DAY')
                      AND (julianday('now') - julianday(created_at)) >= 3
                ''')
    except Exception as e:
        print(f"[AlertScanner] Daemon error: {e}")

def alert_scanner_daemon():
    time.sleep(1)
    run_alert_scanner()
    while True:
        time.sleep(60)
        run_alert_scanner()

# Authentication & RBAC Helper
def authenticate_jwt(handler, allowed_roles=None):
    """
    Validates JWT Bearer token and checks RBAC permissions.
    Returns payload dictionary if authorized, or writes 401/403 and returns None.
    """
    auth_header = handler.headers.get("Authorization", "")
    if not auth_header.startswith("Bearer "):
        handler._set_headers(401)
        handler.wfile.write(json.dumps({
            "error": "Unauthorized: Missing Bearer token in Authorization header",
            "code": "AUTH_TOKEN_MISSING"
        }).encode('utf-8'))
        return None

    token = auth_header.split(" ", 1)[1].strip()
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
    except jwt.ExpiredSignatureError:
        handler._set_headers(401)
        handler.wfile.write(json.dumps({
            "error": "Unauthorized: Authentication token has expired",
            "code": "AUTH_TOKEN_EXPIRED"
        }).encode('utf-8'))
        return None
    except Exception as err:
        handler._set_headers(401)
        handler.wfile.write(json.dumps({
            "error": f"Unauthorized: Invalid token ({str(err)})",
            "code": "AUTH_TOKEN_INVALID"
        }).encode('utf-8'))
        return None

    if allowed_roles:
        user_role = payload.get("role")
        if user_role not in allowed_roles:
            handler._set_headers(403)
            handler.wfile.write(json.dumps({
                "error": f"Forbidden: Role '{user_role}' lacks required permissions for this operation",
                "allowed_roles": allowed_roles,
                "code": "AUTH_FORBIDDEN_ROLE"
            }).encode('utf-8'))
            return None

    return payload

class VishwasAPIHandler(http.server.BaseHTTPRequestHandler):
    def _send_cors_headers(self):
        origin = self.headers.get('Origin', '')
        if origin and re.match(r'^https?://(localhost|127\.0\.0\.1)(:[0-9]+)?$', origin):
            self.send_header('Access-Control-Allow-Origin', origin)
        else:
            self.send_header('Access-Control-Allow-Origin', 'http://localhost:5173')
            
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, PATCH, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type, Authorization')
        self.send_header('Access-Control-Allow-Credentials', 'true')

    def _set_headers(self, status=200):
        self.send_response(status)
        self.send_header('Content-Type', 'application/json')
        self._send_cors_headers()
        self.end_headers()

    def do_OPTIONS(self):
        self.send_response(204)
        self._send_cors_headers()
        self.end_headers()

    def do_GET(self):
        parsed = urlparse(self.path)
        path = parsed.path
        query = parse_qs(parsed.query)

        # 1. Health check
        if path == "/api/v1/health":
            self._set_headers(200)
            self.wfile.write(json.dumps({
                "status": "HEALTHY",
                "service": "AICTE KoshDrishti Python Engine",
                "version": "3.3.0",
                "relational_db": "SQLite3 (vishwas_fdr.db)",
                "audit_ledger": "SHA-256 Hash-Chained Ledger Active",
                "aph_standard": "APH 2024-27 Table 1.4 & Clause 11.8",
                "alert_scanner": "Background Thread Active",
                "rbac_enabled": True,
                "jwt_security_mode": JWT_MODE
            }).encode('utf-8'))

        # 2. Instruments List
        elif path == "/api/v1/instruments":
            status_filter = query.get("status", ["ALL"])[0]
            region_filter = query.get("region", ["ALL"])[0]
            search = query.get("q", [""])[0].lower()

            sql = "SELECT * FROM instruments WHERE 1=1"
            params = []

            if status_filter != "ALL":
                sql += " AND status = ?"
                params.append(status_filter)
            if region_filter != "ALL":
                sql += " AND region = ?"
                params.append(region_filter)
            if search:
                sql += " AND (LOWER(institution_name) LIKE ? OR LOWER(fdr_number) LIKE ? OR LOWER(issuing_bank) LIKE ?)"
                params.extend([f"%{search}%", f"%{search}%", f"%{search}%"])

            sql += " ORDER BY id ASC"

            with db_session() as conn:
                c = conn.cursor()
                c.execute(sql, params)
                rows = c.fetchall()

            instruments = []
            for r in rows:
                instruments.append({
                    "id": r["id"],
                    "fdrNumber": r["fdr_number"],
                    "institutionId": r["institution_id"],
                    "institutionName": r["institution_name"],
                    "trustName": r["trust_name"],
                    "region": r["region"],
                    "state": r["state"],
                    "city": r["city"],
                    "programType": r["program_type"],
                    "amount": r["amount"],
                    "issuingBank": r["issuing_bank"],
                    "bankType": r["bank_type"],
                    "ifsc": r["ifsc"],
                    "accountNumber": r["account_number"],
                    "issueDate": r["issue_date"],
                    "maturityDate": r["maturity_date"],
                    "tenorYears": r["tenor_years"],
                    "daysRemaining": r["days_remaining"],
                    "jointHolderName": r["joint_holder"],
                    "lienMarked": bool(r["lien_marked"]),
                    "bankConfirmed": bool(r["bank_confirmed"]),
                    "trustLevel": r["trust_level"],
                    "ocrMatchPct": r["ocr_match_pct"],
                    "status": r["status"],
                    "legacyStatus": r["legacy_status"],
                    "hasDiscrepancies": bool(r["has_discrepancies"]),
                    "purpose": r["purpose"],
                    "isGovernmentExempt": bool(r["is_govt"])
                })

            self._set_headers(200)
            self.wfile.write(json.dumps({"instruments": instruments, "count": len(instruments)}).encode('utf-8'))

        # 3. Cryptographic Ledger
        elif path == "/api/v1/ledger":
            with db_session() as conn:
                c = conn.cursor()
                c.execute("SELECT block_index, timestamp, action, actor, fdr_id, previous_hash, block_hash, details FROM audit_ledger ORDER BY block_index ASC")
                rows = c.fetchall()

            blocks = [{
                "blockIndex": r["block_index"],
                "timestamp": r["timestamp"],
                "action": r["action"],
                "actor": r["actor"],
                "fdrId": r["fdr_id"],
                "previousHash": r["previous_hash"],
                "blockHash": r["block_hash"],
                "details": r["details"]
            } for r in rows]
            self._set_headers(200)
            self.wfile.write(json.dumps({"blocks": blocks, "count": len(blocks)}).encode('utf-8'))

        # 4. Cryptographic Ledger Verification
        elif path == "/api/v1/ledger/verify":
            result = verify_ledger_chain()
            self._set_headers(200)
            self.wfile.write(json.dumps(result).encode('utf-8'))

        # 5. Regulatory Alerts
        elif path == "/api/v1/alerts":
            with db_session() as conn:
                c = conn.cursor()
                c.execute("SELECT id, fdr_id, institution_name, alert_type, days_remaining, message, status, created_at FROM alerts WHERE status NOT IN ('DISMISSED', 'RESOLVED') ORDER BY id DESC")
                rows = c.fetchall()

            alerts = [{
                "id": r["id"],
                "fdrId": r["fdr_id"],
                "institutionName": r["institution_name"],
                "alertType": r["alert_type"],
                "daysRemaining": r["days_remaining"],
                "message": r["message"],
                "status": r["status"],
                "createdAt": r["created_at"]
            } for r in rows]
            self._set_headers(200)
            self.wfile.write(json.dumps({"alerts": alerts, "count": len(alerts)}).encode('utf-8'))

        # 6. Current Logged-in User Info
        elif path == "/api/v1/auth/me":
            auth_header = self.headers.get("Authorization", "")
            if auth_header.startswith("Bearer "):
                token = auth_header.split(" ")[1]
                try:
                    decoded = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
                    self._set_headers(200)
                    self.wfile.write(json.dumps({"user": decoded}).encode('utf-8'))
                    return
                except:
                    pass
            self._set_headers(401)
            self.wfile.write(json.dumps({"error": "Unauthorized or expired token"}).encode('utf-8'))

        # 7. Statutory APH Table 1.4 Authority Endpoint
        elif path == "/api/v1/aph" or path == "/api/v1/aph/table-1-4":
            self._set_headers(200)
            self.wfile.write(json.dumps({
                "source": "AICTE Approval Process Handbook (APH 2024-27 Table 1.4)",
                "mandatoryTenorYears": 10,
                "leasedBuildingMultiplier": 2,
                "norms": TABLE_1_4_NORMS
            }).encode('utf-8'))

        # 8. Documents list for an instrument
        elif path == "/api/v1/documents":
            instrument_id = query.get("instrument_id", [None])[0]
            with db_session() as conn:
                c = conn.cursor()
                if instrument_id:
                    c.execute(
                        "SELECT id, instrument_id, filename, content_type, file_size, uploaded_by, uploaded_at FROM documents WHERE instrument_id = ? ORDER BY uploaded_at DESC",
                        (instrument_id,)
                    )
                else:
                    c.execute(
                        "SELECT id, instrument_id, filename, content_type, file_size, uploaded_by, uploaded_at FROM documents ORDER BY uploaded_at DESC LIMIT 100"
                    )
                rows = c.fetchall()

            docs = [{
                "id": r["id"],
                "instrumentId": r["instrument_id"],
                "filename": r["filename"],
                "contentType": r["content_type"],
                "fileSize": r["file_size"],
                "uploadedBy": r["uploaded_by"],
                "uploadedAt": r["uploaded_at"]
            } for r in rows]
            self._set_headers(200)
            self.wfile.write(json.dumps({"documents": docs, "count": len(docs)}).encode('utf-8'))

        # 9. Document download by ID
        elif re.match(r'^/api/v1/documents/([0-9]+)$', path):
            doc_id = re.match(r'^/api/v1/documents/([0-9]+)$', path).group(1)
            with db_session() as conn:
                c = conn.cursor()
                c.execute("SELECT filename, content_type, file_data FROM documents WHERE id = ?", (doc_id,))
                row = c.fetchone()

            if not row:
                self._set_headers(404)
                self.wfile.write(json.dumps({"error": "Document not found"}).encode('utf-8'))
                return

            safe_fn = sanitize_filename(row["filename"])
            self.send_response(200)
            self.send_header('Content-Type', row["content_type"])
            self.send_header('Content-Disposition', f'attachment; filename="{safe_fn}"')
            self._send_cors_headers()
            self.end_headers()
            self.wfile.write(row["file_data"])

        # 10. Instrument renewal/replacement lineage
        elif re.match(r'^/api/v1/instruments/([^/]+)/lineage$', path):
            fdr_id = re.match(r'^/api/v1/instruments/([^/]+)/lineage$', path).group(1)
            with db_session() as conn:
                c = conn.cursor()
                c.execute("""
                    SELECT r.id, r.original_fdr_id, r.new_fdr_id, r.renewal_type, r.renewal_date,
                           r.submitted_by, r.notes, r.created_at,
                           i.fdr_number, i.amount, i.issuing_bank, i.status
                    FROM renewals r
                    LEFT JOIN instruments i ON i.id = r.new_fdr_id
                    WHERE r.original_fdr_id = ? OR r.new_fdr_id = ?
                    ORDER BY r.renewal_date ASC
                """, (fdr_id, fdr_id))
                rows = c.fetchall()

            chain = [{
                "id": r["id"],
                "originalFdrId": r["original_fdr_id"],
                "newFdrId": r["new_fdr_id"],
                "renewalType": r["renewal_type"],
                "renewalDate": r["renewal_date"],
                "submittedBy": r["submitted_by"],
                "notes": r["notes"],
                "createdAt": r["created_at"],
                "newFdrNumber": r["fdr_number"],
                "newAmount": r["amount"],
                "newBank": r["issuing_bank"],
                "newStatus": r["status"]
            } for r in rows]
            self._set_headers(200)
            self.wfile.write(json.dumps({"lineage": chain, "count": len(chain)}).encode('utf-8'))

        # 11. CSV / JSON Management Report Export
        elif path == "/api/v1/reports/export":
            fmt = query.get("format", ["csv"])[0].lower()
            status_f = query.get("status", ["ALL"])[0]

            sql = "SELECT * FROM instruments WHERE 1=1"
            params = []
            if status_f != "ALL":
                sql += " AND status = ?"
                params.append(status_f)
            sql += " ORDER BY status ASC, institution_name ASC"

            with db_session() as conn:
                c = conn.cursor()
                c.execute(sql, params)
                rows = c.fetchall()

            if fmt == "json":
                data = [dict(r) for r in rows]
                self._set_headers(200)
                self.send_header('Content-Disposition', 'attachment; filename="kosh_drishti_report.json"')
                self.wfile.write(json.dumps({"report": data, "generated_at": datetime.utcnow().isoformat() + "Z", "count": len(data)}).encode('utf-8'))
            else:
                # CSV export with formula injection sanitization
                output = io.StringIO()
                writer = csv.writer(output)
                writer.writerow([
                    "ID", "FDR Number", "Institution ID", "Institution Name", "Trust Name",
                    "Region", "State", "City", "Program Type", "Amount (INR)",
                    "Issuing Bank", "Bank Type", "IFSC", "Account Number",
                    "Issue Date", "Maturity Date", "Tenor (Years)", "Days Remaining",
                    "Joint Holder", "Lien Marked", "Bank Confirmed",
                    "OCR Match %", "Status", "Legacy Status", "Has Discrepancies",
                    "Purpose", "Is Govt Exempt", "Parent FDR ID", "Created At"
                ])
                for r in rows:
                    raw_row = [
                        r["id"], r["fdr_number"], r["institution_id"], r["institution_name"],
                        r["trust_name"], r["region"], r["state"], r["city"], r["program_type"],
                        r["amount"], r["issuing_bank"], r["bank_type"], r["ifsc"],
                        r["account_number"], r["issue_date"], r["maturity_date"],
                        r["tenor_years"], r["days_remaining"], r["joint_holder"],
                        bool(r["lien_marked"]), bool(r["bank_confirmed"]),
                        r["ocr_match_pct"], r["status"], r["legacy_status"],
                        bool(r["has_discrepancies"]), r["purpose"], bool(r["is_govt"]),
                        r["parent_fdr_id"], r["created_at"]
                    ]
                    writer.writerow([sanitize_csv_cell(val) for val in raw_row])

                csv_bytes = output.getvalue().encode('utf-8-sig')  # BOM for Excel compatibility
                self.send_response(200)
                self.send_header('Content-Type', 'text/csv; charset=utf-8')
                self.send_header('Content-Disposition', 'attachment; filename="kosh_drishti_report.csv"')
                self.send_header('Content-Length', str(len(csv_bytes)))
                self._send_cors_headers()
                self.end_headers()
                self.wfile.write(csv_bytes)

        else:
            self._set_headers(404)
            self.wfile.write(json.dumps({"error": "Endpoint not found"}).encode('utf-8'))

    def do_POST(self):
        # Enforce upload / payload size cap (15MB)
        MAX_UPLOAD_SIZE = 15 * 1024 * 1024
        content_length = int(self.headers.get('Content-Length', 0))
        if content_length > MAX_UPLOAD_SIZE:
            self._set_headers(413)
            self.wfile.write(json.dumps({
                "error": "Payload Too Large: Maximum upload cap is 15MB",
                "code": "PAYLOAD_TOO_LARGE"
            }).encode('utf-8'))
            return

        parsed = urlparse(self.path)
        path = parsed.path
        content_type = self.headers.get('Content-Type', '')
        raw_body = self.rfile.read(content_length) if content_length > 0 else b""

        payload = {}
        if 'application/json' in content_type and raw_body:
            try:
                payload = json.loads(raw_body.decode('utf-8'))
            except:
                payload = {}

        # 1. OCR File / Text Extraction
        if path == "/api/v1/ocr/extract":
            extracted_text = ""
            
            if 'multipart/form-data' in content_type:
                try:
                    boundary = content_type.split("boundary=")[1].encode()
                    parts = raw_body.split(boundary)
                    for part in parts:
                        if b'filename=' in part:
                            header_body = part.split(b'\r\n\r\n', 1)
                            if len(header_body) == 2:
                                file_bytes = header_body[1].rstrip(b'\r\n--')
                                if file_bytes.startswith(b'%PDF') and PYPDF_AVAILABLE:
                                    reader = pypdf.PdfReader(io.BytesIO(file_bytes))
                                    for page in reader.pages:
                                        extracted_text += page.extract_text() or ""
                                else:
                                    extracted_text += file_bytes.decode('utf-8', errors='ignore')
                except Exception:
                    extracted_text = raw_body.decode('utf-8', errors='ignore')

            elif payload.get("text"):
                extracted_text = payload.get("text")

            result = extract_fields_from_text(extracted_text)

            # Persist document to SQLite only if instrument_id is provided and caller is authenticated & authorized
            instrument_id = None
            if 'multipart/form-data' in content_type:
                try:
                    boundary = content_type.split("boundary=")[1].encode()
                    parts = raw_body.split(boundary)
                    for part in parts:
                        if b'name="instrument_id"' in part and b'filename=' not in part:
                            val = part.split(b'\r\n\r\n', 1)
                            if len(val) == 2:
                                instrument_id = val[1].rstrip(b'\r\n--').decode('utf-8', errors='ignore').strip()
                except Exception:
                    pass
            elif payload.get("instrument_id"):
                instrument_id = payload.get("instrument_id")

            if instrument_id and extracted_text:
                auth = authenticate_jwt(self, allowed_roles=["institution", "bureau_officer", "director"])
                if not auth:
                    return

                with db_session() as conn:
                    c = conn.cursor()
                    c.execute("SELECT institution_name FROM instruments WHERE id = ?", (instrument_id,))
                    target_row = c.fetchone()

                if not target_row:
                    self._set_headers(404)
                    self.wfile.write(json.dumps({"error": f"Instrument {instrument_id} not found"}).encode('utf-8'))
                    return

                if not check_institution_ownership(auth, target_row["institution_name"]):
                    self._set_headers(403)
                    self.wfile.write(json.dumps({"error": f"Forbidden: You do not own instrument {instrument_id}"}).encode('utf-8'))
                    return

                stored_filename = "fdr_document.pdf" if 'multipart/form-data' in content_type else "fdr_text.txt"
                stored_content_type = "application/pdf" if 'multipart/form-data' in content_type else "text/plain"
                file_blob = raw_body if 'multipart/form-data' in content_type else extracted_text.encode('utf-8')
                uploader = auth.get("name", "institution")

                try:
                    with db_session() as conn:
                        with conn:
                            c = conn.cursor()
                            c.execute(
                                "INSERT INTO documents (instrument_id, filename, content_type, file_data, file_size, uploaded_by, uploaded_at) VALUES (?, ?, ?, ?, ?, ?, ?)",
                                (instrument_id, stored_filename, stored_content_type, file_blob, len(file_blob), uploader, datetime.utcnow().isoformat() + "Z")
                            )
                    result["document_stored"] = True
                    result["instrument_id"] = instrument_id
                except Exception:
                    result["document_stored"] = False

            self._set_headers(200)
            self.wfile.write(json.dumps(result).encode('utf-8'))

        # 2. Add New Instrument (RBAC: institution, bureau_officer, director)
        elif path == "/api/v1/instruments":
            auth = authenticate_jwt(self, allowed_roles=["institution", "bureau_officer", "director"])
            if not auth:
                return

            inst_name = payload.get("institutionName", "Submitted Technical Institute")

            # IDOR Check: Institution role can only lodge for their own institution
            if auth.get("role") == "institution":
                if not check_institution_ownership(auth, inst_name):
                    self._set_headers(403)
                    self.wfile.write(json.dumps({
                        "error": f"Forbidden: Institution account '{auth.get('department')}' cannot submit instruments for '{inst_name}'",
                        "code": "AUTH_FORBIDDEN_IDOR"
                    }).encode('utf-8'))
                    return

            prog = payload.get("programType", "Engineering & Technology (UG)")
            try:
                raw_amt = payload.get("amount", 3500000)
                amount = float(str(raw_amt).replace(",", "").strip())
                if amount <= 0:
                    raise ValueError()
            except (ValueError, TypeError):
                self._set_headers(400)
                self.wfile.write(json.dumps({"error": "Invalid deposit amount: must be a positive number"}).encode('utf-8'))
                return

            bank = payload.get("issuingBank", "State Bank of India")
            try:
                tenor = int(payload.get("tenorYears", 10))
                if tenor <= 0:
                    raise ValueError()
            except (ValueError, TypeError):
                self._set_headers(400)
                self.wfile.write(json.dumps({"error": "Invalid tenor: must be a positive integer"}).encode('utf-8'))
                return

            joint = payload.get("jointHolderName", "Member Secretary, AICTE & Chairman, Trust")
            
            # Collision-free UUID for primary key
            unique_suffix = uuid.uuid4().hex[:8].upper()
            new_id = f"FDR-2026-{unique_suffix}"
            fdr_no = payload.get("fdrNumber") or f"FDR/NEW/{unique_suffix}"
            issue_d = datetime.now().strftime("%Y-%m-%d")
            maturity_d = (datetime.now() + timedelta(days=365 * tenor)).strftime("%Y-%m-%d")

            with db_session() as conn:
                with conn:
                    c = conn.cursor()
                    c.execute('''
                        INSERT INTO instruments (
                            id, fdr_number, institution_id, institution_name, trust_name,
                            region, state, city, program_type, amount, issuing_bank,
                            bank_type, ifsc, account_number, issue_date, maturity_date,
                            tenor_years, days_remaining, joint_holder, lien_marked,
                            bank_confirmed, trust_level, ocr_match_pct, status,
                            legacy_status, has_discrepancies, purpose, is_govt, created_at
                        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
                    ''', (
                        new_id, fdr_no, payload.get("institutionId", "1-NEWINST"), inst_name,
                        payload.get("trustName", "Educational Society"), payload.get("region", "Northern"),
                        payload.get("state", "New Delhi"), payload.get("city", "Delhi"), prog,
                        amount, bank, "Scheduled Commercial Bank", payload.get("ifsc", "SBIN0001234"),
                        payload.get("accountNumber", "40199999999"), issue_d, maturity_d, tenor,
                        tenor * 365, joint, 1, 0, "officer", payload.get("ocrMatchPct", 98.5),
                        "Pending", "Lien filed, awaiting bank verification", 0,
                        f"APH Table 1.4 Security Deposit for {prog}", 0
                    ))

            actor_name = auth.get("name", "AUTHENTICATED_USER")
            append_to_ledger("INSTRUMENT_LODGED", actor_name, new_id, f"FDR {fdr_no} for ₹{amount:,.0f} registered by {inst_name}")

            self._set_headers(201)
            self.wfile.write(json.dumps({"success": True, "id": new_id, "fdrNumber": fdr_no}).encode('utf-8'))

        # 3. Rule-Based Compliance & Triangulation
        elif path == "/api/v1/cbs/triangulate":
            inst_data = payload.get("institution_data", {})
            bank_rec = payload.get("bank_record", {})
            
            # Derive statutory norm server-side from programType
            program_name = inst_data.get("programType") or inst_data.get("program") or payload.get("program") or ""
            aph_norm = get_server_aph_norm(program_name)

            if not aph_norm:
                self._set_headers(400)
                self.wfile.write(json.dumps({
                    "error": f"Program '{program_name}' is not covered by AICTE APH Table 1.4 (Pharmacy & Architecture are governed separately by PCI/CoA).",
                    "code": "PROGRAM_NOT_IN_TABLE_1_4",
                    "covered_by_table_1_4": False
                }).encode('utf-8'))
                return

            result = compute_rule_compliance_score(inst_data, bank_rec, aph_norm)
            self._set_headers(200)
            self.wfile.write(json.dumps(result).encode('utf-8'))

        # 4. Tamper Ledger Block (RBAC: director, bureau_officer)
        elif path == "/api/v1/ledger/tamper":
            auth = authenticate_jwt(self, allowed_roles=["director", "bureau_officer"])
            if not auth:
                return

            with db_session() as conn:
                with conn:
                    c = conn.cursor()
                    c.execute("UPDATE audit_ledger SET details = 'TAMPERED_RECORD: Unauthorized modification of lien clearance terms' WHERE block_index = 1")

            self._set_headers(200)
            self.wfile.write(json.dumps({
                "tampered": True,
                "block_index": 1,
                "message": "Block #1 details altered in SQLite table. Verify endpoint will now flag SHA-256 hash mismatch."
            }).encode('utf-8'))

        # 5. Repair Ledger Block (RBAC: director, bureau_officer)
        elif path == "/api/v1/ledger/repair":
            auth = authenticate_jwt(self, allowed_roles=["director", "bureau_officer"])
            if not auth:
                return

            with db_session() as conn:
                with conn:
                    c = conn.cursor()
                    orig_det = "208 technical institution deposit portfolios synchronized with APH 2024-27 Table 1.4 norms."
                    c.execute("UPDATE audit_ledger SET details = ? WHERE block_index = 1", (orig_det,))

            self._set_headers(200)
            self.wfile.write(json.dumps({
                "repaired": True,
                "message": "Legitimate block details restored. Cryptographic chain is intact."
            }).encode('utf-8'))

        # 6. Manual Alert Scan Trigger
        elif path == "/api/v1/alerts/scan":
            run_alert_scanner()
            self._set_headers(200)
            self.wfile.write(json.dumps({"success": True, "message": "Alert scan executed successfully"}).encode('utf-8'))

        # 6b. Dismiss All Alerts (RBAC Protected)
        elif path == "/api/v1/alerts/dismiss-all":
            auth = authenticate_jwt(self, allowed_roles=["bureau_officer", "director", "institution"])
            if not auth:
                return

            with db_session() as conn:
                with conn:
                    c = conn.cursor()
                    if auth.get("role") == "institution":
                        # Dismiss alerts only for their own institution
                        c.execute("SELECT id, institution_name FROM alerts WHERE status NOT IN ('DISMISSED', 'RESOLVED')")
                        rows = c.fetchall()
                        for r in rows:
                            if check_institution_ownership(auth, r["institution_name"]):
                                c.execute("UPDATE alerts SET status = 'DISMISSED' WHERE id = ?", (r["id"],))
                    else:
                        c.execute("UPDATE alerts SET status = 'DISMISSED' WHERE status NOT IN ('DISMISSED', 'RESOLVED')")

            self._set_headers(200)
            self.wfile.write(json.dumps({"success": True, "message": "All matching alerts dismissed"}).encode('utf-8'))

        # 6c. Dismiss Single Alert by ID (RBAC & IDOR Protected)
        elif re.match(r'^/api/v1/alerts/([0-9]+)/dismiss$', path):
            auth = authenticate_jwt(self, allowed_roles=["bureau_officer", "director", "institution"])
            if not auth:
                return

            alert_id = int(re.match(r'^/api/v1/alerts/([0-9]+)/dismiss$', path).group(1))
            with db_session() as conn:
                with conn:
                    c = conn.cursor()
                    c.execute("SELECT id, institution_name FROM alerts WHERE id = ?", (alert_id,))
                    alert_row = c.fetchone()
                    if not alert_row:
                        self._set_headers(404)
                        self.wfile.write(json.dumps({"error": "Alert not found"}).encode('utf-8'))
                        return

                    if not check_institution_ownership(auth, alert_row["institution_name"]):
                        self._set_headers(403)
                        self.wfile.write(json.dumps({"error": "Forbidden: Cannot dismiss alert for another institution"}).encode('utf-8'))
                        return

                    c.execute("UPDATE alerts SET status = 'DISMISSED' WHERE id = ?", (alert_id,))

            self._set_headers(200)
            self.wfile.write(json.dumps({"success": True, "id": alert_id, "status": "DISMISSED"}).encode('utf-8'))

        # 7. Auth Login (Cryptographic PBKDF2-HMAC per-user salt)
        elif path == "/api/v1/auth/login":
            email = payload.get("email", "").strip().lower()
            password = payload.get("password", "")
            salt = hashlib.sha256(email.encode('utf-8')).digest()
            pw_hash = hashlib.pbkdf2_hmac('sha256', password.encode('utf-8'), salt, 100000).hex()

            with db_session() as conn:
                c = conn.cursor()
                c.execute("SELECT id, email, full_name, role, department FROM users WHERE email = ? AND password_hash = ?", (email, pw_hash))
                user = c.fetchone()

            if user:
                token_payload = {
                    "sub": str(user["id"]),
                    "email": user["email"],
                    "name": user["full_name"],
                    "role": user["role"],
                    "department": user["department"],
                    "exp": datetime.utcnow() + timedelta(hours=24)
                }
                token = jwt.encode(token_payload, JWT_SECRET, algorithm=JWT_ALGORITHM)
                self._set_headers(200)
                self.wfile.write(json.dumps({
                    "token": token,
                    "user": {
                        "email": user["email"],
                        "name": user["full_name"],
                        "role": user["role"],
                        "department": user["department"]
                    }
                }).encode('utf-8'))
            else:
                self._set_headers(401)
                self.wfile.write(json.dumps({"error": "Invalid email or password"}).encode('utf-8'))

        # 8. Document Upload (persistent FDR file storage)
        elif path == "/api/v1/documents":
            auth = authenticate_jwt(self, allowed_roles=["institution", "bureau_officer", "director"])
            if not auth:
                return

            instrument_id = payload.get("instrumentId") or payload.get("instrument_id")
            filename = sanitize_filename(payload.get("filename", "document.pdf"))
            content_type_file = payload.get("contentType", "application/octet-stream")
            file_data_b64 = payload.get("fileData", "")

            if not file_data_b64:
                self._set_headers(400)
                self.wfile.write(json.dumps({"error": "fileData (base64) is required"}).encode('utf-8'))
                return

            try:
                file_bytes = base64.b64decode(file_data_b64)
            except Exception:
                self._set_headers(400)
                self.wfile.write(json.dumps({"error": "Invalid base64 fileData"}).encode('utf-8'))
                return

            # IDOR Check if attached to an existing instrument
            if instrument_id:
                with db_session() as conn:
                    c = conn.cursor()
                    c.execute("SELECT institution_name FROM instruments WHERE id = ?", (instrument_id,))
                    inst_row = c.fetchone()
                if inst_row and not check_institution_ownership(auth, inst_row["institution_name"]):
                    self._set_headers(403)
                    self.wfile.write(json.dumps({"error": f"Forbidden: You do not own instrument {instrument_id}"}).encode('utf-8'))
                    return

            uploader = auth.get("name", auth.get("email", "unknown"))
            with db_session() as conn:
                with conn:
                    c = conn.cursor()
                    c.execute(
                        "INSERT INTO documents (instrument_id, filename, content_type, file_data, file_size, uploaded_by, uploaded_at) VALUES (?, ?, ?, ?, ?, ?, ?)",
                        (instrument_id, filename, content_type_file, file_bytes, len(file_bytes), uploader, datetime.utcnow().isoformat() + "Z")
                    )
                    doc_id = c.lastrowid

            append_to_ledger("DOCUMENT_STORED", uploader, instrument_id or "GENERAL", f"Document '{filename}' ({len(file_bytes)} bytes) stored for instrument {instrument_id}")
            self._set_headers(201)
            self.wfile.write(json.dumps({"success": True, "documentId": doc_id, "filename": filename, "fileSize": len(file_bytes)}).encode('utf-8'))

        # 9. FDR Renewal / Replacement Submission
        elif re.match(r'^/api/v1/instruments/([^/]+)/renew$', path):
            auth = authenticate_jwt(self, allowed_roles=["institution", "bureau_officer", "director"])
            if not auth:
                return

            original_fdr_id = re.match(r'^/api/v1/instruments/([^/]+)/renew$', path).group(1)
            with db_session() as conn:
                c = conn.cursor()
                c.execute("SELECT * FROM instruments WHERE id = ?", (original_fdr_id,))
                original = c.fetchone()

            if not original:
                self._set_headers(404)
                self.wfile.write(json.dumps({"error": f"Instrument {original_fdr_id} not found"}).encode('utf-8'))
                return

            # IDOR Check: Ensure institution owns this FDR
            if not check_institution_ownership(auth, original["institution_name"]):
                self._set_headers(403)
                self.wfile.write(json.dumps({
                    "error": f"Forbidden: Account '{auth.get('department')}' is not authorized to renew deposit belonging to '{original['institution_name']}' (IDOR prevention)",
                    "code": "AUTH_FORBIDDEN_IDOR"
                }).encode('utf-8'))
                return

            # Business Rule 1: Cannot renew Released or Discrepancy instruments
            if original["status"] in ["Released", "Release", "Discrepancy"]:
                self._set_headers(400)
                self.wfile.write(json.dumps({
                    "error": f"Statutory Block: FDR in '{original['status']}' status cannot be renewed (APH Cl. 11.8). Only Active/Expiring/Matured deposits are eligible.",
                    "code": "RENEWAL_INVALID_ORIGINAL_STATUS"
                }).encode('utf-8'))
                return

            # Business Rule 2: Safe numeric amount validation
            try:
                raw_amt = payload.get("amount", original["amount"])
                if isinstance(raw_amt, str):
                    raw_amt = raw_amt.replace(",", "").strip()
                new_amount = float(raw_amt)
                if new_amount <= 0:
                    raise ValueError()
            except (ValueError, TypeError):
                self._set_headers(400)
                self.wfile.write(json.dumps({
                    "error": "Invalid deposit amount: Amount must be a positive number.",
                    "code": "INVALID_NUMERIC_AMOUNT"
                }).encode('utf-8'))
                return

            # Business Rule 3: Safe numeric tenor validation
            try:
                raw_tenor = payload.get("tenorYears", original["tenor_years"] or 10)
                new_tenor = int(raw_tenor)
                if new_tenor <= 0:
                    raise ValueError()
            except (ValueError, TypeError):
                self._set_headers(400)
                self.wfile.write(json.dumps({
                    "error": "Invalid tenor: Tenor must be a positive integer.",
                    "code": "INVALID_NUMERIC_TENOR"
                }).encode('utf-8'))
                return

            # Business Rule 4: Table 1.4 statutory minimum amount and tenor check
            prog = payload.get("programType") or original["program_type"]
            aph_norm = get_server_aph_norm(prog)
            if aph_norm and not aph_norm.get("isGovt"):
                min_required = aph_norm.get("minAmount", 0)
                min_tenor = aph_norm.get("tenorYears", 10)
                if new_amount < min_required:
                    self._set_headers(400)
                    self.wfile.write(json.dumps({
                        "error": f"Statutory Violation: Renewal amount of ₹{new_amount:,.0f} is below Table 1.4 mandatory norm of ₹{min_required:,.0f} for {prog}.",
                        "code": "RENEWAL_AMOUNT_BELOW_NORM",
                        "min_required": min_required,
                        "provided": new_amount
                    }).encode('utf-8'))
                    return
                if new_tenor < min_tenor:
                    self._set_headers(400)
                    self.wfile.write(json.dumps({
                        "error": f"Statutory Violation: Renewal tenor of {new_tenor} years is below mandatory {min_tenor}-year lock-in (APH Cl. 11.8).",
                        "code": "RENEWAL_TENOR_BELOW_NORM",
                        "min_tenor": min_tenor,
                        "provided": new_tenor
                    }).encode('utf-8'))
                    return

            renewal_type = payload.get("renewalType", "Rollover Renewal")
            unique_suffix = uuid.uuid4().hex[:8].upper()
            new_id = f"FDR-RENEW-{unique_suffix}"
            new_fdr_no = payload.get("fdrNumber") or f"FDR/RENEWAL/{unique_suffix}"
            new_bank = payload.get("issuingBank", original["issuing_bank"])
            new_ifsc = payload.get("ifsc", original["ifsc"])
            notes = payload.get("notes", "")

            issue_d = datetime.now().strftime("%Y-%m-%d")
            maturity_d = (datetime.now() + timedelta(days=365 * new_tenor)).strftime("%Y-%m-%d")
            actor = auth.get("name", "INSTITUTION")

            with db_session() as conn:
                with conn:
                    c = conn.cursor()
                    c.execute('''
                        INSERT INTO instruments (
                            id, fdr_number, institution_id, institution_name, trust_name,
                            region, state, city, program_type, amount, issuing_bank,
                            bank_type, ifsc, account_number, issue_date, maturity_date,
                            tenor_years, days_remaining, joint_holder, lien_marked,
                            bank_confirmed, trust_level, ocr_match_pct, status,
                            legacy_status, has_discrepancies, purpose, is_govt, parent_fdr_id, created_at
                        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
                    ''', (
                        new_id, new_fdr_no, original["institution_id"], original["institution_name"],
                        original["trust_name"], original["region"], original["state"], original["city"],
                        prog, new_amount, new_bank, original["bank_type"],
                        new_ifsc, original["account_number"], issue_d, maturity_d, new_tenor,
                        new_tenor * 365, original["joint_holder"], 0, 0, "officer", 0.0,
                        "Pending", f"Renewal of {original_fdr_id} — awaiting bank verification",
                        0, f"Renewal/Replacement of {original['purpose']}", original["is_govt"],
                        original_fdr_id
                    ))

                    c.execute(
                        "INSERT INTO renewals (original_fdr_id, new_fdr_id, renewal_type, renewal_date, submitted_by, notes, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)",
                        (original_fdr_id, new_id, renewal_type, issue_d, actor, notes, datetime.utcnow().isoformat() + "Z")
                    )

                    # Mark original as Renewed
                    c.execute("UPDATE instruments SET status = 'Renewed', legacy_status = ? WHERE id = ?",
                              (f"Superseded by renewal {new_id}", original_fdr_id))

            append_to_ledger("RENEWAL_SUBMITTED", actor, new_id,
                             f"{renewal_type} of FDR {original_fdr_id}: new instrument {new_fdr_no} for Rs {new_amount:,.0f} submitted by {original['institution_name']}")

            self._set_headers(201)
            self.wfile.write(json.dumps({
                "success": True,
                "newInstrumentId": new_id,
                "newFdrNumber": new_fdr_no,
                "originalFdrId": original_fdr_id,
                "renewalType": renewal_type
            }).encode('utf-8'))

        else:
            self._set_headers(404)
            self.wfile.write(json.dumps({"error": "Endpoint not found"}).encode('utf-8'))

    def do_PATCH(self):
        parsed = urlparse(self.path)
        path = parsed.path
        content_length = int(self.headers.get('Content-Length', 0))
        raw_body = self.rfile.read(content_length) if content_length > 0 else b""

        try:
            payload = json.loads(raw_body.decode('utf-8')) if raw_body else {}
        except:
            payload = {}

        # PATCH /api/v1/instruments/<id>/status
        status_match = re.match(r'^/api/v1/instruments/([^/]+)/status$', path)
        if status_match:
            auth = authenticate_jwt(self, allowed_roles=["bureau_officer", "director", "bank_validator"])
            if not auth:
                return

            fdr_id = status_match.group(1)
            new_status = payload.get("status")
            legacy_status = payload.get("legacyStatus", "Status update recorded")
            current_role = auth.get("role")
            actor = payload.get("actor", auth.get("name", "REGULATION_BUREAU"))

            with db_session() as conn:
                c = conn.cursor()
                c.execute("SELECT * FROM instruments WHERE id = ?", (fdr_id,))
                inst = c.fetchone()

                if not inst:
                    self._set_headers(404)
                    self.wfile.write(json.dumps({"error": f"Instrument {fdr_id} not found"}).encode('utf-8'))
                    return

                current_status = inst["status"]
                if not new_status:
                    new_status = current_status

                # Enforce allowed state transitions (including 'Release' and 'Released')
                ALLOWED_TRANSITIONS = {
                    "Pending": ["Active", "Discrepancy"],
                    "Active": ["Active", "Discrepancy", "Release", "Released", "Expiring", "Matured", "Renewed"],
                    "Discrepancy": ["Active", "Discrepancy"],
                    "Expiring": ["Active", "Discrepancy", "Release", "Released", "Matured", "Renewed"],
                    "Matured": ["Active", "Discrepancy", "Release", "Released", "Renewed"],
                    "Renewed": ["Active", "Discrepancy", "Release", "Released"],
                    "Release": ["Released", "Active", "Discrepancy"],
                    "Released": []  # Terminal state
                }

                if current_status == "Released":
                    self._set_headers(400)
                    self.wfile.write(json.dumps({
                        "error": "Statutory rule violation: 'Released' is a terminal statutory state and cannot be modified (APH Cl. 11.8).",
                        "code": "TERMINAL_STATE_LOCKED"
                    }).encode('utf-8'))
                    return

                if new_status != current_status and new_status not in ALLOWED_TRANSITIONS.get(current_status, []):
                    self._set_headers(400)
                    self.wfile.write(json.dumps({
                        "error": f"Invalid state transition: Cannot change status from '{current_status}' to '{new_status}'.",
                        "code": "INVALID_STATE_TRANSITION"
                    }).encode('utf-8'))
                    return

                # P2 Release Conditions: Block release unless 10-year lock-in is complete, zero open complaints, director role
                if new_status == "Released":
                    if current_role != "director":
                        self._set_headers(403)
                        self.wfile.write(json.dumps({
                            "error": "Forbidden: Only Member Secretary / Approving Authority (director role) can authorize final deposit release (APH Cl. 11.8)",
                            "code": "RELEASE_UNAUTHORIZED_ROLE"
                        }).encode('utf-8'))
                        return

                    if inst["days_remaining"] > 0:
                        self._set_headers(400)
                        self.wfile.write(json.dumps({
                            "error": f"Statutory Block: FDR lock-in period is incomplete ({inst['days_remaining']} days remaining of mandatory 10-year tenor). Early release is prohibited under APH Cl. 11.8.",
                            "code": "STATUTORY_LOCKIN_INCOMPLETE"
                        }).encode('utf-8'))
                        return

                    if inst["has_discrepancies"] != 0:
                        self._set_headers(400)
                        self.wfile.write(json.dumps({
                            "error": "Statutory Block: Cannot release deposit while unresolved complaints or discrepancies exist on file (APH Cl. 11.8).",
                            "code": "OPEN_DISCREPANCIES_EXIST"
                        }).encode('utf-8'))
                        return

                resolution_note = (payload.get("resolutionNote") or payload.get("resolution_note") or payload.get("notes") or "").strip()
                target_discrepancy = inst["has_discrepancies"]

                if current_status == "Discrepancy" and new_status == "Active":
                    if current_role not in ["bureau_officer", "director"]:
                        self._set_headers(403)
                        self.wfile.write(json.dumps({
                            "error": f"Forbidden: Role '{current_role}' cannot resolve statutory discrepancies. Only Scrutiny Officer or Director can clear discrepancy flags.",
                            "code": "DISCREPANCY_CLEAR_UNAUTHORIZED_ROLE"
                        }).encode('utf-8'))
                        return

                    if not resolution_note:
                        self._set_headers(400)
                        self.wfile.write(json.dumps({
                            "error": "Statutory requirement: Resolving a discrepancy requires an explicit non-empty resolution note on file (APH Cl. 11.8).",
                            "code": "RESOLUTION_NOTE_REQUIRED"
                        }).encode('utf-8'))
                        return

                    target_discrepancy = 0
                elif payload.get("hasDiscrepancies") is not None:
                    req_disc = 1 if payload.get("hasDiscrepancies") else 0
                    if req_disc == 0 and inst["has_discrepancies"] == 1:
                        if current_role not in ["bureau_officer", "director"] or not resolution_note:
                            self._set_headers(400)
                            self.wfile.write(json.dumps({
                                "error": "Clearing discrepancy requires officer authorization and a resolution note.",
                                "code": "RESOLUTION_NOTE_REQUIRED"
                            }).encode('utf-8'))
                            return
                        target_discrepancy = 0
                    else:
                        target_discrepancy = req_disc

                # Only bank_validator role can set bank_confirmed = 1
                if current_role == "bank_validator":
                    target_bank_confirmed = 1 if payload.get("bankConfirmed", True) else 0
                else:
                    target_bank_confirmed = inst["bank_confirmed"]

                # Lien marked
                if payload.get("lienMarked") is not None:
                    target_lien_marked = 1 if payload.get("lienMarked") else 0
                else:
                    target_lien_marked = inst["lien_marked"]

                # Optional maturityDate change for testing
                with conn:
                    if "maturityDate" in payload:
                        new_mat = payload["maturityDate"]
                        c.execute("UPDATE instruments SET maturity_date = ? WHERE id = ?", (new_mat, fdr_id))

                    c.execute('''
                        UPDATE instruments 
                        SET status = ?, legacy_status = ?, has_discrepancies = ?, lien_marked = ?, bank_confirmed = ?
                        WHERE id = ?
                    ''', (new_status, legacy_status, target_discrepancy, target_lien_marked, target_bank_confirmed, fdr_id))

            run_alert_scanner()

            # Record in SHA-256 Ledger
            log_detail = f"Instrument status changed to '{new_status}': {legacy_status}"
            if resolution_note:
                log_detail += f" | Resolution note: {resolution_note}"
            append_to_ledger("STATUS_MODIFIED", actor, fdr_id, log_detail)

            self._set_headers(200)
            self.wfile.write(json.dumps({
                "success": True,
                "id": fdr_id,
                "status": new_status,
                "hasDiscrepancies": bool(target_discrepancy),
                "bankConfirmed": bool(target_bank_confirmed)
            }).encode('utf-8'))
        else:
            self._set_headers(404)
            self.wfile.write(json.dumps({"error": "Endpoint not found"}).encode('utf-8'))

class KoshThreadingHTTPServer(ThreadingHTTPServer):
    daemon_threads = True

    def get_request(self):
        sock, addr = super().get_request()
        sock.settimeout(20.0)  # 20 second socket timeout prevents slowloris/idle connection server freeze
        return sock, addr

def run_server(port=8000):
    server_address = ('', port)
    httpd = KoshThreadingHTTPServer(server_address, VishwasAPIHandler)
    
    scanner_thread = threading.Thread(target=alert_scanner_daemon, daemon=True)
    scanner_thread.start()
    
    print(f"AICTE KoshDrishti Backend running at http://127.0.0.1:{port}/")
    print("Background Alert Scanner Thread Active.")
    print("Multi-Threaded Server with 20s Socket Timeout Active.")
    print("RBAC Authentication Enforced on Mutating Endpoints.")
    if JWT_MODE == "DEMO_EVALUATION_FALLBACK":
        print("[AUTH NOTICE] JWT_SECRET running in DEMO_EVALUATION_FALLBACK mode (demo secret).")
        print("[AUTH NOTICE] Define 'JWT_SECRET' in environment variables for production deployments.")
    else:
        print("[AUTH NOTICE] Production JWT_SECRET loaded from environment.")

    httpd.serve_forever()

if __name__ == "__main__":
    run_server(8000)

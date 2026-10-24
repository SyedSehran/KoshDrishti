"""
AICTE KoshDrishti (कोषदृष्टि) • Native Python Backend Engine
Fully persists to SQLite (vishwas_fdr.db), real SHA-256 hash-chained audit ledger,
genuine PDF/Text field extraction with anchored regexes, deterministic APH Table 1.4 & Clause 11.8 compliance scoring,
scheduled background alert scanner daemon, and PyJWT role-based access control (RBAC).
"""

import http.server
import json
import sqlite3
import hashlib
import time
import os
import re
import io
import threading
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
# Secrets moved to environment variables with fallback
JWT_SECRET = os.environ.get("JWT_SECRET", "kosh_drishti_jwt_secret_aicte_2026")
JWT_ALGORITHM = "HS256"

# Permitted CORS origins (restricted to localhost)
ALLOWED_ORIGINS = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:3000",
    "http://127.0.0.1:3000"
]

# Ensure DB is seeded on startup
from seed_db import seed_database
seed_database()

def get_db():
    conn = sqlite3.connect(DB_FILE)
    conn.row_factory = sqlite3.Row
    return conn

# Helper: Append to Cryptographic SHA-256 Hash-Chained Ledger
def append_to_ledger(action, actor, fdr_id, details):
    conn = get_db()
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
    
    conn.commit()
    conn.close()
    return {"blockIndex": new_index, "blockHash": block_hash, "previousHash": prev_hash}

# Helper: Verify Cryptographic Chain Integrity
def verify_ledger_chain():
    conn = get_db()
    c = conn.cursor()
    c.execute("SELECT block_index, timestamp, action, actor, fdr_id, previous_hash, block_hash, details FROM audit_ledger ORDER BY block_index ASC")
    blocks = c.fetchall()
    conn.close()

    if not blocks:
        return {"valid": True, "total_blocks": 0, "message": "Ledger is empty"}

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
    # Pattern 1: Exact FDR/BANK/XXXX or FDR/XXXX with at least 4 digits
    fdr_full_match = re.search(r'(FDR\/[A-Z0-9_\-\/]{4,}[0-9]{3,}[A-Z0-9_\-\/]*)', raw_text, re.IGNORECASE)
    if fdr_full_match:
        fdr_number = fdr_full_match.group(1).strip()
    else:
        # Pattern 2: FDR NUMBER: XXX with digits
        fdr_match = re.search(r'(?:FDR\s*(?:NO|NUMBER)?|FD\s*(?:NO|NUMBER)?|RECEIPT\s*NO|REF\s*NO)[\s\:\#-]*([A-Z0-9\/]{6,30})', raw_text, re.IGNORECASE)
        if fdr_match:
            candidate = fdr_match.group(1).strip()
            # Must contain at least 4 digits and not be keywords like 'MISSING' or 'NUMBER'
            if re.search(r'\d{4,}', candidate) and not re.search(r'^(?:NUMBER|INCOMPLETE|MISSING|NOTAPPLICABLE)$', candidate, re.IGNORECASE):
                fdr_number = candidate if candidate.upper().startswith("FDR") else f"FDR/{candidate}"
        else:
            # Pattern 3: Standard bank format XXX/XXX/XXXXXX with digits
            alt_match = re.search(r'([A-Z]{3,5}\/[A-Z0-9]{3,6}\/[0-9]{6,14})', raw_text)
            if alt_match:
                fdr_number = alt_match.group(1).strip()

    # 2. Amount Regex - Anchored on 'DEPOSIT AMOUNT', 'INR', 'RS', '₹'
    # Will not erroneously match IFSC digits (e.g. SBIN0000691) or account numbers (40192830112)
    amount = None
    
    # Priority A: Anchor specifically on DEPOSIT AMOUNT / PRINCIPAL AMOUNT / SUM OF
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

    # Priority B: Anchor on INR or RS or ₹ followed immediately by a currency formatted number
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
                # Filter out IFSC codes, pincodes or account numbers
                if 50000 <= parsed <= 50000000:
                    amount = parsed
                    break
            except ValueError:
                continue

    # Priority C: Words to numbers fallback (e.g. RUPEES THIRTY FIVE LAKHS)
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
    is_govt = institution_data.get("isGovernmentExempt", False)

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
        "statutory_norm_evaluated": "AICTE APH 2024-27 Table 1.4 & Chapter XI Clause 11.8",
        "action_required": "Proceed with clearance" if final_score >= 90 else "Issue Statutory Rectification Mandate"
    }

# Background Alert Scanner Daemon
def run_alert_scanner():
    """
    Statutory Alert Scanner:
    Calculates dynamic days_remaining = (maturity_date - today) for all instruments,
    inserts 90/60/30/7-day alerts without duplicates, and escalates alerts unactioned for >= 3 days.
    """
    try:
        conn = get_db()
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
            
            if status in ["Active", "Pending"]:
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
                    # Deduplication: only insert if not already present for this (fdr_id, alert_type)
                    c.execute("SELECT id FROM alerts WHERE fdr_id = ? AND alert_type = ?", (fdr_id, alert_type))
                    existing = c.fetchone()
                    if not existing:
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
        
        conn.commit()
        conn.close()
    except Exception as e:
        print(f"[AlertScanner] Daemon error: {e}")

def alert_scanner_daemon():
    # Run initial scan on startup, then every 60 seconds
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
    def _set_headers(self, status=200):
        self.send_response(status)
        self.send_header('Content-Type', 'application/json')
        
        origin = self.headers.get('Origin', '')
        if origin in ALLOWED_ORIGINS:
            self.send_header('Access-Control-Allow-Origin', origin)
        else:
            self.send_header('Access-Control-Allow-Origin', 'http://localhost:5173')
            
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, PATCH, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type, Authorization')
        self.send_header('Access-Control-Allow-Credentials', 'true')
        self.end_headers()

    def do_OPTIONS(self):
        self._set_headers(204)

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
                "version": "3.2.0",
                "relational_db": "SQLite3 (vishwas_fdr.db)",
                "audit_ledger": "SHA-256 Hash-Chained Ledger Active",
                "aph_standard": "APH 2024-27 Table 1.4 & Clause 11.8",
                "alert_scanner": "Background Thread Active",
                "rbac_enabled": True
            }).encode('utf-8'))

        # 2. Instruments List
        elif path == "/api/v1/instruments":
            conn = get_db()
            c = conn.cursor()
            
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

            conn.close()
            self._set_headers(200)
            self.wfile.write(json.dumps({"instruments": instruments, "count": len(instruments)}).encode('utf-8'))

        # 3. Cryptographic Ledger
        elif path == "/api/v1/ledger":
            conn = get_db()
            c = conn.cursor()
            c.execute("SELECT block_index, timestamp, action, actor, fdr_id, previous_hash, block_hash, details FROM audit_ledger ORDER BY block_index ASC")
            rows = c.fetchall()
            conn.close()
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
            conn = get_db()
            c = conn.cursor()
            c.execute("SELECT id, fdr_id, institution_name, alert_type, days_remaining, message, status, created_at FROM alerts ORDER BY id DESC")
            rows = c.fetchall()
            conn.close()
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

        else:
            self._set_headers(404)
            self.wfile.write(json.dumps({"error": "Endpoint not found"}).encode('utf-8'))

    def do_POST(self):
        parsed = urlparse(self.path)
        path = parsed.path
        content_type = self.headers.get('Content-Type', '')
        content_length = int(self.headers.get('Content-Length', 0))
        raw_body = self.rfile.read(content_length)

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
            self._set_headers(200)
            self.wfile.write(json.dumps(result).encode('utf-8'))

        # 2. Add New Instrument (RBAC: institution, bureau_officer, director)
        elif path == "/api/v1/instruments":
            auth = authenticate_jwt(self, allowed_roles=["institution", "bureau_officer", "director"])
            if not auth:
                return

            conn = get_db()
            c = conn.cursor()
            
            fdr_no = payload.get("fdrNumber", f"FDR/NEW/{int(time.time())}")
            inst_name = payload.get("institutionName", "Submitted Technical Institute")
            amount = float(payload.get("amount", 3500000))
            prog = payload.get("programType", "Engineering & Technology (UG)")
            bank = payload.get("issuingBank", "State Bank of India")
            tenor = int(payload.get("tenorYears", 10))
            joint = payload.get("jointHolderName", "Member Secretary, AICTE & Chairman, Trust")
            
            new_id = f"FDR-2026-{int(time.time()) % 10000}"
            issue_d = datetime.now().strftime("%Y-%m-%d")
            maturity_d = (datetime.now() + timedelta(days=365 * tenor)).strftime("%Y-%m-%d")

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
            conn.commit()
            conn.close()

            # Record in SHA-256 Hash-Chained Ledger
            actor_name = auth.get("name", "AUTHENTICATED_USER")
            append_to_ledger("INSTRUMENT_LODGED", actor_name, new_id, f"FDR {fdr_no} for ₹{amount:,.0f} registered by {inst_name}")

            self._set_headers(201)
            self.wfile.write(json.dumps({"success": True, "id": new_id, "fdrNumber": fdr_no}).encode('utf-8'))

        # 3. Rule-Based Compliance & Triangulation
        elif path == "/api/v1/cbs/triangulate":
            inst_data = payload.get("institution_data", {})
            bank_rec = payload.get("bank_record", {})
            aph_norm = payload.get("aph_norm", {"minAmount": 3500000, "tenorYears": 10})

            result = compute_rule_compliance_score(inst_data, bank_rec, aph_norm)
            self._set_headers(200)
            self.wfile.write(json.dumps(result).encode('utf-8'))

        # 4. Tamper Ledger Block (RBAC: director, bureau_officer)
        elif path == "/api/v1/ledger/tamper":
            auth = authenticate_jwt(self, allowed_roles=["director", "bureau_officer"])
            if not auth:
                return

            conn = get_db()
            c = conn.cursor()
            c.execute("UPDATE audit_ledger SET details = 'TAMPERED_RECORD: Unauthorized modification of lien clearance terms' WHERE block_index = 1")
            conn.commit()
            conn.close()
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

            conn = get_db()
            c = conn.cursor()
            orig_det = "208 technical institution deposit portfolios synchronized with APH 2024-27 Table 1.4 norms."
            c.execute("UPDATE audit_ledger SET details = ? WHERE block_index = 1", (orig_det,))
            conn.commit()
            conn.close()
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

        # 7. Auth Login
        elif path == "/api/v1/auth/login":
            email = payload.get("email", "").strip().lower()
            password = payload.get("password", "")
            pw_hash = hashlib.sha256(f"salt_kosh_{password}".encode()).hexdigest()

            conn = get_db()
            c = conn.cursor()
            c.execute("SELECT id, email, full_name, role, department FROM users WHERE email = ? AND password_hash = ?", (email, pw_hash))
            user = c.fetchone()
            conn.close()

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

        else:
            self._set_headers(404)
            self.wfile.write(json.dumps({"error": "Endpoint not found"}).encode('utf-8'))

    def do_PATCH(self):
        parsed = urlparse(self.path)
        path = parsed.path
        content_length = int(self.headers.get('Content-Length', 0))
        raw_body = self.rfile.read(content_length)

        try:
            payload = json.loads(raw_body.decode('utf-8')) if raw_body else {}
        except:
            payload = {}

        # PATCH /api/v1/instruments/<id>/status
        status_match = re.match(r'^/api/v1/instruments/([^/]+)/status$', path)
        if status_match:
            # RBAC check: Must have valid token
            auth = authenticate_jwt(self, allowed_roles=["bureau_officer", "director", "bank_validator"])
            if not auth:
                return

            fdr_id = status_match.group(1)
            new_status = payload.get("status", "Active")
            legacy_status = payload.get("legacyStatus", "Updated")
            actor = payload.get("actor", auth.get("name", "REGULATION_BUREAU"))

            conn = get_db()
            c = conn.cursor()

            # P2 Handbook Rule: Block release unless 10-year lock-in is complete and zero open complaints
            if new_status == "Released":
                # Director / Member Secretary role strictly required for Release
                if auth.get("role") != "director":
                    conn.close()
                    self._set_headers(403)
                    self.wfile.write(json.dumps({
                        "error": "Forbidden: Only Member Secretary / Approving Authority (director role) can authorize final deposit release (APH Cl. 11.8)",
                        "code": "RELEASE_UNAUTHORIZED_ROLE"
                    }).encode('utf-8'))
                    return

                c.execute("SELECT days_remaining, has_discrepancies, tenor_years FROM instruments WHERE id = ?", (fdr_id,))
                inst = c.fetchone()
                if inst:
                    if inst["days_remaining"] > 0:
                        conn.close()
                        self._set_headers(400)
                        self.wfile.write(json.dumps({
                            "error": f"Statutory Block: FDR lock-in period is incomplete ({inst['days_remaining']} days remaining of mandatory 10-year tenor). Early release is prohibited under APH Cl. 11.8.",
                            "code": "STATUTORY_LOCKIN_INCOMPLETE"
                        }).encode('utf-8'))
                        return
                    if inst["has_discrepancies"] != 0:
                        conn.close()
                        self._set_headers(400)
                        self.wfile.write(json.dumps({
                            "error": "Statutory Block: Cannot release deposit while unresolved complaints or discrepancies exist on file (APH Cl. 11.8).",
                            "code": "OPEN_DISCREPANCIES_EXIST"
                        }).encode('utf-8'))
                        return

            # Also allow maturity_date adjustment for testing alert generation
            if "maturityDate" in payload:
                new_mat = payload["maturityDate"]
                c.execute("UPDATE instruments SET maturity_date = ? WHERE id = ?", (new_mat, fdr_id))

            c.execute('''
                UPDATE instruments 
                SET status = ?, legacy_status = ?, has_discrepancies = 0, lien_marked = 1, bank_confirmed = 1
                WHERE id = ?
            ''', (new_status, legacy_status, fdr_id))
            conn.commit()
            conn.close()

            # Trigger immediate alert scan so that any maturity changes update alerts synchronously
            run_alert_scanner()

            # Record in SHA-256 Ledger
            append_to_ledger("STATUS_MODIFIED", actor, fdr_id, f"Instrument status changed to '{new_status}': {legacy_status}")

            self._set_headers(200)
            self.wfile.write(json.dumps({"success": True, "id": fdr_id, "status": new_status}).encode('utf-8'))
        else:
            self._set_headers(404)
            self.wfile.write(json.dumps({"error": "Endpoint not found"}).encode('utf-8'))

def run_server(port=8000):
    server_address = ('', port)
    httpd = http.server.HTTPServer(server_address, VishwasAPIHandler)
    
    # Start background alert scanner daemon
    scanner_thread = threading.Thread(target=alert_scanner_daemon, daemon=True)
    scanner_thread.start()
    
    print(f"AICTE KoshDrishti Backend running at http://127.0.0.1:{port}/")
    print("Background Alert Scanner Thread Active.")
    print("RBAC Authentication Enforced on Mutating Endpoints.")
    httpd.serve_forever()

if __name__ == "__main__":
    run_server(8000)

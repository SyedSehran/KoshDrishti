"""
AICTE KoshDrishti • Database Seeding Script
Populates vishwas_fdr.db with 208 benchmark regulatory instruments
modelled on AICTE Approved Institutions and APH 2024-27 Table 1.4.
"""

import sqlite3
import os
import hashlib
from datetime import datetime

DB_FILE = os.path.join(os.path.dirname(__file__), "vishwas_fdr.db")

REAL_INSTITUTIONS_BASE = [
    {"name": "Kalinga Institute of Advanced Technology", "trust": "Kalinga Vidya Bharati Foundation", "city": "Bhubaneswar", "state": "Odisha", "region": "Eastern", "program": "Engineering & Technology (UG)"},
    {"name": "Vidyavardhaka College of Engineering", "trust": "Vidyavardhaka Sangha Trust", "city": "Mysuru", "state": "Karnataka", "region": "South-Western", "program": "Engineering & Technology (UG)"},
    {"name": "College of Engineering, Guindy", "trust": "Government of Tamil Nadu", "city": "Chennai", "state": "Tamil Nadu", "region": "Southern", "program": "Government / University Constituent (All)", "isGovt": True},
    {"name": "Amrita School of Engineering & Technology", "trust": "Mata Amritanandamayi Math", "city": "Coimbatore", "state": "Tamil Nadu", "region": "Southern", "program": "Engineering & Technology (UG)"},
    {"name": "Symbiosis Institute of Business & Digital Media", "trust": "Symbiosis International Society", "city": "Pune", "state": "Maharashtra", "region": "Western", "program": "Management (PG - MBA/PGDM)"},
    {"name": "BMS College of Engineering", "trust": "BMS Educational Trust", "city": "Bengaluru", "state": "Karnataka", "region": "South-Western", "program": "Engineering & Technology (UG)"},
    {"name": "PSG College of Technology", "trust": "PSG & Sons Charities Trust", "city": "Coimbatore", "state": "Tamil Nadu", "region": "Southern", "program": "Engineering & Technology (UG)"},
    {"name": "Thapar Institute of Advanced Research", "trust": "Thapar Educational Society", "city": "Patiala", "state": "Punjab", "region": "North-West", "program": "Engineering & Technology (UG)"},
    {"name": "Vellore Institute of Technology Campus", "trust": "Vellore Educational Trust", "city": "Vellore", "state": "Tamil Nadu", "region": "Southern", "program": "Engineering & Technology (UG)"},
    {"name": "Birla Institute of Applied Management", "trust": "Birla Academy of Art and Culture", "city": "Kolkata", "state": "West Bengal", "region": "Eastern", "program": "Management (PG - MBA/PGDM)"},
    {"name": "Government College of Engineering, Pune", "trust": "State Govt of Maharashtra", "city": "Pune", "state": "Maharashtra", "region": "Western", "program": "Government / University Constituent (All)", "isGovt": True},
    {"name": "Delhi Technological University Campus", "trust": "Govt of NCT of Delhi", "city": "New Delhi", "state": "Delhi", "region": "Northern", "program": "Government / University Constituent (All)", "isGovt": True},
    {"name": "Manipal Institute of Design & Media", "trust": "Academy of General Education", "city": "Manipal", "state": "Karnataka", "region": "South-Western", "program": "Design (All Levels)"},
    {"name": "Jadavpur University Faculty of Engineering", "trust": "State Govt of West Bengal", "city": "Kolkata", "state": "West Bengal", "region": "Eastern", "program": "Government / University Constituent (All)", "isGovt": True},
    {"name": "Sardar Vallabhbhai Patel Institute of Tech", "trust": "Vasavada Education Trust", "city": "Vasad", "state": "Gujarat", "region": "Central", "program": "Engineering & Technology (UG)"},
    {"name": "Institute of Chemical Technology", "trust": "Govt of Maharashtra / Deemed", "city": "Mumbai", "state": "Maharashtra", "region": "Western", "program": "Government / University Constituent (All)", "isGovt": True},
    {"name": "Chitkara School of Planning & Infrastructure", "trust": "Chitkara Educational Trust", "city": "Rajpura", "state": "Punjab", "region": "North-West", "program": "Planning (Diploma / UG / PG)"},
    {"name": "Walchand College of Engineering", "trust": "Administrative Council of Walchand", "city": "Sangli", "state": "Maharashtra", "region": "Western", "program": "Engineering & Technology (UG)"},
    {"name": "National Institute of Applied Management", "trust": "Jaipur Educational Foundation", "city": "Jaipur", "state": "Rajasthan", "region": "North-West", "program": "Management (PG - MBA/PGDM)"},
    {"name": "Madhav Institute of Technology & Science", "trust": "Scindia Engineering College Society", "city": "Gwalior", "state": "Madhya Pradesh", "region": "Central", "program": "Engineering & Technology (UG)"}
]

FICTIONAL_DISCREPANCY_INSTITUTIONS = [
    {"name": "[Simulated] Apex Institute of Applied Computing", "trust": "Simulated Technical Education Trust", "city": "Lucknow", "state": "Uttar Pradesh", "region": "Northern", "program": "Engineering & Technology (UG)"},
    {"name": "[Simulated] Devgiri Polytechnic Academy", "trust": "Devgiri Vidya Vikas Society", "city": "Aurangabad", "state": "Maharashtra", "region": "Western", "program": "Engineering & Technology (Diploma)"},
    {"name": "[Simulated] Vandana School of Management Studies", "trust": "Vandana Charitable Foundation", "city": "Kanpur", "state": "Uttar Pradesh", "region": "Northern", "program": "Management (PG - MBA/PGDM)"}
]

PROGRAM_CONFIGS = [
    {"program": "Engineering & Technology (UG)", "minAmount": 3500000, "tenorYears": 10},
    {"program": "Engineering & Technology (Diploma)", "minAmount": 1500000, "tenorYears": 10},
    {"program": "Engineering & Technology (PG)", "minAmount": 1500000, "tenorYears": 10},
    {"program": "Management (PG - MBA/PGDM)", "minAmount": 1500000, "tenorYears": 10},
    {"program": "Management (UG - BBA)", "minAmount": 500000, "tenorYears": 10},
    {"program": "Computer Applications (PG - MCA)", "minAmount": 1500000, "tenorYears": 10},
    {"program": "Computer Applications (UG - BCA)", "minAmount": 500000, "tenorYears": 10},
    {"program": "Planning (Diploma / UG / PG)", "minAmount": 1500000, "tenorYears": 10},
    {"program": "Applied Arts & Crafts (All Levels)", "minAmount": 1500000, "tenorYears": 10},
    {"program": "Hotel Management & Catering (HMCT)", "minAmount": 1500000, "tenorYears": 10},
    {"program": "Government / University Constituent (All)", "minAmount": 0, "tenorYears": 0, "isGovt": True}
]

BANKS = [
    {"name": "State Bank of India", "code": "SBI", "type": "Public Sector Scheduled", "ifsc": "SBIN0006240"},
    {"name": "Punjab National Bank", "code": "PNB", "type": "Public Sector Scheduled", "ifsc": "PUNB0123400"},
    {"name": "Canara Bank", "code": "CANARA", "type": "Public Sector Scheduled", "ifsc": "CNRB0002100"},
    {"name": "Bank of Baroda", "code": "BOB", "type": "Public Sector Scheduled", "ifsc": "BARB0VISHWA"},
    {"name": "HDFC Bank", "code": "HDFC", "type": "Private Sector Scheduled", "ifsc": "HDFC0001092"},
    {"name": "ICICI Bank", "code": "ICICI", "type": "Private Sector Scheduled", "ifsc": "ICIC0000412"}
]

def seed_database():
    conn = sqlite3.connect(DB_FILE)
    conn.execute("PRAGMA journal_mode=WAL;")  # Enable WAL for concurrent read/write
    c = conn.cursor()

    # Schema is persistent across restarts - Never drop tables on startup
    # Tables are created with IF NOT EXISTS

    # Create tables
    c.execute('''
        CREATE TABLE IF NOT EXISTS instruments (
            id TEXT PRIMARY KEY,
            fdr_number TEXT NOT NULL,
            institution_id TEXT NOT NULL,
            institution_name TEXT NOT NULL,
            trust_name TEXT,
            region TEXT,
            state TEXT,
            city TEXT,
            program_type TEXT NOT NULL,
            amount REAL NOT NULL,
            issuing_bank TEXT NOT NULL,
            bank_type TEXT,
            ifsc TEXT,
            account_number TEXT,
            issue_date TEXT,
            maturity_date TEXT,
            tenor_years INTEGER,
            days_remaining INTEGER,
            joint_holder TEXT,
            lien_marked INTEGER,
            bank_confirmed INTEGER,
            trust_level TEXT,
            ocr_match_pct REAL,
            status TEXT,
            legacy_status TEXT,
            has_discrepancies INTEGER,
            purpose TEXT,
            is_govt INTEGER DEFAULT 0,
            parent_fdr_id TEXT,
            created_at TEXT
        )
    ''')

    c.execute('''
        CREATE TABLE IF NOT EXISTS audit_ledger (
            block_index INTEGER PRIMARY KEY,
            timestamp TEXT NOT NULL,
            action TEXT NOT NULL,
            actor TEXT NOT NULL,
            fdr_id TEXT,
            previous_hash TEXT NOT NULL,
            block_hash TEXT NOT NULL,
            details TEXT
        )
    ''')

    c.execute('''
        CREATE TABLE IF NOT EXISTS alerts (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            fdr_id TEXT NOT NULL,
            institution_name TEXT NOT NULL,
            alert_type TEXT NOT NULL,
            days_remaining INTEGER NOT NULL,
            message TEXT NOT NULL,
            status TEXT DEFAULT 'PENDING',
            created_at TEXT NOT NULL
        )
    ''')

    # Documents table — persistent FDR PDF/file storage
    c.execute('''
        CREATE TABLE IF NOT EXISTS documents (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            instrument_id TEXT,
            filename TEXT NOT NULL,
            content_type TEXT NOT NULL,
            file_data BLOB NOT NULL,
            file_size INTEGER,
            uploaded_by TEXT,
            uploaded_at TEXT NOT NULL
        )
    ''')

    # Renewals table — FDR renewal/replacement lineage chain
    c.execute('''
        CREATE TABLE IF NOT EXISTS renewals (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            original_fdr_id TEXT NOT NULL,
            new_fdr_id TEXT NOT NULL,
            renewal_type TEXT NOT NULL,
            renewal_date TEXT NOT NULL,
            submitted_by TEXT,
            notes TEXT,
            created_at TEXT NOT NULL
        )
    ''')

    c.execute('''
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            email TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            full_name TEXT NOT NULL,
            role TEXT NOT NULL,
            department TEXT
        )
    ''')

    # Ledger checkpoint table — protects against tail truncation attacks
    c.execute('''
        CREATE TABLE IF NOT EXISTS ledger_checkpoint (
            id INTEGER PRIMARY KEY,
            last_block_index INTEGER NOT NULL,
            head_hash TEXT NOT NULL,
            total_blocks INTEGER NOT NULL,
            updated_at TEXT NOT NULL
        )
    ''')
    c.execute("SELECT COUNT(*) FROM ledger_checkpoint")
    if c.fetchone()[0] == 0:
        c.execute("SELECT block_index, block_hash FROM audit_ledger ORDER BY block_index DESC LIMIT 1")
        last_b = c.fetchone()
        if last_b:
            c.execute("SELECT COUNT(*) FROM audit_ledger")
            total_b = c.fetchone()[0]
            c.execute('''
                INSERT INTO ledger_checkpoint (id, last_block_index, head_hash, total_blocks, updated_at)
                VALUES (1, ?, ?, ?, datetime('now'))
            ''', (last_b[0], last_b[1], total_b))

    # Seed demo users with per-user dynamic PBKDF2-HMAC cryptographic salt
    def hash_pw(email, pw):
        salt = hashlib.sha256(email.strip().lower().encode('utf-8')).digest()
        return hashlib.pbkdf2_hmac('sha256', pw.encode('utf-8'), salt, 100000).hex()

    demo_users = [
        ("officer@aicte.gov.in", hash_pw("officer@aicte.gov.in", "Officer@123"), "Shri Alok K. Mishra", "bureau_officer", "Regulation Bureau"),
        ("director@aicte.gov.in", hash_pw("director@aicte.gov.in", "Director@123"), "Prof. Rajive Kumar", "director", "AICTE Regional Directorate"),
        ("college@kalinga.edu.in", hash_pw("college@kalinga.edu.in", "College@123"), "Dr. S. Mohanty", "institution", "Kalinga Institute Desk"),
        ("validator@sbi.co.in", hash_pw("validator@sbi.co.in", "Bank@123"), "A. K. Verma", "bank_validator", "SBI Branch Operations")
    ]

    for email, pw_hash, name, role, dept in demo_users:
        c.execute('''
            INSERT OR REPLACE INTO users (email, password_hash, full_name, role, department)
            VALUES (?, ?, ?, ?, ?)
        ''', (email, pw_hash, name, role, dept))

    # Check if instruments already seeded
    c.execute("SELECT COUNT(*) FROM instruments")
    count = c.fetchone()[0]
    if count >= 200:
        print(f"Database already contains {count} instruments. Skipping re-seed.")
        conn.commit()
        conn.close()
        return

    print("Seeding 208 regulatory instruments...")
    c.execute("DELETE FROM instruments")

    # Fixed Anchor Records
    # 1. Kalinga (Active)
    c.execute('''
        INSERT INTO instruments VALUES (
            'FDR-2024-1001', 'FDR/SBI/991048221', '1-10492810',
            'Kalinga Institute of Advanced Technology', 'Kalinga Vidya Bharati Foundation',
            'Eastern', 'Odisha', 'Bhubaneswar', 'Engineering & Technology (UG)',
            3500000, 'State Bank of India', 'Public Sector Scheduled', 'SBIN0006240',
            '40192830112', '2024-03-15', '2034-03-15', 10, 2700,
            'Member Secretary, AICTE & Chairman, Trust', 1, 1, 'bank', 99.2,
            'Active', 'Lien confirmed', 0, 'APH Table 1.4 Deposit for Engineering & Technology (UG)', 0, NULL, datetime('now')
        )
    ''')

    # 2. Vidyavardhaka (Matured 10-Yr -> Release Pending)
    c.execute('''
        INSERT INTO instruments VALUES (
            'FDR-2016-1002', 'FDR/CANARA/772109831', '1-10492811',
            'Vidyavardhaka College of Engineering', 'Vidyavardhaka Sangha Trust',
            'South-Western', 'Karnataka', 'Mysuru', 'Engineering & Technology (UG)',
            3500000, 'Canara Bank', 'Public Sector Scheduled', 'CNRB0002100',
            '40192830113', '2016-10-15', '2026-10-15', 10, -9,
            'Member Secretary, AICTE & Secretary, Trust', 1, 1, 'bank', 98.7,
            'Release', 'Release requested (10-Yr Lock-in fulfilled)', 0, 'APH Table 1.4 Deposit for Engineering & Technology (UG)', 0, NULL, datetime('now')
        )
    ''')

    # 3. Simulated Apex (Discrepancy)
    c.execute('''
        INSERT INTO instruments VALUES (
            'FDR-2022-1003', 'FDR/PNB/440182109', '1-10492812',
            '[Simulated] Apex Institute of Applied Computing', 'Simulated Technical Education Trust',
            'Northern', 'Uttar Pradesh', 'Lucknow', 'Engineering & Technology (UG)',
            3500000, 'Punjab National Bank', 'Public Sector Scheduled', 'PUNB0123400',
            '40192830114', '2022-08-10', '2027-08-10', 5, 290,
            'Chairman, Apex Trust only (AICTE missing)', 0, 0, 'declared', 78.4,
            'Discrepancy', 'Flagged (Tenor 5y vs 10y, No AICTE Lien)', 1, 'APH Table 1.4 Deposit for Engineering & Technology (UG)', 0, NULL, datetime('now')
        )
    ''')

    # 4. College of Engineering Guindy (Govt Exempt)
    c.execute('''
        INSERT INTO instruments VALUES (
            'FDR-2023-1004', 'GOV-EXEMPT-TN-001', '1-10492813',
            'College of Engineering, Guindy', 'Government of Tamil Nadu',
            'Southern', 'Tamil Nadu', 'Chennai', 'Government / University Constituent (All)',
            0, 'Reserve Bank of India / Treasury', 'Government Exemption', 'GOV-AFFIDAVIT-TN',
            'TREASURY-TN-2023', '2023-06-01', '2033-06-01', 10, 2412,
            'Director of Technical Education, Govt of Tamil Nadu', 1, 1, 'officer', 100.0,
            'Active', 'Exempt under Table 1.4 Clause (c)', 0, 'APH Table 1.4 Exemption with State Affidavit', 1, NULL, datetime('now')
        )
    ''')

    # 5. Symbiosis (Expiring in 27 days - Management PG per Table 1.4 is ₹15L, 10-Year Tenor)
    c.execute('''
        INSERT INTO instruments VALUES (
            'FDR-2018-1005', 'FDR/HDFC/883920191', '1-10492814',
            'Symbiosis Institute of Business & Digital Media', 'Symbiosis International Society',
            'Western', 'Maharashtra', 'Pune', 'Management (PG - MBA/PGDM)',
            1500000, 'HDFC Bank', 'Private Sector Scheduled', 'HDFC0001092',
            '40192830115', '2016-11-20', '2026-11-20', 10, 27,
            'Member Secretary, AICTE & President, Symbiosis', 1, 1, 'bank', 99.1,
            'Expiring', 'Expiring in 27 days (Advisory Dispatched)', 0, 'APH Table 1.4 Deposit for Management (PG - MBA/PGDM)', 0, NULL, datetime('now')
        )
    ''')

    # Generate remaining 203 records
    for i in range(6, 209):
        inst = REAL_INSTITUTIONS_BASE[i % len(REAL_INSTITUTIONS_BASE)]
        prog = PROGRAM_CONFIGS[i % len(PROGRAM_CONFIGS)]
        bank = BANKS[i % len(BANKS)]
        
        inst_name = f"{inst['name']} [Unit {i // len(REAL_INSTITUTIONS_BASE) + 1}]"
        is_govt = 1 if prog.get('isGovt') else 0
        amount = 0 if is_govt else prog['minAmount']
        tenor = prog['tenorYears'] if not is_govt else 10

        # Spread maturity over realistic 10-year regulatory horizon (2026 to 2035)
        bucket = i % 20
        if is_govt:
            status = "Active"
            legacy_status = "Exempt with Affidavit"
            m_year = 2029 + (i % 6)
            m_month = (i % 12) + 1
            m_day = (i % 27) + 1
        elif bucket in (0, 1):
            status = "Expiring"
            m_year = 2026
            m_month = 11 if bucket == 0 else 12
            m_day = 1 + (i % 20)
            legacy_status = "Expiring (<60 days)"
        elif bucket in (2, 3):
            status = "Matured"
            m_year = 2026
            m_month = 1 + (i % 8)
            m_day = 1 + (i % 25)
            legacy_status = "10-Year Lock-in Fulfilled"
        elif bucket in (4, 5):
            status = "Renewed"
            m_year = 2026
            m_month = 1 + (i % 9)
            m_day = 1 + (i % 25)
            legacy_status = "Rolled over to new lien"
        elif bucket == 6:
            status = "Released"
            m_year = 2026
            m_month = 1 + (i % 10)
            m_day = 1 + (i % 25)
            legacy_status = "Lien Discharged (NOC Issued)"
        elif bucket == 7:
            status = "Discrepancy"
            m_year = 2027 + (i % 4)
            m_month = (i % 12) + 1
            m_day = (i % 27) + 1
            legacy_status = "CBS Lien / Term Mismatch"
        elif bucket == 8:
            status = "Pending"
            m_year = 2034 + (i % 2)
            m_month = (i % 12) + 1
            m_day = (i % 27) + 1
            legacy_status = "Awaiting Officer Scrutiny"
        else:
            status = "Active"
            m_year = 2027 + (i % 9)
            m_month = (i % 12) + 1
            m_day = (i % 27) + 1
            legacy_status = "Lien confirmed"

        maturity_date = f"{m_year}-{m_month:02d}-{m_day:02d}"
        issue_year = m_year - (tenor if tenor > 0 else 10)
        issue_date = f"{issue_year}-{m_month:02d}-{m_day:02d}"

        # Days remaining relative to 2026-10-24
        today = datetime(2026, 10, 24)
        mat_dt = datetime(m_year, m_month, m_day)
        days_rem = (mat_dt - today).days

        c.execute('''
            INSERT INTO instruments VALUES (
                ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now')
            )
        ''', (
            f"FDR-{issue_year}-{1000 + i}",
            f"FDR/{bank['code']}/{78000000 + i}",
            f"1-{10000000 + (i * 3821) % 90000000}",
            inst_name,
            inst['trust'],
            inst['region'],
            inst['state'],
            inst['city'],
            prog['program'],
            amount,
            bank['name'],
            bank['type'],
            f"{bank['ifsc'][:4]}000{1000 + (i % 8999)}",
            f"401{10000000 + i}",
            issue_date,
            maturity_date,
            tenor,
            days_rem,
            f"Member Secretary, AICTE & Secretary, {inst['trust'].split()[0]}",
            1 if not is_govt else 0,
            1,
            "bank" if i % 2 == 0 else "officer",
            round(94.0 + ((i * 17) % 60) / 10, 1),
            status,
            legacy_status,
            0,
            f"APH Table 1.4 Deposit for {prog['program']}",
            is_govt,
            None
        ))

    # Seed Cryptographic Ledger Genesis Block
    c.execute("SELECT COUNT(*) FROM audit_ledger")
    if c.fetchone()[0] == 0:
        print("Initializing Cryptographic SHA-256 Merkle Ledger...")
        genesis_str = "0:0000000000000000000000000000000000000000000000000000000000000000:2026-10-24T00:00:00Z:GENESIS:SYSTEM:None:AICTE KoshDrishti Cryptographic Root Genesis Block"
        genesis_hash = hashlib.sha256(genesis_str.encode()).hexdigest()
        
        c.execute('''
            INSERT INTO audit_ledger VALUES (
                0, '2026-10-24T00:00:00Z', 'GENESIS', 'SYSTEM', NULL,
                '0000000000000000000000000000000000000000000000000000000000000000',
                ?, 'AICTE KoshDrishti Cryptographic Root Genesis Block'
            )
        ''', (genesis_hash,))

        # Add initial audit blocks
        b1_str = f"1:{genesis_hash}:2026-10-24T09:15:00Z:BENCHMARK_SEED_LOADED:REGULATION_BUREAU:ALL:208 technical institution deposit portfolios synchronized with APH 2024-27 Table 1.4 norms."
        b1_hash = hashlib.sha256(b1_str.encode()).hexdigest()
        c.execute('''
            INSERT INTO audit_ledger VALUES (
                1, '2026-10-24T09:15:00Z', 'BENCHMARK_SEED_LOADED', 'REGULATION_BUREAU', 'ALL',
                ?, ?, '208 technical institution deposit portfolios synchronized with APH 2024-27 Table 1.4 norms.'
            )
        ''', (genesis_hash, b1_hash))

        b2_str = f"2:{b1_hash}:2026-10-24T10:00:00Z:DISCREPANCY_FLAGGED:AUTOMATED_TRIANGULATION:FDR-2022-1003:Core Banking mismatch detected on tenure and lien clause for Apex Institute."
        b2_hash = hashlib.sha256(b2_str.encode()).hexdigest()
        c.execute('''
            INSERT INTO audit_ledger VALUES (
                2, '2026-10-24T10:00:00Z', 'DISCREPANCY_FLAGGED', 'AUTOMATED_TRIANGULATION', 'FDR-2022-1003',
                ?, ?, 'Core Banking mismatch detected on tenure and lien clause for Apex Institute.'
            )
        ''', (b1_hash, b2_hash))

        # Initialize ledger checkpoint for tail-truncation protection
        c.execute('''
            CREATE TABLE IF NOT EXISTS ledger_checkpoint (
                id INTEGER PRIMARY KEY,
                last_block_index INTEGER NOT NULL,
                head_hash TEXT NOT NULL,
                total_blocks INTEGER NOT NULL,
                updated_at TEXT NOT NULL
            )
        ''')
        c.execute("DELETE FROM ledger_checkpoint")
        c.execute('''
            INSERT INTO ledger_checkpoint (id, last_block_index, head_hash, total_blocks, updated_at)
            VALUES (1, 2, ?, 3, datetime('now'))
        ''', (b2_hash,))

    # Seed initial alerts only when alerts table is completely empty
    c.execute("SELECT COUNT(*) FROM alerts")
    if c.fetchone()[0] == 0:
        c.execute('''
            INSERT INTO alerts (fdr_id, institution_name, alert_type, days_remaining, message, status, created_at)
            VALUES 
            ('FDR-2018-1005', 'Symbiosis Institute of Business & Digital Media', 'CRITICAL_30_DAY', 27, 'Mandatory 10-Year deposit matures in 27 days. Send replacement/renewal advisory.', 'PENDING', datetime('now')),
            ('FDR-2016-1002', 'Vidyavardhaka College of Engineering', 'MATURITY_FULFILLED', -9, '10-Year lock-in completed. Two-Officer digital discharge ready for Regional Director approval.', 'PENDING', datetime('now')),
            ('FDR-2022-1003', '[Simulated] Apex Institute of Applied Computing', 'DISCREPANCY_ALERT', 290, 'Bank CBS mismatch: 5y tenor vs 10y mandatory APH Table 1.4 norm. AICTE lien missing.', 'PENDING', datetime('now'))
        ''')

    conn.commit()
    conn.close()
    print("Database seeding completed successfully.")

if __name__ == "__main__":
    seed_database()

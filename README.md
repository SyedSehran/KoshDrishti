# KoshDrishti • AICTE VISHWAS-FDR
### Centralized Security Deposit & Fixed Deposit Receipt (FDR) Management Portal
**Problem Statement ID:** 26265  
**Department:** Regulation Bureau, All India Council for Technical Education (AICTE), Ministry of Education, Govt. of India  
**Theme:** Smart Automation  
**Regulatory Standard:** AICTE Approval Process Handbook (APH 2024-27 Table 1.4 & Chapter XI Cl. 11.8) & RBI Scheduled Commercial Bank Registry  
**Live Repository:** [https://github.com/SyedSehran/KoshDrishti](https://github.com/SyedSehran/KoshDrishti)

---

## About KoshDrishti

**KoshDrishti** (from Sanskrit *कोष* = Treasury / Escrow / Security Deposit, and *दृष्टि* = Vision / Oversight / Transparency) is a centralized, digital regulatory governance platform built for the **AICTE Regulation Bureau**. 

It eliminates fragmented, manual tracking of institutional security deposits by establishing an automated, immutable lifecycle system that enforces **APH 2024-27 Chapter I, Table 1.4** norms, conducts anchored OCR field extraction, cross-checks Core Banking System (CBS) / SFMS lien records, tracks single 10-year lock-in maturity horizons, executes background alert scanning, and provides cryptographic hash-chained audit trails.

---

## Technology Stack

| # | Layer | Technology | Details |
|:---:|:---|:---|:---|
| 1 | **Frontend** | React 19 + Vite | Vanilla CSS · Lucide Icons · Sovereign Stamp & Ramp design system |
| 2 | **Backend** | Python 3.11 (stdlib) | Native `http.server` · No framework overhead |
| 3 | **Database** | SQLite3 | Persistent relational DB · 208 benchmark institutions seeded |
| 4 | **Auth & Security** | PyJWT RBAC | 4 roles · PBKDF2-HMAC SHA-256 password hashing · 100k iterations |
| 5 | **Audit Ledger** | SHA-256 Hash-Chain | Cryptographically immutable · tamper-detect & repair endpoints |
| 6 | **OCR / Extraction** | Anchored Regex + pypdf | Strict anchors on `DEPOSIT AMOUNT:` · `INR` · `₹` |
| 7 | **Regulatory Standard** | APH 2024-27 Table 1.4 | GIGW compliant · Bilingual (EN/HI) · Accessibility text-size controls |
| 8 | **Document Vault** | Persistent File Store | Base64 + SQLite storage (`/api/v1/documents`) for FDRs & bank letters |
| 9 | **Regulatory Reporting** | CSV / JSON Exporter | Instant export with UTF-8 BOM (`/api/v1/reports/export`) for audits |

---

## Technical Reality & Integrity (Transparency First)

To ensure full credibility before evaluators and statutory auditors, KoshDrishti clearly distinguishes active system implementations from external banking network simulations:

### Real & Production-Functional Components:
1. **APH 2024-27 Table 1.4 Statutory Norms:** Deposit requirements are structured strictly as Program × Level (Diploma / UG / PG), with a uniform 10-year lock-in tenor, 2× multiplier for leased buildings, and Chapter XI Clause 11.8 penalty and timeline rules.
2. **Persistent Relational Database (`backend/vishwas_fdr.db`):** 208 benchmark technical institutions are persistently stored in SQLite. Submissions, lien endorsements, and release status updates write to the database and persist across sessions.
3. **Cryptographic SHA-256 Hash-Chained Audit Ledger:** Every status change, FDR lodgement, and discharge order appends a cryptographically chained block using SHA-256 (`hashlib.sha256`). `/api/v1/ledger/verify` recomputes the chain from genesis and immediately detects unauthorized modifications.
4. **Anchored OCR & Document Extraction (`/api/v1/ocr/extract`):** Scrutinizes uploaded text and PDF slips using anchored regex patterns (`DEPOSIT AMOUNT:`, `INR`, `₹`, words fallback). Accurately distinguishes deposit amounts from IFSC codes or account numbers. Returns `UNREADABLE` for incomplete or invalid slips without defaulting.
5. **PyJWT Role-Based Access Control (RBAC):** Mutating endpoints (`POST /api/v1/instruments`, `PATCH /api/v1/instruments/<id>/status`, `POST /api/v1/ledger/tamper`, `POST /api/v1/ledger/repair`) require a valid Bearer token and enforce strict role checks (Director role required for final deposit release).
6. **Real-Time Background Alert Scanner:** A daemon thread in `backend/server.py` periodically recalculates `days_remaining` from maturity dates, inserts 90/60/30/7-day alerts without duplicates, and escalates unactioned critical alerts.
7. **Rule-Based APH Table 1.4 & Clause 11.8 Compliance Scorer:** Pure mathematical compliance evaluation against statutory requirements, including early-encashment penalty flags and leased premise multipliers.
8. **Statutory Document Vault (`/api/v1/documents`):** Dedicated document storage per instrument for physical FDR certificate scans, bank lien letters, and board resolutions with metadata tracking.
9. **Renewal & Replacement Workflow:** Supports institutional lodgement of renewed/replacement FDR instruments with `parent_fdr_id` chain lineage and cryptographic continuity.
10. **Single-Click Regulatory CSV/JSON Export (`/api/v1/reports/export`):** Enables AICTE officers to export institution-wise deposit portfolios with complete regulatory metadata for committee hearings.

### Simulated Integrations:
1. **Live Bank Core Banking (CBS) & SFMS Gateway:** Direct Core Banking queries require private RBI/SFMS lease lines; therefore, bank confirmations are safely simulated and clearly labeled *"Bank verification (simulated)"*.
2. **FDR Certificate Numbers:** Certificate strings are synthetically structured to protect institutional financial privacy.
3. **Discrepancy Scenarios:** Non-compliant test cases explicitly use simulated names (e.g., `[Simulated] Apex Institute of Applied Computing`) to protect real institutional reputations.

---

## APH 2024-27 Table 1.4 Security Deposit Norms

All calculations in KoshDrishti are anchored to `src/config/aph.js` based on Chapter I, Table 1.4:

### 1. Mandatory Deposit Amounts (₹ in Lakhs) — Single 10-Year Non-Callable Tenor
| Approved Program Category | Diploma | Under Graduate (UG) | Post Graduate (PG) | Tenor |
|---|---|---|---|---|
| Engineering & Technology | ₹ 15 Lakh | ₹ 35 Lakh | ₹ 15 Lakh | 10 Years |
| Planning | ₹ 15 Lakh | ₹ 15 Lakh | ₹ 15 Lakh | 10 Years |
| Applied Arts and Crafts | ₹ 15 Lakh | ₹ 15 Lakh | ₹ 15 Lakh | 10 Years |
| Design | ₹ 15 Lakh | ₹ 15 Lakh | ₹ 15 Lakh | 10 Years |
| Hotel Management & Catering (HMCT) | ₹ 15 Lakh | ₹ 15 Lakh | ₹ 15 Lakh | 10 Years |
| Computer Applications (BCA / MCA) | — | ₹ 5 Lakh (BCA) | ₹ 15 Lakh (MCA) | 10 Years |
| Management (BBA / MBA / PGDM) | — | ₹ 5 Lakh (BBA) | ₹ 15 Lakh (MBA) | 10 Years |
| Government / University Dept (All) | Exempt | Exempt | Exempt | N/A (Clause c Affidavit) |

### 2. Leased Premises Multiplier
- **2× Deposit Multiplier:** Institutions operating on leased land/building must submit double the base deposit amount (`min_amount × 2`).

### 3. Statutory Jurisdiction (Not in Table 1.4)
- **Pharmacy (B.Pharm / M.Pharm):** Governed under the Pharmacy Act 1948 / Pharmacy Council of India (PCI). Not governed by AICTE Table 1.4.
- **Architecture (B.Arch / M.Arch):** Governed under the Architects Act 1972 / Council of Architecture (CoA). Not governed by AICTE Table 1.4.

### 4. Chapter XI, Clause 11.8 Discrepancy & Release Rules
- **Premature Encashment / Tenor Shortfall:** Invokes an automatic 10% penalty flag.
- **Proof & Affidavit Timeline:** 15-day submission deadline. Delays trigger Stage 1 (10% surcharge) and Stage 2 (50% severe surcharge).
- **Mandatory Release Conditions:** Deposit release is blocked unless the 10-year lock-in term is complete (`days_remaining <= 0`), there are zero open complaints/discrepancies, and two-officer digital sign-off is completed.

---

## Regulatory Workspaces

1. **Scrutiny Officer Desk (`bureau_officer`):**
   - Bureau Master Register across 200+ technical institutions in all 28 states.
   - 7 Problem Statement KPIs (`Active`, `Expiring`, `Matured`, `Renewed`, `Released`, `Pending`, `Discrepancy`).
   - 12-Month Maturity Runway & Interactive Regional Map.
   - Discrepancy Triangulation Inspector ("Compare sources") & Statutory Notice dispatch.

2. **Approving Authority / Director Chamber (`director`):**
   - Directorate custody overview (Total ₹ Crores in custody escrow).
   - **Two-Officer Digital Sanction Queue** for Release / NOC applications post 10-year lock-in.
   - Digital Signature Certificate (Class 3 DSC) endorsement with verifiable QR seal.

3. **Technical Institution Nodal Desk (`institution`):**
   - Institution-specific FDR custody dashboard.
   - **APH Table 1.4 Calculator** with leased premises multiplier toggle.
   - **New Deposit / FDR Submission Desk** with anchored OCR scrutiny.

4. **Bank Branch Verification Desk (`bank_validator`):**
   - RBI Scheduled Commercial Bank registry.
   - Core Banking System (CBS) queue for checking joint title and non-callable lock-in.
   - One-click **"Endorse Lien in CBS"** action.

---

## Statutory Case File & 360 Degree Regulatory Dossier (`CF-2026-XXXX`)

Clicking **"Case file"** on any record in any workspace opens a deep slide-over dossier featuring:
- **Case Summary:** Permanent AICTE ID, Trust particulars, issuing branch IFSC & Account, Joint Title.
- **APH Table 1.4 Norms:** Automated rule evaluation against program deposit norms and lock-in horizons.
- **CBS & Bank Cross-Check:** Simulated SFMS ISO20022 message status, lien endorsement confirmation, and premature withdrawal lock status.
- **360 Degree Lifecycle Audit Trail:** Immutable milestones from deposit inception to maturity with SHA-256 block hashes.

---

## 3 Evaluator Demo Scripts

Click the **"Demo Scripts"** button in the top navigation bar:
1. **Flow 1: Non-Compliant / Mismatched FDR Detection:**
   - Institution claims 10-year deposit of ₹35 Lakhs with AICTE lien.
   - Bank CBS reveals only 5 years, ₹15 Lakhs, and NO AICTE lien.
   - Scrutiny Officer opens "Compare sources" and dispatches a 15-day statutory notice.
2. **Flow 2: Approaching Maturity Runway & Notice Advisory:**
   - Maturity Runway flags instruments within the critical 30-day window.
   - System displays background-scanned staged alerts (90d / 60d / 30d / 7d).
3. **Flow 3: Two-Officer Approval & Official AICTE Discharge Order:**
   - Vidyavardhaka College completes full 10-year lock-in with zero complaints.
   - Scrutiny Officer verifies 5-point statutory checklist.
   - Approving Authority sanctions release, generating the official digitally-signed AICTE Discharge Order with verifiable QR seal.

---

## How to Run Locally

### 1. Clone the Repository
```bash
git clone https://github.com/SyedSehran/KoshDrishti.git
cd KoshDrishti
```

### 2. Frontend Setup
```bash
# Install dependencies
npm install

# Start Vite dev server
npm run dev
```
Access at: `http://localhost:5173/`

### 3. Backend Setup
```bash
# Start native Python backend (seeds SQLite DB, starts Alert Scanner daemon, enables RBAC)
python backend/server.py
```
API Health Check: `http://127.0.0.1:8000/api/v1/health`

---

## Security & Evaluator Configuration Notice

### 1. Cryptographic Password Hashing
All user authentication records in `users` are hashed using Python stdlib `hashlib.pbkdf2_hmac` with `SHA-256`, 100,000 iterations, and a unique per-user cryptographic salt (`hashlib.sha256(email.encode()).digest()`).

### 2. Demo Evaluation JWT Secret (`DEMO_EVALUATION_FALLBACK`)
> [!IMPORTANT]
> **Evaluator Convenience Notice:** For offline evaluation and zero-setup local hackathon demonstrations, the backend defaults `JWT_SECRET` to a well-known local development string if the environment variable is not explicitly provided.
> 
> When running in this mode, `/api/v1/health` honestly reports:
> ```json
> "jwt_security_mode": "DEMO_EVALUATION_FALLBACK"
> ```
> This allows jury members and evaluators to test role switching (Bureau Officer, Approving Authority / Director, Institution, Bank Validator) immediately without configuring `.env` secrets.
> 
> **Production Deployment:**
> In production or public environments, a high-entropy secret MUST be passed via the environment:
> ```bash
> export JWT_SECRET="your-high-entropy-cryptographic-secret-key-32-bytes"
> python backend/server.py
> ```
> Do not expose or deploy the system to public networks without setting `JWT_SECRET`.

---

## AICTE Regulation Bureau • Ministry of Education, Govt. of India
Designed and developed for Smart India Hackathon (SIH) • Problem Statement ID 26265.

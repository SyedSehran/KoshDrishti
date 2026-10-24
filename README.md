# KoshDrishti (कोषदृष्टि) • AICTE VISHWAS-FDR
### Centralized Security Deposit & Fixed Deposit Receipt (FDR) Management Portal
**Problem Statement ID:** 26265  
**Department:** Regulation Bureau, All India Council for Technical Education (AICTE), Ministry of Education, Govt. of India  
**Theme:** Smart Automation  
**Regulatory Standard:** AICTE Approval Process Handbook (APH 2024-27 Table 1.4) & RBI Scheduled Commercial Bank Registry  
**Live Repository:** [https://github.com/SyedSehran/KoshDrishti](https://github.com/SyedSehran/KoshDrishti)

---

## 🏛️ About KoshDrishti (कोषदृष्टि)

**KoshDrishti** (from Sanskrit *कोष* = Treasury / Escrow / Security Deposit, and *दृष्टि* = Vision / Oversight / Transparency) is a centralized, digital regulatory governance platform built for the **AICTE Regulation Bureau**. 

It eliminates fragmented, paper-based tracking of institutional security deposits by establishing an automated, immutable lifecycle system that strictly enforces **APH 2024-27 Chapter I, Table 1.4** norms, conducts automated OCR verification, cross-checks Core Banking System (CBS) / SFMS lien records, tracks 10-year lock-in maturity horizons, and provides cryptographic audit trails.

---

## 👥 4 Role-Based Operational Workspaces (RBAC)

KoshDrishti features distinct, dedicated workspaces tailored to each regulatory stakeholder:

1. **🏛️ Scrutiny Officer Desk (`bureau_officer`):**
   - Full Bureau Master Register across 200+ technical institutions in all 28 states.
   - 7 exact Problem Statement KPIs (`Active`, `Expiring`, `Matured`, `Renewed`, `Released`, `Pending`, `Discrepancy`).
   - 12-Month Maturity Runway & Interactive Regional Map.
   - Discrepancy Triangulation Inspector ("Compare sources") & Statutory Notice dispatch.

2. **⚖️ Approving Authority / Director Chamber (`director`):**
   - Directorate custody overview (Total ₹ Crores in custody escrow).
   - **Two-Officer Digital Sanction Queue** for Release / NOC applications post 10-year lock-in.
   - Digital Signature Certificate (Class 3 DSC) endorsement for official AICTE Discharge Orders with QR verification.
   - High-Value Escrow Portfolio (≥ ₹25 Lakhs).

3. **🎓 Technical Institution Nodal Desk (`institution`):**
   - Institution-specific FDR custody dashboard.
   - **APH Table 1.4 Normative Calculator** (Engineering ₹35L, Management ₹25L, Pharmacy ₹30L, Polytechnic ₹20L, or ₹0 Govt Exemption).
   - **New Deposit / FDR Submission Wizard** with automated OCR text extraction.
   - 10-Year Lock-in release application filing.

4. **🏦 Bank Branch Verification Desk (`bank_validator`):**
   - RBI Scheduled Commercial Bank node selector (SBI, PNB, Canara, BoB, HDFC, etc.).
   - SFMS ISO20022 direct node status.
   - Direct Core Banking System (CBS) queue for checking joint title and premature withdrawal locks.
   - One-click **"Endorse Lien in CBS"** action.

---

## 📁 Statutory Case File & 360° Regulatory Dossier (`CF-2026-XXXX`)

Clicking **"Case file"** on any record in any workspace opens a deep slide-over regulatory dossier featuring:
- **Case Summary:** Permanent AICTE ID, Trust particulars, issuing branch IFSC & Account, Joint Title.
- **APH Table 1.4 Norms:** Automated rule evaluation against program deposit norms and lock-in horizons.
- **CBS & Bank Cross-Check:** Simulated SFMS ISO20022 message status, lien endorsement confirmation, and premature withdrawal lock status.
- **360° Lifecycle Audit Trail:** Immutable milestones from deposit inception to maturity with SHA-256 block hashes.
- **Printable Dossier:** One-click official dossier print formatting.

---

## 📑 APH 2024-27 Table 1.4 Norms (Single Source of Truth)

Every calculation in KoshDrishti is anchored to `src/config/aph.js`:

| Program / Category | Min. Deposit Amount | Mandatory Lock-in | Joint Lien Holder Clause |
|---|---|---|---|
| Engineering & Technology (UG) | ₹ 35,00,000 (35 Lakhs) | 10 Years | Member Secretary, AICTE & Trust Secretary |
| Management (MBA / PGDM) | ₹ 25,00,000 (25 Lakhs) | 8 Years | Member Secretary, AICTE & Trust Secretary |
| Pharmacy (B.Pharm / M.Pharm) | ₹ 30,00,000 (30 Lakhs) | 10 Years | Member Secretary, AICTE & Trust Secretary |
| Architecture & Town Planning | ₹ 35,00,000 (35 Lakhs) | 10 Years | Member Secretary, AICTE & Trust Secretary |
| Polytechnic (Diploma Engg) | ₹ 20,00,000 (20 Lakhs) | 8 Years | Member Secretary, AICTE & Trust Secretary |
| Hotel Management (HMCT) | ₹ 20,00,000 (20 Lakhs) | 8 Years | Member Secretary, AICTE & Trust Secretary |
| Government / Constituent | ₹ 0 (Exempt) | N/A | Exemption Affidavit under Clause (c) |

---

## 🎯 3 Evaluator Demo Scripts

Click the **"Demo Scripts (3 Flows)"** button in the top banner or floating action button:
1. **Flow 1: Non-Compliant / Mismatched FDR Detection:**
   - Institution claims 10-year deposit of ₹35 Lakhs with AICTE lien.
   - Bank CBS reveals only 5 years, ₹15 Lakhs, and NO AICTE lien.
   - Scrutiny Officer opens "Compare sources" and dispatches a 15-day statutory notice.
2. **Flow 2: Approaching Maturity Runway & Notice Advisory:**
   - Maturity Runway flags instruments within the critical 30-day window.
   - System triggers multi-channel SMS / Email notices and sets escalation alarms.
3. **Flow 3: Two-Officer Approval & Official AICTE Discharge Order:**
   - Vidyavardhaka College completes full 10-year lock-in with zero complaints.
   - Scrutiny Officer verifies 5-point statutory checklist.
   - Approving Authority sanctions release, generating the official digitally-signed AICTE Discharge Order with verifiable QR seal.

---

## 🛠️ Technology Stack

- **Frontend:** React 19, Vite, Vanilla CSS with sovereign Stamp & Ramp design system, Lucide icons.
- **Backend API:** Python native HTTP server + FastAPI blueprint with SQLite3 relational database (`backend/server.py` and `backend/fastapi_app.py`).
- **OCR Engine:** PaddleOCR / Tesseract regex extraction module.
- **Audit Ledger:** Cryptographic SHA-256 hash-chained regulatory audit ledger.
- **Standards:** Guidelines for Indian Government Websites (GIGW) compliant typography, text-size controls, and tricolor accents.

---

## 🚀 How to Run Locally

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
# Start native Python backend
python backend/server.py
```
API Health Check: `http://127.0.0.1:8000/api/v1/health`

---

## 🏛️ AICTE Regulation Bureau • Ministry of Education, Govt. of India
Designed and developed for Smart India Hackathon (SIH) • Problem Statement ID 26265.

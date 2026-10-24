// AICTE VISHWAS-FDR Master Data Store
// Modelled strictly on AICTE Approval Process Handbook (APH 2024-27 Table 1.4)
// & Reserve Bank of India (RBI) Scheduled Commercial Banks Registry

export const APH_NORMS_CATALOG = [
  { program: "Engineering & Technology (UG)", minAmountLakhs: 35, lockInYears: 10, jointLienMandatory: true, category: "Private/Self-Financed", exemptionAllowed: false },
  { program: "Engineering & Technology (Diploma)", minAmountLakhs: 15, lockInYears: 10, jointLienMandatory: true, category: "Private/Self-Financed", exemptionAllowed: false },
  { program: "Engineering & Technology (PG)", minAmountLakhs: 15, lockInYears: 10, jointLienMandatory: true, category: "Private/Self-Financed", exemptionAllowed: false },
  { program: "Management (PG - MBA/PGDM)", minAmountLakhs: 15, lockInYears: 10, jointLienMandatory: true, category: "Private/Self-Financed", exemptionAllowed: false },
  { program: "Management (UG - BBA)", minAmountLakhs: 5, lockInYears: 10, jointLienMandatory: true, category: "Private/Self-Financed", exemptionAllowed: false },
  { program: "Computer Applications (PG - MCA)", minAmountLakhs: 15, lockInYears: 10, jointLienMandatory: true, category: "Private/Self-Financed", exemptionAllowed: false },
  { program: "Computer Applications (UG - BCA)", minAmountLakhs: 5, lockInYears: 10, jointLienMandatory: true, category: "Private/Self-Financed", exemptionAllowed: false },
  { program: "Planning (Diploma / UG / PG)", minAmountLakhs: 15, lockInYears: 10, jointLienMandatory: true, category: "Private/Self-Financed", exemptionAllowed: false },
  { program: "Applied Arts & Crafts", minAmountLakhs: 15, lockInYears: 10, jointLienMandatory: true, category: "Private/Self-Financed", exemptionAllowed: false },
  { program: "Design (All Levels)", minAmountLakhs: 15, lockInYears: 10, jointLienMandatory: true, category: "Private/Self-Financed", exemptionAllowed: false },
  { program: "Hotel Management & Catering (HMCT)", minAmountLakhs: 15, lockInYears: 10, jointLienMandatory: true, category: "Private/Self-Financed", exemptionAllowed: false },
  { program: "Pharmacy & Architecture (Not in Table 1.4)", minAmountLakhs: 0, lockInYears: 0, jointLienMandatory: false, category: "PCI / CoA Statutory Regulators", exemptionAllowed: true, exemptionClause: "Governed by PCI / CoA Acts, not in AICTE Table 1.4" },
  { program: "Government / University Dept (All)", minAmountLakhs: 0, lockInYears: 0, jointLienMandatory: false, category: "Government / Constituent", exemptionAllowed: true, exemptionClause: "APH 2024-27 Table 1.4 Clause (c) - Exempt with Mandated Govt Affidavit" }
];

export const MOCK_BANK_CATALOG = [
  // Public Sector Scheduled Commercial Banks (RBI List)
  { name: "State Bank of India", code: "SBI", ifscPrefix: "SBIN", category: "Public Sector Scheduled Bank", apiConnected: true, responseLatencyMs: 180 },
  { name: "Punjab National Bank", code: "PNB", ifscPrefix: "PUNB", category: "Public Sector Scheduled Bank", apiConnected: true, responseLatencyMs: 240 },
  { name: "Canara Bank", code: "CANARA", ifscPrefix: "CNRB", category: "Public Sector Scheduled Bank", apiConnected: true, responseLatencyMs: 210 },
  { name: "Bank of Baroda", code: "BOB", ifscPrefix: "BARB", category: "Public Sector Scheduled Bank", apiConnected: true, responseLatencyMs: 195 },
  { name: "Union Bank of India", code: "UBI", ifscPrefix: "UBIN", category: "Public Sector Scheduled Bank", apiConnected: true, responseLatencyMs: 220 },
  { name: "Bank of India", code: "BOI", ifscPrefix: "BKID", category: "Public Sector Scheduled Bank", apiConnected: true, responseLatencyMs: 230 },

  // Private Sector Scheduled Commercial Banks (RBI List)
  { name: "HDFC Bank", code: "HDFC", ifscPrefix: "HDFC", category: "Private Scheduled Bank", apiConnected: true, responseLatencyMs: 140 },
  { name: "ICICI Bank", code: "ICICI", ifscPrefix: "ICIC", category: "Private Scheduled Bank", apiConnected: true, responseLatencyMs: 160 },
  { name: "Axis Bank", code: "AXIS", ifscPrefix: "UTIB", category: "Private Scheduled Bank", apiConnected: true, responseLatencyMs: 175 },

  // Regional Rural / Scheduled Gramin Banks (RBI Scheduled Status)
  { name: "Baroda UP Bank (Gramin)", code: "BUPB", ifscPrefix: "BARB0BUPGB", category: "RBI Scheduled Regional Rural Bank", apiConnected: true, responseLatencyMs: 310 },
  { name: "Kerala Gramin Bank", code: "KGB", ifscPrefix: "KLGB0040101", category: "RBI Scheduled Regional Rural Bank", apiConnected: true, responseLatencyMs: 290 }
];

// Master Seed Records
// NOTE ON ETHICAL ANONYMIZATION: Discrepancy scenarios strictly use fictional institute names to avoid defaming real institutions on screen.
export const INITIAL_FDR_RECORDS = [
  {
    id: "FDR-2024-8841",
    fdrNumber: "FDR/SBI/782194002",
    institutionId: "1-93284711",
    institutionName: "Kalinga Institute of Advanced Technology & Research",
    trustName: "Kalinga Vidya Bharati Educational Foundation",
    institutionCategory: "Private Self-Financed",
    isGovernmentExempt: false,
    region: "Eastern",
    state: "Odisha",
    city: "Bhubaneswar",
    programType: "Engineering & Technology (UG)",
    aphTableNorm: "APH 2024-27 Table 1.4 (₹35 Lakhs, 10-Yr Term)",
    purpose: "Establishment of New Technical Institute (Young Institute < 5y)",
    amount: 3500000,
    currency: "INR",
    issuingBank: "State Bank of India",
    bankCategory: "Public Sector Scheduled Bank",
    branchName: "Industrial Estate Branch, Mancheswar",
    ifsc: "SBIN0006240",
    accountNumber: "38920194821",
    issueDate: "2024-03-15",
    maturityDate: "2034-03-15",
    tenorYears: 10,
    daysRemaining: 2700,
    jointHolderName: "Member Secretary, AICTE & Chairman, Kalinga Vidya Bharati",
    lienMarked: true,
    lienEndorsementDate: "2024-03-20",
    bankConfirmationRef: "SBI/SFMS/2024/09812",
    legacyPortalStatus: "Deposit Confirmed / Lien Marked",
    status: "Verified & Active",
    verificationSource: "Bank SFMS Gateway (Live CBS Confirmed)",
    scrutinyConfidence: 99.4,
    hasDiscrepancies: false,
    discrepancies: [],
    ocrExtracted: {
      fdrNo: "FDR/SBI/782194002",
      amountMatch: true,
      jointNameMatch: true,
      lienClausePresent: true,
      autoRenewClause: true
    },
    lineage: [
      { event: "Instrument Issued", date: "2024-03-15", detail: "Initial deposit created with SBI Mancheswar (RBI Scheduled)" },
      { event: "Joint Lien Registered", date: "2024-03-20", detail: "Lien endorsed to Member Secretary, AICTE under letter RO/AICTE/ERO/2024" },
      { event: "SFMS Verification", date: "2024-03-22", detail: "Automated SFMS 798 message authenticated by SBI Central Treasury" }
    ],
    documents: [
      { name: "Scanned_FDR_Original.pdf", size: "2.4 MB", type: "FDR Certificate", verified: true, sha256: "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855" },
      { name: "Bank_Lien_Confirmation_Letter.pdf", size: "1.1 MB", type: "Bank Confirmation", verified: true, sha256: "ca978112ca1bbdcafac231b39a23dc4da786eff8147c4e72b9807785afee48bb" }
    ],
    releaseDetails: null
  },
  {
    id: "FDR-2023-4109",
    fdrNumber: "FDR/PNB/661039811",
    institutionId: "1-44719022",
    institutionName: "[Simulated Test Case] Apex Institute of Applied Computing & Robotics",
    trustName: "Simulated Technical Education Trust",
    institutionCategory: "Private Self-Financed",
    isGovernmentExempt: false,
    region: "Northern",
    state: "Uttar Pradesh",
    city: "Lucknow",
    programType: "Artificial Intelligence & Data Science (UG)",
    aphTableNorm: "APH 2024-27 Table 1.4 (Shortfall Flagged)",
    purpose: "Additional Program Intake Approval",
    amount: 1500000,
    currency: "INR",
    issuingBank: "Punjab National Bank",
    bankCategory: "Public Sector Scheduled Bank",
    branchName: "Hazratganj Main Branch, Lucknow",
    ifsc: "PUNB0024000",
    accountNumber: "0240002100892",
    issueDate: "2023-08-10",
    maturityDate: "2028-08-10",
    tenorYears: 5,
    daysRemaining: 655,
    jointHolderName: "Secretary, Simulated Technical Trust only",
    lienMarked: false,
    lienEndorsementDate: null,
    bankConfirmationRef: "PNB/CBS/DIFF/9981",
    legacyPortalStatus: "Deposit Received / Discrepancy Flagged",
    status: "Discrepancy Flagged",
    verificationSource: "Bank CBS API Discrepancy Alert",
    scrutinyConfidence: 54.2,
    hasDiscrepancies: true,
    discrepancies: [
      {
        field: "Joint Holder Clause",
        institutionClaim: "Member Secretary AICTE & Trust Secretary",
        bankRecord: "Only Secretary, Simulated Technical Education Trust",
        severity: "CRITICAL",
        recommendation: "Reject submission. Issue mandate to add Member Secretary AICTE as primary pledgee."
      },
      {
        field: "Maturity Period (Tenor)",
        institutionClaim: "8 Years Mandatory Term",
        bankRecord: "5 Years (Matures 2028-08-10)",
        severity: "HIGH",
        recommendation: "APH 2024-27 Table 1.4 mandates minimum 8-year lock-in for program expansion."
      },
      {
        field: "Lien Clause Registration",
        institutionClaim: "Pledged & Lien Endorsed",
        bankRecord: "Lien Not Endorsed in Core Banking System",
        severity: "CRITICAL",
        recommendation: "Institute must provide Bank Lien Confirmation Slip signed by Branch Manager."
      }
    ],
    ocrExtracted: {
      fdrNo: "FDR/PNB/661039811",
      amountMatch: true,
      jointNameMatch: false,
      lienClausePresent: false,
      autoRenewClause: false
    },
    lineage: [
      { event: "Submission Uploaded", date: "2023-08-14", detail: "Institute uploaded scanned FDR and claimed full compliance" },
      { event: "Automated Bank CBS Cross-Check", date: "2023-08-15", detail: "3 Major discrepancies flagged by automated verification daemon" },
      { event: "Regulatory Notice Issued", date: "2023-08-16", detail: "System auto-generated Rectification Notice REG/AICTE/2023/DIFF/4109" }
    ],
    documents: [
      { name: "Apex_FDR_Scanned_Slip.pdf", size: "3.1 MB", type: "FDR Scanned Slip", verified: false, sha256: "5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8" }
    ],
    releaseDetails: null
  },
  {
    id: "FDR-2016-1092",
    fdrNumber: "FDR/CANARA/901238491",
    institutionId: "1-10294812",
    institutionName: "Vidyavardhaka College of Engineering & Technology",
    trustName: "Vidyavardhaka Sangha Trust",
    institutionCategory: "Private Self-Financed",
    isGovernmentExempt: false,
    region: "South-Western",
    state: "Karnataka",
    city: "Mysuru",
    programType: "Engineering & Technology (UG)",
    aphTableNorm: "APH 2024-27 Table 1.4 (10-Year Lock-in Complete)",
    purpose: "Initial Establishment Security Deposit (10-Year Term Fulfilled)",
    amount: 5000000,
    currency: "INR",
    issuingBank: "Canara Bank",
    bankCategory: "Public Sector Scheduled Bank",
    branchName: "K.R. Circle Branch, Mysuru",
    ifsc: "CNRB0000452",
    accountNumber: "0452101099234",
    issueDate: "2016-04-12",
    maturityDate: "2026-04-12",
    tenorYears: 10,
    daysRemaining: -195,
    jointHolderName: "Member Secretary, AICTE & President, Vidyavardhaka Sangha",
    lienMarked: true,
    lienEndorsementDate: "2016-04-18",
    bankConfirmationRef: "CAN/LNR/2016/4401",
    legacyPortalStatus: "Release Requested / NOC Processing",
    status: "Release Requested",
    verificationSource: "Bank SFMS & Manual RO Inspection Clearance",
    scrutinyConfidence: 98.9,
    hasDiscrepancies: false,
    discrepancies: [],
    ocrExtracted: {
      fdrNo: "FDR/CANARA/901238491",
      amountMatch: true,
      jointNameMatch: true,
      lienClausePresent: true,
      autoRenewClause: true
    },
    lineage: [
      { event: "Deposit Inception", date: "2016-04-12", detail: "Initial deposit of ₹50,00,000 created with Canara Bank" },
      { event: "Lien Registered", date: "2016-04-18", detail: "Endorsement completed in favor of AICTE" },
      { event: "10-Year Maturity Reached", date: "2026-04-12", detail: "Mandatory regulatory retention completed successfully" },
      { event: "NOC Petition Filed", date: "2026-08-10", detail: "Institution initiated 4-eye release petition under APH Chapter 2" }
    ],
    documents: [
      { name: "Original_FDR_2016.pdf", size: "1.9 MB", type: "Original FDR", verified: true, sha256: "8f434346648f6b96df89dda901c5176b10a6d83961dd3c1ac88b59b2dc327aa4" },
      { name: "RO_No_Pending_Dues_Certificate.pdf", size: "850 KB", type: "RO Clearance", verified: true, sha256: "ecd71870d1963316a97e3ac3408c9835ad8cf0f3c1bc703527c30265534f75ae" },
      { name: "Trust_Resolution_For_Release.pdf", size: "1.2 MB", type: "Board Resolution", verified: true, sha256: "2c624232cdd221771294dfbb310aca000a0df6ec8b66027e1691e4e3533feed0" }
    ],
    releaseDetails: {
      requestDate: "2026-08-10",
      reason: "Successful completion of 10-year regulatory lock-in period with full NBA accreditation and zero pending student complaints.",
      groundsCategory: "10_YEAR_EXPIRY",
      workflowStep: 2,
      officerNotes: "Scrutiny Officer verified all requirements. Regional Officer report confirms clean track record, nil faculty salary complaints.",
      conditionChecklist: {
        lockInFulfilled: true,
        noCourtStay: true,
        noStudentGrievance: true,
        roClearanceSigned: true,
        bankNoLienDemandReady: true
      },
      dischargeCertificateRef: "AICTE/REG/FDR-REL/2026/089"
    }
  },
  {
    id: "GOV-EXEMPT-2024-001",
    fdrNumber: "EXEMPT/GOV/2024/991",
    institutionId: "1-00291841",
    institutionName: "College of Engineering, Guindy (Anna University)",
    trustName: "State Government of Tamil Nadu",
    institutionCategory: "Government / University Department",
    isGovernmentExempt: true,
    region: "Southern",
    state: "Tamil Nadu",
    city: "Chennai",
    programType: "Government / University Dept (All)",
    aphTableNorm: "APH 2024-27 Table 1.4 Clause (c) [Exempt]",
    purpose: "State Government Technical Institution - Zero Deposit Mandated",
    amount: 0,
    currency: "INR",
    issuingBank: "Government Treasury / State Bank of India",
    bankCategory: "Public Sector Scheduled Bank",
    branchName: "Anna University Branch, Chennai",
    ifsc: "SBIN0006463",
    accountNumber: "N/A (Exempt Entity)",
    issueDate: "2024-01-10",
    maturityDate: "2099-12-31",
    tenorYears: 0,
    daysRemaining: 26000,
    jointHolderName: "Not Applicable (Govt Exemption)",
    lienMarked: true,
    lienEndorsementDate: "2024-01-15",
    bankConfirmationRef: "TN/GOV/EXEMPT/AFFIDAVIT/042",
    legacyPortalStatus: "Govt Exemption Verified",
    status: "Verified & Active",
    verificationSource: "State Higher Education Secretary Affidavit #SHE-TN-2024",
    scrutinyConfidence: 100.0,
    hasDiscrepancies: false,
    discrepancies: [],
    ocrExtracted: {
      fdrNo: "EXEMPT/GOV/2024/991",
      amountMatch: true,
      jointNameMatch: true,
      lienClausePresent: true,
      autoRenewClause: true
    },
    lineage: [
      { event: "Govt Affidavit Registered", date: "2024-01-15", detail: "Statutory affidavit submitted under APH Table 1.4 Clause (c) confirming 100% state funding." }
    ],
    documents: [
      { name: "Government_Exemption_Affidavit_Signed.pdf", size: "1.4 MB", type: "Govt Affidavit", verified: true, sha256: "9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08" }
    ],
    releaseDetails: null
  },
  {
    id: "FDR-2021-9920",
    fdrNumber: "FDR/BOB/554109823",
    institutionId: "1-33829011",
    institutionName: "Symbiosis Institute of Digital Enterprise & Analytics",
    trustName: "Symbiosis International Society",
    institutionCategory: "Private Self-Financed",
    isGovernmentExempt: false,
    region: "Western",
    state: "Maharashtra",
    city: "Pune",
    programType: "Management (PGDM)",
    aphTableNorm: "APH 2024-27 Table 1.4 (₹25 Lakhs, 8-Yr Term)",
    purpose: "Introduction of New Post Graduate Diploma",
    amount: 2500000,
    currency: "INR",
    issuingBank: "Bank of Baroda",
    bankCategory: "Public Sector Scheduled Bank",
    branchName: "Senapati Bapat Road Branch, Pune",
    ifsc: "BARB0SENAPA",
    accountNumber: "28410294811",
    issueDate: "2021-11-20",
    maturityDate: "2026-11-20",
    tenorYears: 5,
    daysRemaining: 27,
    jointHolderName: "Member Secretary, AICTE & Director, Symbiosis",
    lienMarked: true,
    lienEndorsementDate: "2021-11-25",
    bankConfirmationRef: "BOB/SFMS/2021/8872",
    legacyPortalStatus: "Deposit Confirmed / Expiry Alert Active",
    status: "Expiring Soon",
    verificationSource: "Automated Maturity Monitor Daemon",
    scrutinyConfidence: 97.8,
    hasDiscrepancies: false,
    discrepancies: [],
    ocrExtracted: {
      fdrNo: "FDR/BOB/554109823",
      amountMatch: true,
      jointNameMatch: true,
      lienClausePresent: true,
      autoRenewClause: false
    },
    lineage: [
      { event: "Created", date: "2021-11-20", detail: "₹25,00,000 deposited for PGDM expansion" },
      { event: "Lien Endorsement", date: "2021-11-25", detail: "Registered with Bank of Baroda" },
      { event: "60-Day Maturity Alert", date: "2026-09-20", detail: "Automated alert dispatched to Symbiosis Nodal Desk" },
      { event: "30-Day Critical Warning", date: "2026-10-20", detail: "Escalated to Western Regional Office for replacement guarantee" }
    ],
    documents: [
      { name: "BOB_FDR_Original.pdf", size: "2.1 MB", type: "FDR Slip", verified: true, sha256: "3b8e72153b0bc87c32bf26fb96b0ee6934c264a7c06eb61cf6f991f8c85e2c56" }
    ],
    releaseDetails: null
  },
  {
    id: "FDR-2018-7711",
    fdrNumber: "FDR/HDFC/11098234",
    institutionId: "1-77812903",
    institutionName: "Amrita School of Nano-Engineering & Biotechnology",
    trustName: "Mata Amritanandamayi Math",
    institutionCategory: "Private Self-Financed",
    isGovernmentExempt: false,
    region: "Southern",
    state: "Tamil Nadu",
    city: "Coimbatore",
    programType: "Engineering & Technology (UG & PG)",
    aphTableNorm: "APH 2024-27 Table 1.4 (₹1.00 Crore Collateral)",
    purpose: "Additional Division & Research Infrastructure",
    amount: 10000000,
    currency: "INR",
    issuingBank: "HDFC Bank",
    bankCategory: "Private Scheduled Bank",
    branchName: "Peelamedu Branch, Coimbatore",
    ifsc: "HDFC0001211",
    accountNumber: "5010029384711",
    issueDate: "2018-06-15",
    maturityDate: "2028-06-15",
    tenorYears: 10,
    daysRemaining: 600,
    jointHolderName: "Member Secretary, AICTE & Trustee, Amrita Math",
    lienMarked: true,
    lienEndorsementDate: "2018-06-20",
    bankConfirmationRef: "HDFC/eBG/2018/1092",
    legacyPortalStatus: "Deposit Confirmed / Lien Active",
    status: "Verified & Active",
    verificationSource: "HDFC Open Banking Treasury API",
    scrutinyConfidence: 100.0,
    hasDiscrepancies: false,
    discrepancies: [],
    ocrExtracted: {
      fdrNo: "FDR/HDFC/11098234",
      amountMatch: true,
      jointNameMatch: true,
      lienClausePresent: true,
      autoRenewClause: true
    },
    lineage: [
      { event: "FDR Inception", date: "2018-06-15", detail: "₹1,00,00,000 deposit created with HDFC Bank (RBI Private Scheduled)" },
      { event: "Digital Lien Endorsement", date: "2018-06-20", detail: "Registered on AICTE Central Portal" }
    ],
    documents: [
      { name: "HDFC_Fixed_Deposit_Cert.pdf", size: "3.5 MB", type: "FDR Certificate", verified: true, sha256: "a1a814380db4eb16479f08878c3404229770554b50367dd4ac57fa67334c7006" }
    ],
    releaseDetails: null
  },
  {
    id: "FDR-2022-RRB-401",
    fdrNumber: "FDR/BUPB/9921048",
    institutionId: "1-55102941",
    institutionName: "Awadh Institute of Pharmacy & Polytechnic",
    trustName: "Awadh Shiksha Samiti",
    institutionCategory: "Private Self-Financed",
    isGovernmentExempt: false,
    region: "Northern",
    state: "Uttar Pradesh",
    city: "Faizabad",
    programType: "Pharmacy (B.Pharm/M.Pharm)",
    aphTableNorm: "APH 2024-27 Table 1.4 (₹30 Lakhs, 10-Yr Term)",
    purpose: "Establishment of Pharmacy Division in Semi-Urban District",
    amount: 3000000,
    currency: "INR",
    issuingBank: "Baroda UP Bank (Gramin)",
    bankCategory: "RBI Scheduled Regional Rural Bank",
    branchName: "Naka Branch, Ayodhya",
    ifsc: "BARB0BUPGB",
    accountNumber: "551201099238",
    issueDate: "2022-07-14",
    maturityDate: "2032-07-14",
    tenorYears: 10,
    daysRemaining: 2100,
    jointHolderName: "Member Secretary, AICTE & Secretary, Awadh Samiti",
    lienMarked: true,
    lienEndorsementDate: "2022-07-19",
    bankConfirmationRef: "BUPB/RRB/LNR/2022/104",
    legacyPortalStatus: "Deposit Confirmed / Lien Active",
    status: "Verified & Active",
    verificationSource: "RBI Scheduled RRB Clearing Interface",
    scrutinyConfidence: 98.7,
    hasDiscrepancies: false,
    discrepancies: [],
    ocrExtracted: {
      fdrNo: "FDR/BUPB/9921048",
      amountMatch: true,
      jointNameMatch: true,
      lienClausePresent: true,
      autoRenewClause: true
    },
    lineage: [
      { event: "Instrument Issued", date: "2022-07-14", detail: "₹30,00,000 deposit pledged via Baroda UP Bank (RBI Scheduled Gramin Bank)" }
    ],
    documents: [
      { name: "Gramin_Bank_FDR_Receipt.pdf", size: "2.2 MB", type: "FDR Receipt", verified: true, sha256: "3b8e72153b0bc87c32bf26fb96b0ee6934c264a7c06eb61cf6f991f8c85e2c56" }
    ],
    releaseDetails: null
  }
];

// Initial Tamper-Evident SHA-256 Ledger
export const INITIAL_LEDGER_CHAIN = [
  {
    blockIndex: 0,
    timestamp: "2024-01-01T00:00:00.000Z",
    action: "GENESIS_BLOCK",
    actor: "AICTE_ROOT_AUTHORITY",
    fdrId: "SYSTEM",
    previousHash: "0000000000000000000000000000000000000000000000000000000000000000",
    blockHash: "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
    details: "AICTE VISHWAS-FDR Cryptographic Governance Ledger initialized under APH 2024-27 mandate."
  },
  {
    blockIndex: 1,
    timestamp: "2024-01-15T10:14:00.000Z",
    action: "GOVT_EXEMPTION_AFFIDAVIT_VERIFIED",
    actor: "REGULATION_BUREAU_SCRUTINY",
    fdrId: "GOV-EXEMPT-2024-001",
    previousHash: "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
    blockHash: "9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08",
    details: "Anna University (CEG Guindy) exempted under APH 2024-27 Table 1.4 Clause (c). Affidavit verified."
  },
  {
    blockIndex: 2,
    timestamp: "2024-03-20T11:42:10.000Z",
    action: "FDR_LIEN_CONFIRMED",
    actor: "SBI_CENTRAL_SFMS_GATEWAY",
    fdrId: "FDR-2024-8841",
    previousHash: "9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08",
    blockHash: "5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8",
    details: "State Bank of India confirmed ₹35,00,000 lien marked to Member Secretary AICTE."
  },
  {
    blockIndex: 3,
    timestamp: "2024-08-15T09:30:22.000Z",
    action: "DISCREPANCY_FLAGGED",
    actor: "AUTONOMOUS_TRIANGULATION_ENGINE",
    fdrId: "FDR-2023-4109",
    previousHash: "5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8",
    blockHash: "4b227777d4dd1fc61c6f884f48641d02b4d121d3fd328cb08b5531fcacdabf8a",
    details: "Discrepancy: PNB CBS shows absence of AICTE joint lien endorsement."
  },
  {
    blockIndex: 4,
    timestamp: "2026-08-10T16:20:00.000Z",
    action: "RELEASE_PETITION_SUBMITTED",
    actor: "VIDYAVARDHAKA_SANGHA_TRUST",
    fdrId: "FDR-2016-1092",
    previousHash: "4b227777d4dd1fc61c6f884f48641d02b4d121d3fd328cb08b5531fcacdabf8a",
    blockHash: "ef2d127de37b942baad06145e54b0c619a1f22327b2ebbcfbec78f5564afe39d",
    details: "Institution completed 10-year mandatory term. Applied for full lien release and AICTE NOC."
  }
];

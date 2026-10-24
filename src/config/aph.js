/**
 * AICTE Approval Process Handbook (APH 2024-27)
 * Chapter I, Table 1.4: Security Deposit Requirements for Technical Institutions
 * 
 * This is the SINGLE SOURCE OF TRUTH for all screens, calculations,
 * validation rules, and release logic across the portal.
 */

export const APH_CONFIG = {
  handbookEdition: "APH 2024-25 to 2026-27",
  regulatoryClause: "Chapter I, Clause 1.4 & Table 1.4",
  lockInRules: {
    newInstitutionMaxYears: 10,
    programExpansionYears: 8,
    polytechnicYears: 8,
    nocMandatoryForRelease: true,
    jointLienClauseRequired: "Member Secretary, AICTE and Chairman/Secretary of the Trust/Society"
  },
  table1_4: [
    {
      id: "ENGG_UG",
      program: "Engineering & Technology (UG)",
      category: "Technical",
      minAmount: 3500000,
      minAmountLakhs: 35,
      tenorYears: 10,
      annualRenewalRequired: false,
      isExempt: false,
      description: "Mandatory 10-year joint FDR for establishment of new technical institutions."
    },
    {
      id: "MGMT_PG",
      program: "Management (MBA / PGDM)",
      category: "Management",
      minAmount: 2500000,
      minAmountLakhs: 25,
      tenorYears: 8,
      annualRenewalRequired: false,
      isExempt: false,
      description: "Mandatory 8-year joint FDR for standalone or integrated management programs."
    },
    {
      id: "PHARM_UG",
      program: "Pharmacy (B.Pharm / M.Pharm)",
      category: "Pharmacy",
      minAmount: 3000000,
      minAmountLakhs: 30,
      tenorYears: 10,
      annualRenewalRequired: false,
      isExempt: false,
      description: "Mandatory 10-year joint FDR pledged with Member Secretary, AICTE."
    },
    {
      id: "ARCH_UG",
      program: "Architecture & Town Planning",
      category: "Architecture",
      minAmount: 3500000,
      minAmountLakhs: 35,
      tenorYears: 10,
      annualRenewalRequired: false,
      isExempt: false,
      description: "Mandatory 10-year security deposit for Council of Architecture alignment."
    },
    {
      id: "HOTEL_HMCT",
      program: "Hotel Management & Catering (HMCT)",
      category: "Hotel Management",
      minAmount: 2000000,
      minAmountLakhs: 20,
      tenorYears: 8,
      annualRenewalRequired: false,
      isExempt: false,
      description: "Mandatory 8-year lock-in for diploma and degree hospitality courses."
    },
    {
      id: "POLY_DIPLOMA",
      program: "Polytechnic (Diploma Engineering)",
      category: "Polytechnic",
      minAmount: 2000000,
      minAmountLakhs: 20,
      tenorYears: 8,
      annualRenewalRequired: false,
      isExempt: false,
      description: "Mandatory 8-year security deposit for state board polytechnic diploma."
    },
    {
      id: "APPLIED_ARTS",
      program: "Applied Arts & Crafts",
      category: "Applied Arts",
      minAmount: 1500000,
      minAmountLakhs: 15,
      tenorYears: 8,
      annualRenewalRequired: false,
      isExempt: false,
      description: "Mandatory 8-year deposit for visual arts and applied design."
    },
    {
      id: "GOVT_EXEMPT",
      program: "Government / University Constituent (All)",
      category: "Government",
      minAmount: 0,
      minAmountLakhs: 0,
      tenorYears: 0,
      annualRenewalRequired: false,
      isExempt: true,
      exemptionClause: "Table 1.4 Clause (c): 100% Central/State Govt funded institutions exempt with verified affidavit.",
      description: "Exempt from financial collateral upon submission of State Secretary affidavit."
    }
  ],

  // RBI Scheduled Banks classification
  rbiScheduledBanks: [
    { name: "State Bank of India", code: "SBI", ifscPrefix: "SBIN", type: "Public Sector Scheduled Bank" },
    { name: "Punjab National Bank", code: "PNB", ifscPrefix: "PUNB", type: "Public Sector Scheduled Bank" },
    { name: "Canara Bank", code: "CANARA", ifscPrefix: "CNRB", type: "Public Sector Scheduled Bank" },
    { name: "Bank of Baroda", code: "BOB", ifscPrefix: "BARB", type: "Public Sector Scheduled Bank" },
    { name: "Union Bank of India", code: "UBI", ifscPrefix: "UBIN", type: "Public Sector Scheduled Bank" },
    { name: "Bank of India", code: "BOI", ifscPrefix: "BKID", type: "Public Sector Scheduled Bank" },
    { name: "Indian Bank", code: "INDIAN", ifscPrefix: "IDIB", type: "Public Sector Scheduled Bank" },
    { name: "HDFC Bank", code: "HDFC", ifscPrefix: "HDFC", type: "Private Scheduled Commercial Bank" },
    { name: "ICICI Bank", code: "ICICI", ifscPrefix: "ICIC", type: "Private Scheduled Commercial Bank" },
    { name: "Axis Bank", code: "AXIS", ifscPrefix: "UTIB", type: "Private Scheduled Commercial Bank" },
    { name: "Baroda UP Bank", code: "BUPB", ifscPrefix: "BARB0BUPGB", type: "RBI Scheduled Regional Rural Bank" },
    { name: "Kerala Gramin Bank", code: "KGB", ifscPrefix: "KLGB0040101", type: "RBI Scheduled Regional Rural Bank" }
  ],

  // Legacy sub-statuses matching AICTE Security Deposit Guide
  statusMapping: {
    DEPOSIT_REQUESTED: { label: "Deposit requested", stage: "Pending", gigwClass: "pending" },
    UNDER_SCRUTINY: { label: "Deposit received (under review)", stage: "Pending", gigwClass: "pending" },
    ACTIVE_VERIFIED: { label: "Active (lien confirmed)", stage: "Active", gigwClass: "verified" },
    DISCREPANCY_FLAGGED: { label: "Discrepancy flagged", stage: "Discrepancy", gigwClass: "flagged" },
    EXPIRING_SOON: { label: "Expiring (<60 days)", stage: "Expiring", gigwClass: "warning" },
    RELEASE_REQUESTED: { label: "Release requested (NOC review)", stage: "Release", gigwClass: "release" },
    RELEASED_DISCHARGED: { label: "Discharged (NOC issued)", stage: "Released", gigwClass: "released" },
    GOVT_EXEMPT: { label: "Govt exempt (affidavit verified)", stage: "Active", gigwClass: "exempt" }
  }
};

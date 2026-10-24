/**
 * AICTE Approval Process Handbook (APH 2024-27)
 * Chapter I, Table 1.4: Security Deposit Requirements for Technical Institutions
 * 
 * Verified statutory source of truth for:
 * - Minimum deposit calculations by Program × Level (Diploma / UG / PG)
 * - Single mandatory 10-year lock-in tenor
 * - Leased building 2x multiplier
 * - Chapter XI, Clause 11.8 discrepancy & penalty rules
 */

export const APH_CONFIG = {
  handbookEdition: "APH 2024-25 to 2026-27",
  regulatoryClause: "Chapter I, Clause 1.4 & Table 1.4",
  discrepancyClause: "Chapter XI, Clause 11.8",
  mandatoryTenorYears: 10,
  leasedBuildingMultiplier: 2,

  // Table 1.4 Matrix: Program × Level (Amounts in ₹ Lakhs)
  // All programs have a single mandatory 10-year tenor
  table1_4_matrix: [
    {
      program: "Engineering & Technology",
      diplomaLakhs: 15,
      ugLakhs: 35,
      pgLakhs: 15,
      notes: "Establishment of Technical Institution (Engineering)"
    },
    {
      program: "Planning",
      diplomaLakhs: 15,
      ugLakhs: 15,
      pgLakhs: 15,
      notes: "Town & Country Planning programs"
    },
    {
      program: "Applied Arts and Crafts",
      diplomaLakhs: 15,
      ugLakhs: 15,
      pgLakhs: 15,
      notes: "Applied Arts & Design disciplines"
    },
    {
      program: "Design",
      diplomaLakhs: 15,
      ugLakhs: 15,
      pgLakhs: 15,
      notes: "Industrial, Visual, Communication & Product Design"
    },
    {
      program: "Hotel Management & Catering Technology (HMCT)",
      diplomaLakhs: 15,
      ugLakhs: 15,
      pgLakhs: 15,
      notes: "Hospitality & Catering Technology"
    },
    {
      program: "Computer Applications",
      diplomaLakhs: null,
      ugLakhs: 5,   // BCA
      pgLakhs: 15,  // MCA
      notes: "BCA (UG: ₹5L) / MCA (PG: ₹15L)"
    },
    {
      program: "Management",
      diplomaLakhs: null,
      ugLakhs: 5,   // BBA
      pgLakhs: 15,  // MBA / PGDM
      notes: "BBA (UG: ₹5L) / MBA & PGDM (PG: ₹15L)"
    }
  ],

  // Flattened Table 1.4 lookup for easy selection across forms, filters, and seed generators
  table1_4: [
    {
      id: "ENGG_UG",
      program: "Engineering & Technology (UG)",
      category: "Engineering",
      level: "UG",
      minAmountLakhs: 35,
      minAmount: 3500000,
      tenorYears: 10,
      description: "Mandatory 10-year deposit for Under Graduate Engineering (APH Table 1.4)"
    },
    {
      id: "ENGG_DIPLOMA",
      program: "Engineering & Technology (Diploma)",
      category: "Engineering",
      level: "Diploma",
      minAmountLakhs: 15,
      minAmount: 1500000,
      tenorYears: 10,
      description: "Mandatory 10-year deposit for Polytechnic Diploma Engineering (APH Table 1.4)"
    },
    {
      id: "ENGG_PG",
      program: "Engineering & Technology (PG)",
      category: "Engineering",
      level: "PG",
      minAmountLakhs: 15,
      minAmount: 1500000,
      tenorYears: 10,
      description: "Mandatory 10-year deposit for M.Tech / ME (APH Table 1.4)"
    },
    {
      id: "MGMT_PG",
      program: "Management (PG - MBA/PGDM)",
      category: "Management",
      level: "PG",
      minAmountLakhs: 15,
      minAmount: 1500000,
      tenorYears: 10,
      description: "Mandatory 10-year deposit for MBA / PGDM (APH Table 1.4)"
    },
    {
      id: "MGMT_UG",
      program: "Management (UG - BBA)",
      category: "Management",
      level: "UG",
      minAmountLakhs: 5,
      minAmount: 500000,
      tenorYears: 10,
      description: "Mandatory 10-year deposit for Under Graduate Management (BBA) (APH Table 1.4)"
    },
    {
      id: "COMP_PG",
      program: "Computer Applications (PG - MCA)",
      category: "Computer Applications",
      level: "PG",
      minAmountLakhs: 15,
      minAmount: 1500000,
      tenorYears: 10,
      description: "Mandatory 10-year deposit for MCA (APH Table 1.4)"
    },
    {
      id: "COMP_UG",
      program: "Computer Applications (UG - BCA)",
      category: "Computer Applications",
      level: "UG",
      minAmountLakhs: 5,
      minAmount: 500000,
      tenorYears: 10,
      description: "Mandatory 10-year deposit for BCA (APH Table 1.4)"
    },
    {
      id: "PLANNING_ALL",
      program: "Planning (Diploma / UG / PG)",
      category: "Planning",
      level: "All",
      minAmountLakhs: 15,
      minAmount: 1500000,
      tenorYears: 10,
      description: "Mandatory 10-year deposit for Town & Country Planning (APH Table 1.4)"
    },
    {
      id: "APPLIED_ARTS_ALL",
      program: "Applied Arts & Crafts (All Levels)",
      category: "Applied Arts",
      level: "All",
      minAmountLakhs: 15,
      minAmount: 1500000,
      tenorYears: 10,
      description: "Mandatory 10-year deposit for Applied Arts & Crafts (APH Table 1.4)"
    },
    {
      id: "DESIGN_ALL",
      program: "Design (All Levels)",
      category: "Design",
      level: "All",
      minAmountLakhs: 15,
      minAmount: 1500000,
      tenorYears: 10,
      description: "Mandatory 10-year deposit for Design programs (APH Table 1.4)"
    },
    {
      id: "HMCT_ALL",
      program: "Hotel Management & Catering (HMCT)",
      category: "Hotel Management",
      level: "All",
      minAmountLakhs: 15,
      minAmount: 1500000,
      tenorYears: 10,
      description: "Mandatory 10-year deposit for Hotel Management & Catering (APH Table 1.4)"
    },
    {
      id: "GOVT_EXEMPT",
      program: "Government / University Constituent (All)",
      category: "Government",
      level: "All",
      minAmountLakhs: 0,
      minAmount: 0,
      tenorYears: 0,
      isExempt: true,
      description: "100% Central/State Govt funded institutions exempt with verified affidavit (Table 1.4 Clause c)"
    }
  ],

  // Excluded Programs per statutory jurisdiction
  excludedPrograms: [
    {
      name: "Pharmacy (B.Pharm / M.Pharm)",
      regulator: "Pharmacy Council of India (PCI)",
      note: "Not in AICTE Table 1.4 (Governed under Pharmacy Act 1948 / PCI regulations)."
    },
    {
      name: "Architecture (B.Arch / M.Arch)",
      regulator: "Council of Architecture (CoA)",
      note: "Not in AICTE Table 1.4 (Governed under Architects Act 1972 / CoA regulations)."
    }
  ],

  // Chapter XI, Clause 11.8 Discrepancy & Penalty Rules
  clause11_8_rules: {
    tenorShortfallPenaltyPct: 10, // 10% penalty flag on premature encashment or shortfall
    affidavitProofDeadlineDays: 15, // 15-day proof & affidavit submission deadline
    latePenaltyStages: [
      { daysLate: 15, penaltyPct: 10, label: "Stage 1: 10% statutory surcharge for 15-day delay" },
      { daysLate: 30, penaltyPct: 50, label: "Stage 2: 50% severe surcharge for 30+ day delay" }
    ],
    releasePrerequisites: [
      "10-year lock-in term complete (days_remaining <= 0)",
      "Zero open complaints or pending inquiry",
      "Two-officer biometric approval (Scrutiny Officer + Approving Authority / Director)",
      "Formal NOC issued to Bank CBS"
    ]
  },

  // RBI Scheduled Commercial Banks Registry
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
    { name: "Axis Bank", code: "AXIS", ifscPrefix: "UTIB", type: "Private Scheduled Commercial Bank" }
  ],

  /**
   * Calculates the exact statutory deposit requirement
   * @param {string} program - Program name
   * @param {boolean} isLeasedBuilding - True if operating on leased premises (2x multiplier)
   * @param {boolean} isGovtExempt - True if 100% government funded
   */
  calculateRequirement(program, isLeasedBuilding = false, isGovtExempt = false) {
    if (isGovtExempt || program === "GOVT_EXEMPT" || (typeof program === 'string' && program.startsWith("Government"))) {
      return { minAmount: 0, minAmountLakhs: 0, tenorYears: 0, isExempt: true, multiplier: 1, baseLakhs: 0, isLeasedApplied: false };
    }

    if (!program || typeof program !== 'string') {
      throw new Error("Invalid program identifier: program parameter is required");
    }

    // Exact match on id or exact program name (No loose substring matching)
    const norm = this.table1_4.find(n => n.id === program || n.program === program);
    if (!norm) {
      throw new Error(`Unknown program: "${program}" is not in Table 1.4 (Pharmacy & Architecture are governed by PCI/CoA, not in AICTE Table 1.4).`);
    }

    const multiplier = isLeasedBuilding ? this.leasedBuildingMultiplier : 1;
    const baseLakhs = norm.minAmountLakhs;
    const finalLakhs = baseLakhs * multiplier;

    return {
      minAmount: finalLakhs * 100000,
      minAmountLakhs: finalLakhs,
      tenorYears: norm.tenorYears || this.mandatoryTenorYears,
      isExempt: false,
      multiplier,
      baseLakhs,
      isLeasedApplied: Boolean(isLeasedBuilding),
      programId: norm.id,
      programName: norm.program
    };
  }
};

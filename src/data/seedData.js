/**
 * AICTE VISHWAS-FDR • 200+ Institution Synthetic Seed Generator
 * Modelled strictly on AICTE Approved Institutions Data & APH 2024-27 (Table 1.4).
 * 
 * ETHICAL DISCLOSURE:
 * All records are synthesized for benchmark testing. Neutral records use real institute 
 * profiles from the AICTE public directory. Flagged/discrepancy scenarios strictly use 
 * simulated fictional institute names to protect institutional reputation.
 */

import { APH_CONFIG } from '../config/aph';

const REAL_INSTITUTIONS_BASE = [
  { name: "Kalinga Institute of Advanced Technology", trust: "Kalinga Vidya Bharati Foundation", city: "Bhubaneswar", state: "Odisha", region: "Eastern", program: "Engineering & Technology (UG)" },
  { name: "Vidyavardhaka College of Engineering", trust: "Vidyavardhaka Sangha Trust", city: "Mysuru", state: "Karnataka", region: "South-Western", program: "Engineering & Technology (UG)" },
  { name: "College of Engineering, Guindy", trust: "Government of Tamil Nadu", city: "Chennai", state: "Tamil Nadu", region: "Southern", program: "Government / University Constituent (All)", isGovt: true },
  { name: "Amrita School of Engineering & Technology", trust: "Mata Amritanandamayi Math", city: "Coimbatore", state: "Tamil Nadu", region: "Southern", program: "Engineering & Technology (UG)" },
  { name: "Symbiosis Institute of Business & Digital Media", trust: "Symbiosis International Society", city: "Pune", state: "Maharashtra", region: "Western", program: "Management (MBA / PGDM)" },
  { name: "BMS College of Engineering", trust: "BMS Educational Trust", city: "Bengaluru", state: "Karnataka", region: "South-Western", program: "Engineering & Technology (UG)" },
  { name: "PSG College of Technology", trust: "PSG & Sons Charities Trust", city: "Coimbatore", state: "Tamil Nadu", region: "Southern", program: "Engineering & Technology (UG)" },
  { name: "Thapar Institute of Advanced Research", trust: "Thapar Educational Society", city: "Patiala", state: "Punjab", region: "North-West", program: "Engineering & Technology (UG)" },
  { name: "Vellore Institute of Technology Campus", trust: "Vellore Educational Trust", city: "Vellore", state: "Tamil Nadu", region: "Southern", program: "Engineering & Technology (UG)" },
  { name: "Birla Institute of Applied Management", trust: "Birla Academy of Art and Culture", city: "Kolkata", state: "West Bengal", region: "Eastern", program: "Management (MBA / PGDM)" },
  { name: "Government College of Engineering, Pune", trust: "State Govt of Maharashtra", city: "Pune", state: "Maharashtra", region: "Western", program: "Government / University Constituent (All)", isGovt: true },
  { name: "Delhi Technological University Campus", trust: "Govt of NCT of Delhi", city: "New Delhi", state: "Delhi", region: "Northern", program: "Government / University Constituent (All)", isGovt: true },
  { name: "Manipal Institute of Pharmaceutical Sciences", trust: "Academy of General Education", city: "Manipal", state: "Karnataka", region: "South-Western", program: "Pharmacy (B.Pharm / M.Pharm)" },
  { name: "Jadavpur University Faculty of Engineering", trust: "State Govt of West Bengal", city: "Kolkata", state: "West Bengal", region: "Eastern", program: "Government / University Constituent (All)", isGovt: true },
  { name: "Sardar Vallabhbhai Patel Institute of Tech", trust: "Vasavada Education Trust", city: "Vasad", state: "Gujarat", region: "Central", program: "Engineering & Technology (UG)" },
  { name: "Institute of Chemical Technology", trust: "Govt of Maharashtra / Deemed", city: "Mumbai", state: "Maharashtra", region: "Western", program: "Government / University Constituent (All)", isGovt: true },
  { name: "Chitkara Institute of Architecture & Planning", trust: "Chitkara Educational Trust", city: "Rajpura", state: "Punjab", region: "North-West", program: "Architecture & Town Planning" },
  { name: "Walchand College of Engineering", trust: "Administrative Council of Walchand", city: "Sangli", state: "Maharashtra", region: "Western", program: "Engineering & Technology (UG)" },
  { name: "National Institute of Applied Management", trust: "Jaipur Educational Foundation", city: "Jaipur", state: "Rajasthan", region: "North-West", program: "Management (MBA / PGDM)" },
  { name: "Madhav Institute of Technology & Science", trust: "Scindia Engineering College Society", city: "Gwalior", state: "Madhya Pradesh", region: "Central", program: "Engineering & Technology (UG)" }
];

// Fictional Simulated Institutions for Discrepancy Scenarios
const FICTIONAL_DISCREPANCY_INSTITUTIONS = [
  { name: "[Simulated] Apex Institute of Applied Computing", trust: "Simulated Technical Education Trust", city: "Lucknow", state: "Uttar Pradesh", region: "Northern", program: "Engineering & Technology (UG)" },
  { name: "[Simulated] Devgiri Polytechnic Academy", trust: "Devgiri Vidya Vikas Society", city: "Aurangabad", state: "Maharashtra", region: "Western", program: "Polytechnic (Diploma Engineering)" },
  { name: "[Simulated] Vandana School of Management Studies", trust: "Vandana Charitable Foundation", city: "Kanpur", state: "Uttar Pradesh", region: "Northern", program: "Management (MBA / PGDM)" }
];

const STATES_LIST = [
  { state: "Maharashtra", region: "Western", city: "Mumbai" },
  { state: "Tamil Nadu", region: "Southern", city: "Chennai" },
  { state: "Karnataka", region: "South-Western", city: "Bengaluru" },
  { state: "Uttar Pradesh", region: "Northern", city: "Lucknow" },
  { state: "Gujarat", region: "Central", city: "Ahmedabad" },
  { state: "Andhra Pradesh", region: "Southern", city: "Vijayawada" },
  { state: "Telangana", region: "South-Western", city: "Hyderabad" },
  { state: "Odisha", region: "Eastern", city: "Bhubaneswar" },
  { state: "West Bengal", region: "Eastern", city: "Kolkata" },
  { state: "Madhya Pradesh", region: "Central", city: "Bhopal" },
  { state: "Punjab", region: "North-West", city: "Chandigarh" },
  { state: "Rajasthan", region: "North-West", city: "Jaipur" },
  { state: "Kerala", region: "Southern", city: "Kochi" },
  { state: "Delhi", region: "Northern", city: "New Delhi" },
  { state: "Haryana", region: "North-West", city: "Gurugram" },
  { state: "Bihar", region: "Northern", city: "Patna" },
  { state: "Assam", region: "Eastern", city: "Guwahati" },
  { state: "Jharkhand", region: "Eastern", city: "Ranchi" },
  { state: "Chhattisgarh", region: "Central", city: "Raipur" },
  { state: "Uttarakhand", region: "Northern", city: "Dehradun" }
];

export function generateSyntheticSeedDataset(targetCount = 208) {
  const dataset = [];

  // 1. Primary Highlight Cases (Curated for Demonstrations)
  // Case A: Clean Active 10-Yr Deposit
  dataset.push({
    id: "FDR-2024-8841",
    fdrNumber: "FDR/SBI/782194002",
    institutionId: "1-93284711",
    institutionName: "Kalinga Institute of Advanced Technology",
    trustName: "Kalinga Vidya Bharati Educational Foundation",
    isGovernmentExempt: false,
    region: "Eastern",
    state: "Odisha",
    city: "Bhubaneswar",
    programType: "Engineering & Technology (UG)",
    aphNormCode: "ENGG_UG",
    amount: 3500000,
    issuingBank: "State Bank of India",
    bankType: "Public Sector Scheduled Bank",
    ifsc: "SBIN0006240",
    accountNumber: "38920194821",
    issueDate: "2024-03-15",
    maturityDate: "2034-03-15",
    tenorYears: 10,
    daysRemaining: 2700,
    jointHolderName: "Member Secretary, AICTE & Chairman, Kalinga Foundation",
    lienMarked: true,
    bankConfirmed: true,
    trustLevel: "bank", // 'declared' | 'officer' | 'bank'
    ocrMatchPct: 99.4,
    status: "Active",
    legacyStatus: "Lien confirmed",
    hasDiscrepancies: false,
    discrepancies: [],
    purpose: "Establishment of New Technical Institute (Young Institute < 5y)",
    releaseDetails: null
  });

  // Case B: Discrepancy Flagged (Fictional Name for Ethics)
  dataset.push({
    id: "FDR-2023-4109",
    fdrNumber: "FDR/PNB/661039811",
    institutionId: "1-44719022",
    institutionName: "[Simulated] Apex Institute of Applied Computing",
    trustName: "Simulated Technical Education Trust",
    isGovernmentExempt: false,
    region: "Northern",
    state: "Uttar Pradesh",
    city: "Lucknow",
    programType: "Engineering & Technology (UG)",
    aphNormCode: "ENGG_UG",
    amount: 1500000, // Claimed ₹15 Lakhs (APH requires 35L)
    issuingBank: "Punjab National Bank",
    bankType: "Public Sector Scheduled Bank",
    ifsc: "PUNB0024000",
    accountNumber: "0240002100892",
    issueDate: "2023-08-10",
    maturityDate: "2028-08-10", // 5 Years (APH requires 10 years)
    tenorYears: 5,
    daysRemaining: 655,
    jointHolderName: "Secretary, Simulated Trust only", // Missing Member Secretary AICTE
    lienMarked: false,
    bankConfirmed: false,
    trustLevel: "declared",
    ocrMatchPct: 62.0,
    status: "Discrepancy",
    legacyStatus: "Deposit received (under review)",
    hasDiscrepancies: true,
    discrepancies: [
      {
        field: "Joint Holder Clause",
        institutionClaim: "Member Secretary AICTE & Trust Secretary",
        bankRecord: "Only Secretary, Simulated Technical Trust",
        severity: "CRITICAL",
        recommendation: "Reject submission. Issue mandate to add Member Secretary AICTE as primary pledgee."
      },
      {
        field: "Maturity Period (Tenor)",
        institutionClaim: "10 Years Mandatory Term",
        bankRecord: "5 Years (Matures 2028-08-10)",
        severity: "HIGH",
        recommendation: "APH 2024-27 Table 1.4 mandates minimum 10-year lock-in."
      },
      {
        field: "Deposit Amount",
        institutionClaim: "₹35,00,000 (Mandatory Table 1.4)",
        bankRecord: "₹15,00,000 (Shortfall of ₹20 Lakhs)",
        severity: "CRITICAL",
        recommendation: "Demand supplementary deposit of ₹20 Lakhs."
      }
    ],
    purpose: "Additional Program Intake Approval",
    releaseDetails: null
  });

  // Case C: Matured 10-Yr Term (Two-Officer Release Pending)
  dataset.push({
    id: "FDR-2016-1092",
    fdrNumber: "FDR/CANARA/901238491",
    institutionId: "1-10294812",
    institutionName: "Vidyavardhaka College of Engineering",
    trustName: "Vidyavardhaka Sangha Trust",
    isGovernmentExempt: false,
    region: "South-Western",
    state: "Karnataka",
    city: "Mysuru",
    programType: "Engineering & Technology (UG)",
    aphNormCode: "ENGG_UG",
    amount: 5000000,
    issuingBank: "Canara Bank",
    bankType: "Public Sector Scheduled Bank",
    ifsc: "CNRB0000452",
    accountNumber: "0452101099234",
    issueDate: "2016-04-12",
    maturityDate: "2026-04-12",
    tenorYears: 10,
    daysRemaining: -195,
    jointHolderName: "Member Secretary, AICTE & President, Vidyavardhaka Sangha",
    lienMarked: true,
    bankConfirmed: true,
    trustLevel: "officer",
    ocrMatchPct: 98.9,
    status: "Release",
    legacyStatus: "Release requested (NOC review)",
    hasDiscrepancies: false,
    discrepancies: [],
    purpose: "Initial Establishment Security Deposit (10-Year Term Met)",
    releaseDetails: {
      requestDate: "2026-08-10",
      reason: "Successful completion of 10-year regulatory lock-in period with full NBA accreditation and zero pending student complaints.",
      workflowStep: 2, // Officer 1 checked, Officer 2 sanction pending
      conditionChecklist: {
        lockInFulfilled: true,
        noCourtStay: true,
        noStudentGrievance: true,
        roClearanceSigned: true,
        bankNoLienDemandReady: true
      },
      dischargeCertificateRef: "AICTE/REG/FDR-REL/2026/089"
    }
  });

  // Case D: Government Exemption (Table 1.4 Clause c)
  dataset.push({
    id: "GOV-EXEMPT-2024-001",
    fdrNumber: "EXEMPT/GOV/TN/2024",
    institutionId: "1-00291841",
    institutionName: "College of Engineering, Guindy",
    trustName: "State Government of Tamil Nadu",
    isGovernmentExempt: true,
    region: "Southern",
    state: "Tamil Nadu",
    city: "Chennai",
    programType: "Government / University Constituent (All)",
    aphNormCode: "GOVT_EXEMPT",
    amount: 0,
    issuingBank: "State Bank of India (Govt Treasury)",
    bankType: "Public Sector Scheduled Bank",
    ifsc: "SBIN0006463",
    accountNumber: "GOV-TREASURY-EXEMPT",
    issueDate: "2024-01-10",
    maturityDate: "2099-12-31",
    tenorYears: 0,
    daysRemaining: 26000,
    jointHolderName: "Not Applicable (Govt Exemption)",
    lienMarked: true,
    bankConfirmed: true,
    trustLevel: "officer",
    ocrMatchPct: 100.0,
    status: "Active",
    legacyStatus: "Govt exempt (affidavit verified)",
    hasDiscrepancies: false,
    discrepancies: [],
    purpose: "Government Engineering College - Zero Deposit Mandated with Affidavit",
    releaseDetails: null
  });

  // Case E: Expiring in < 30 Days (Critical Runway Trigger)
  dataset.push({
    id: "FDR-2021-9920",
    fdrNumber: "FDR/BOB/554109823",
    institutionId: "1-33829011",
    institutionName: "Symbiosis Institute of Business & Digital Media",
    trustName: "Symbiosis International Society",
    isGovernmentExempt: false,
    region: "Western",
    state: "Maharashtra",
    city: "Pune",
    programType: "Management (MBA / PGDM)",
    aphNormCode: "MGMT_PG",
    amount: 2500000,
    issuingBank: "Bank of Baroda",
    bankType: "Public Sector Scheduled Bank",
    ifsc: "BARB0SENAPA",
    accountNumber: "28410294811",
    issueDate: "2021-11-20",
    maturityDate: "2026-11-20",
    tenorYears: 5,
    daysRemaining: 27, // 27 Days Left!
    jointHolderName: "Member Secretary, AICTE & Director, Symbiosis",
    lienMarked: true,
    bankConfirmed: true,
    trustLevel: "bank",
    ocrMatchPct: 97.8,
    status: "Expiring",
    legacyStatus: "Expiring (<60 days)",
    hasDiscrepancies: false,
    discrepancies: [],
    purpose: "Management Division Expansion",
    releaseDetails: null
  });

  // 2. Generate remaining synthetic records up to targetCount
  const banks = APH_CONFIG.rbiScheduledBanks;
  const programs = APH_CONFIG.table1_4.filter(p => !p.isExempt);
  const statuses = ["Active", "Active", "Active", "Expiring", "Matured", "Renewed", "Release", "Pending"];

  for (let i = dataset.length; i < targetCount; i++) {
    const loc = STATES_LIST[i % STATES_LIST.length];
    const bank = banks[i % banks.length];
    const prog = programs[i % programs.length];
    const statusChoice = statuses[i % statuses.length];

    // Compute realistic issue & maturity dates
    const issueYear = 2016 + (i % 8);
    const tenor = prog.tenorYears;
    const maturityYear = issueYear + tenor;
    const issueMonth = String(1 + (i % 12)).padStart(2, '0');
    const issueDay = String(1 + (i % 28)).padStart(2, '0');
    const issueDate = `${issueYear}-${issueMonth}-${issueDay}`;
    const maturityDate = `${maturityYear}-${issueMonth}-${issueDay}`;

    // Compute days remaining from Oct 2026
    const maturityMs = new Date(maturityDate).getTime();
    const todayMs = new Date('2026-10-24').getTime();
    let daysRemaining = Math.round((maturityMs - todayMs) / (1000 * 60 * 60 * 24));

    let finalStatus = statusChoice;
    if (daysRemaining <= 0 && statusChoice !== "Released") {
      finalStatus = i % 2 === 0 ? "Matured" : "Renewed";
    } else if (daysRemaining > 0 && daysRemaining <= 60) {
      finalStatus = "Expiring";
    }

    const realInst = REAL_INSTITUTIONS_BASE[i % REAL_INSTITUTIONS_BASE.length];
    const instName = `${realInst.name} [Campus ${Math.floor(i / REAL_INSTITUTIONS_BASE.length) + 1}]`;

    dataset.push({
      id: `FDR-${issueYear}-${1000 + i}`,
      fdrNumber: `FDR/${bank.code}/${78000000 + i}`,
      institutionId: `1-${10000000 + (i * 3821) % 90000000}`,
      institutionName: instName,
      trustName: `${realInst.trust}`,
      isGovernmentExempt: false,
      region: loc.region,
      state: loc.state,
      city: loc.city,
      programType: prog.program,
      aphNormCode: prog.id,
      amount: prog.minAmount,
      issuingBank: bank.name,
      bankType: bank.type,
      ifsc: `${bank.ifscPrefix}${String(1000 + (i % 8999))}`,
      accountNumber: `401${String(10000000 + i)}`,
      issueDate,
      maturityDate,
      tenorYears: tenor,
      daysRemaining,
      jointHolderName: `Member Secretary, AICTE & Secretary, ${realInst.trust.split(' ')[0]}`,
      lienMarked: true,
      bankConfirmed: i % 3 !== 0,
      trustLevel: i % 3 === 0 ? "officer" : i % 2 === 0 ? "bank" : "declared",
      ocrMatchPct: 94.0 + ((i * 17) % 60) / 10,
      status: finalStatus,
      legacyStatus: finalStatus === "Active" ? "Lien confirmed" : finalStatus === "Expiring" ? "Expiring (<60 days)" : finalStatus === "Release" ? "Release requested" : "Deposit confirmed",
      hasDiscrepancies: false,
      discrepancies: [],
      purpose: `APH Table 1.4 Deposit for ${prog.program}`,
      releaseDetails: finalStatus === "Release" ? {
        requestDate: "2026-09-15",
        reason: "Completed full regulatory lock-in period with zero complaints.",
        workflowStep: 1,
        conditionChecklist: { lockInFulfilled: true, noCourtStay: true, noStudentGrievance: true, roClearanceSigned: true, bankNoLienDemandReady: true }
      } : null
    });
  }

  return dataset;
}

export const SEED_DATASET_200 = generateSyntheticSeedDataset(208);

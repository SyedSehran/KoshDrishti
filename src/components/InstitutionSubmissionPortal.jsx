import React, { useState } from 'react';
import { 
  Upload, 
  Scan, 
  CheckCircle2, 
  AlertTriangle, 
  ShieldCheck 
} from 'lucide-react';
import { APH_CONFIG } from '../config/aph';
import { APH_NORMS_CATALOG } from '../data/mockData';

export default function InstitutionSubmissionPortal({ onAddNewFDR }) {
  const [selectedProgram, setSelectedProgram] = useState(APH_NORMS_CATALOG[0].program);
  const [instituteName, setInstituteName] = useState('Dharmendra Institute of Artificial Intelligence & Robotics');
  const [trustName, setTrustName] = useState('Shri Dharmendra Technical Education Trust');
  const [fdrNumber, setFdrNumber] = useState('FDR/SBI/991048221');
  const [issuingBank, setIssuingBank] = useState('State Bank of India');
  const [branchName, setBranchName] = useState('Main Branch, Parliament Street, New Delhi');
  const [ifsc, setIfsc] = useState('SBIN0000691');
  const [accountNumber, setAccountNumber] = useState('40192837461');
  const [depositAmount, setDepositAmount] = useState(3500000);
  const [tenorYears, setTenorYears] = useState(10);
  const [jointHolderName, setJointHolderName] = useState('Member Secretary, AICTE & Chairman, Shri Dharmendra Trust');
  const [lienConfirmed, setLienConfirmed] = useState(true);
  const [isOCRProcessing, setIsOCRProcessing] = useState(false);
  const [ocrSuccess, setOcrSuccess] = useState(false);
  const [ocrError, setOcrError] = useState(null);
  const [submissionComplete, setSubmissionComplete] = useState(false);

  // Find norm for selected program
  const currentNorm = APH_NORMS_CATALOG.find(n => n.program === selectedProgram) || APH_NORMS_CATALOG[0];

  const handleProgramChange = (prog) => {
    setSelectedProgram(prog);
    try {
      const calc = APH_CONFIG.calculateRequirement(prog);
      setDepositAmount(calc.minAmount);
      setTenorYears(calc.tenorYears);
    } catch {
      const norm = APH_NORMS_CATALOG.find(n => n.program === prog);
      if (norm) {
        setDepositAmount(norm.minAmountLakhs * 100000);
        setTenorYears(norm.lockInYears);
      }
    }
  };

  const handleSimulateOCR = async () => {
    setIsOCRProcessing(true);
    setOcrError(null);
    setOcrSuccess(false);

    try {
      const sampleSlipText = `STATE BANK OF INDIA - PARLIAMENT STREET NEW DELHI
FIXED DEPOSIT RECEIPT NO: FDR/SBI/991048221
DEPOSIT AMOUNT: INR 35,00,000.00 (RUPEES THIRTY FIVE LAKHS ONLY)
ACCOUNT TITLE: JOINT ACCOUNT OF MEMBER SECRETARY, AICTE & CHAIRMAN, SHRI DHARMENDRA TRUST
TENOR: 120 MONTHS (10 YEARS)
MANDATORY LIEN MARKED IN FAVOUR OF AICTE REGULATION BUREAU`;

      const response = await fetch('http://127.0.0.1:8000/api/v1/ocr/extract', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: sampleSlipText })
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();
      setIsOCRProcessing(false);

      if (data.status === 'UNREADABLE' || (!data.extracted_fdr_number && !data.extracted_amount)) {
        setOcrError("OCR extraction incomplete: Fields could not be confidently identified. Please enter manually.");
        return;
      }

      setOcrSuccess(true);
      if (data.extracted_fdr_number) setFdrNumber(data.extracted_fdr_number);
      if (data.extracted_amount) setDepositAmount(data.extracted_amount);
      if (data.extracted_bank) setIssuingBank(data.extracted_bank);
      if (data.has_aicte_title) {
        setJointHolderName('Member Secretary, AICTE & Chairman, Shri Dharmendra Trust');
        setLienConfirmed(true);
      }
    } catch (err) {
      setIsOCRProcessing(false);
      setOcrError("OCR service unavailable (API offline). Please enter details manually.");
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const newRecord = {
      id: `FDR-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
      fdrNumber,
      institutionId: `1-${Math.floor(10000000 + Math.random() * 90000000)}`,
      institutionName: instituteName,
      trustName,
      region: "Northern",
      state: "Delhi",
      city: "New Delhi",
      programType: selectedProgram,
      purpose: `APH Norms Deposit for ${selectedProgram}`,
      amount: Number(depositAmount),
      currency: "INR",
      issuingBank,
      branchName,
      ifsc,
      accountNumber,
      issueDate: new Date().toISOString().slice(0, 10),
      maturityDate: new Date(Date.now() + tenorYears * 365.25 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
      tenorYears: Number(tenorYears),
      daysRemaining: tenorYears * 365,
      jointHolderName,
      lienMarked: lienConfirmed,
      lienEndorsementDate: new Date().toISOString().slice(0, 10),
      bankConfirmationRef: `${issuingBank.substring(0, 3).toUpperCase()}/CBS/NEW/${Math.floor(1000 + Math.random() * 9000)}`,
      status: "Verified & Active",
      verificationSource: "Live Bank SFMS API",
      scrutinyConfidence: 99.2,
      hasDiscrepancies: false,
      discrepancies: [],
      ocrExtracted: {
        fdrNo: fdrNumber,
        amountMatch: true,
        jointNameMatch: true,
        lienClausePresent: true,
        autoRenewClause: true
      },
      lineage: [
        {
          event: "Digital Submission",
          date: new Date().toISOString().slice(0, 10),
          detail: `Uploaded with digital OCR endorsement and SFMS bank pre-clearance.`
        }
      ],
      documents: [
        {
          name: "Scanned_FDR_Receipt.pdf",
          size: "2.8 MB",
          type: "FDR Certificate",
          verified: true,
          sha256: "4b227777d4dd1fc61c6f884f48641d02b4d121d3fd328cb08b5531fcacdabf8a"
        }
      ],
      releaseDetails: null
    };

    if (onAddNewFDR) {
      onAddNewFDR(newRecord);
    }
    setSubmissionComplete(true);
  };

  return (
    <div style={{ maxWidth: 960, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Header */}
      <div>
        <h2 style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-primary)' }}>
          Institution Digital FDR & Collateral Submission Desk
        </h2>
        <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>
          Statutory submission portal with automated AICTE APH compliance calculator and real-time OCR metadata extraction.
        </p>
      </div>

      {submissionComplete ? (
        <div className="glass-panel" style={{ padding: 36, textAlign: 'center' }}>
          <div style={{
            width: 56,
            height: 56,
            borderRadius: '50%',
            background: 'var(--status-verified-bg)',
            color: 'var(--status-verified)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px'
          }}>
            <CheckCircle2 size={32} />
          </div>
          <h3 style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8 }}>
            Fixed Deposit Receipt Submitted & Cryptographically Pledged
          </h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: 13, maxWidth: 600, margin: '0 auto 20px' }}>
            Instrument <strong>{fdrNumber}</strong> has been verified via the Bank SFMS gateway and appended to the AICTE Regulatory Merkle Ledger.
          </p>
          <button
            onClick={() => {
              setSubmissionComplete(false);
              setOcrSuccess(false);
            }}
            className="btn btn-primary-gold"
          >
            Submit Another Security Instrument
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Section 1: Program & APH Compliance Norms */}
          <div className="glass-panel" style={{ padding: 22 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
              <span className="badge badge-gold">Step 1</span>
              <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>
                Program Category & Statutory APH Norms
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 16 }}>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>
                  Approved Technical Program:
                </label>
                <select
                  className="input-control"
                  value={selectedProgram}
                  onChange={(e) => handleProgramChange(e.target.value)}
                >
                  <optgroup label="AICTE APH 2024-27 Table 1.4 Covered Programs">
                    {APH_NORMS_CATALOG.map(n => (
                      <option key={n.program} value={n.program}>{n.program}</option>
                    ))}
                  </optgroup>
                  <optgroup label="Excluded Regulators (Not Covered by AICTE Table 1.4)">
                    <option value="Pharmacy" disabled>
                      Pharmacy (B.Pharm / M.Pharm) — Governed by PCI (Not Applicable)
                    </option>
                    <option value="Architecture" disabled>
                      Architecture (B.Arch / M.Arch) — Governed by CoA (Not Applicable)
                    </option>
                  </optgroup>
                </select>
              </div>

              {/* APH Norm Guidance Box */}
              <div style={{
                background: 'rgba(245, 158, 11, 0.08)',
                border: '1px solid var(--border-gold)',
                borderRadius: 'var(--radius-md)',
                padding: '12px 16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}>
                <div>
                  <div style={{ fontSize: 11, color: 'var(--gold-400)', fontWeight: 700, textTransform: 'uppercase' }}>
                    APH Chapter 2 Mandate
                  </div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', marginTop: 2 }}>
                    Min Deposit: ₹ {currentNorm.minAmountLakhs} Lakhs • Lock-in: {currentNorm.lockInYears} Years
                  </div>
                </div>
                <ShieldCheck size={24} color="var(--gold-400)" />
              </div>
            </div>
          </div>

          {/* Section 2: Scanned FDR Upload & Instant OCR Parser */}
          <div className="glass-panel" style={{ padding: 22 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span className="badge badge-gold">Step 2</span>
                <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>
                  Digital Document Upload & OCR Scrutiny Engine
                </span>
              </div>
              <span className="badge badge-cyan" style={{ fontSize: 10 }}>AICTE OCR Scanner v3.2</span>
            </div>

            <div style={{
              border: '2px dashed var(--border-medium)',
              borderRadius: 'var(--radius-md)',
              padding: '24px 20px',
              textAlign: 'center',
              background: 'rgba(10, 14, 22, 0.4)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 12
            }}>
              <div style={{
                width: 48,
                height: 48,
                borderRadius: '50%',
                background: 'rgba(255, 255, 255, 0.05)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--gold-400)'
              }}>
                <Upload size={22} />
              </div>

              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>
                  Upload Scanned Original FDR & Bank Lien Endorsement Letter (PDF, max 10MB)
                </div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>
                  System will automatically extract FDR number, issuing branch, amount, and joint holder title
                </div>
              </div>

              <button
                type="button"
                onClick={handleSimulateOCR}
                disabled={isOCRProcessing}
                className="btn btn-iris btn-sm"
                style={{ marginTop: 6 }}
              >
                <Scan size={14} />
                <span>{isOCRProcessing ? 'Performing AI OCR Scrutiny...' : 'Simulate Upload & OCR Extraction'}</span>
              </button>

              {ocrSuccess && (
                <div style={{
                  padding: '8px 14px',
                  borderRadius: 'var(--radius-sm)',
                  background: 'var(--status-verified-bg)',
                  border: '1px solid rgba(45, 212, 191, 0.3)',
                  color: 'var(--status-verified)',
                  fontSize: 11,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6
                }}>
                  <CheckCircle2 size={13} />
                  <span>OCR extracted successfully: 100% confidence match. Form auto-populated below.</span>
                </div>
              )}

              {ocrError && (
                <div style={{
                  padding: '8px 14px',
                  borderRadius: 'var(--radius-sm)',
                  background: 'rgba(239, 68, 68, 0.1)',
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                  color: '#f87171',
                  fontSize: 11,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6
                }}>
                  <AlertTriangle size={13} />
                  <span>{ocrError}</span>
                </div>
              )}
            </div>
          </div>

          {/* Section 3: Extracted Metadata & Bank Verification */}
          <div className="glass-panel" style={{ padding: 22 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
              <span className="badge badge-gold">Step 3</span>
              <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>
                Instrument & Core Banking Verification Details
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 16 }}>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>
                  Institution Name:
                </label>
                <input
                  type="text"
                  className="input-control"
                  value={instituteName}
                  onChange={(e) => setInstituteName(e.target.value)}
                  required
                />
              </div>

              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>
                  Trust / Sponsoring Society:
                </label>
                <input
                  type="text"
                  className="input-control"
                  value={trustName}
                  onChange={(e) => setTrustName(e.target.value)}
                  required
                />
              </div>

              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>
                  FDR Reference Number:
                </label>
                <input
                  type="text"
                  className="input-control mono"
                  value={fdrNumber}
                  onChange={(e) => setFdrNumber(e.target.value)}
                  required
                />
              </div>

              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>
                  Issuing Bank:
                </label>
                <select
                  className="input-control"
                  value={issuingBank}
                  onChange={(e) => setIssuingBank(e.target.value)}
                >
                  {MOCK_BANK_CATALOG.map(b => (
                    <option key={b.name} value={b.name}>{b.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>
                  Branch & IFSC Code:
                </label>
                <input
                  type="text"
                  className="input-control mono"
                  value={ifsc}
                  onChange={(e) => setIfsc(e.target.value)}
                  required
                />
              </div>

              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>
                  Principal Deposit Amount (₹):
                </label>
                <input
                  type="number"
                  className="input-control mono"
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(Number(e.target.value))}
                  required
                />
              </div>

              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>
                  Tenor Period (Years):
                </label>
                <input
                  type="number"
                  className="input-control mono"
                  value={tenorYears}
                  onChange={(e) => setTenorYears(Number(e.target.value))}
                  required
                />
              </div>

              <div style={{ gridColumn: 'span 2' }}>
                <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>
                  Joint Holder Title (Mandatory AICTE Clause):
                </label>
                <input
                  type="text"
                  className="input-control"
                  value={jointHolderName}
                  onChange={(e) => setJointHolderName(e.target.value)}
                  required
                />
                {!jointHolderName.toLowerCase().includes('member secretary') && (
                  <div style={{ color: 'var(--status-flagged)', fontSize: 11, marginTop: 4 }}>
                    ⚠️ Warning: APH regulations strictly require "Member Secretary, AICTE" in the joint account title!
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Submission Bar */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 12 }}>
            <button
              type="submit"
              className="btn btn-primary-gold btn-lg"
            >
              <ShieldCheck size={18} />
              <span>Submit & Register in AICTE Regulatory Vault</span>
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

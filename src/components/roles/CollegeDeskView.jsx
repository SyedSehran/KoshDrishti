import React, { useState } from 'react';
import { Building2, Upload, FileText, CheckCircle2, Clock, AlertTriangle, ShieldCheck, Plus, ArrowRight, IndianRupee } from 'lucide-react';
import { ExpiryChip, TrustStamp } from '../SignatureVisuals';
import { APH_CONFIG } from '../../config/aph';

export default function CollegeDeskView({ 
  records, 
  onAddNewFDR, 
  onOpenCaseFile,
  onOpenReleaseWorkflow 
}) {
  const [showSubmitWizard, setShowSubmitWizard] = useState(false);
  const [selectedProgram, setSelectedProgram] = useState(APH_CONFIG.table1_4[0].program);
  const [fdrNumber, setFdrNumber] = useState('FDR/SBI/991048221');
  const [issuingBank, setIssuingBank] = useState('State Bank of India');
  const [ifsc, setIfsc] = useState('SBIN0006240');
  const [amount, setAmount] = useState(3500000);
  const [tenorYears, setTenorYears] = useState(10);
  const [jointHolder, setJointHolder] = useState('Member Secretary, AICTE & Chairman, Trust');
  const [isOCRProcessing, setIsOCRProcessing] = useState(false);
  const [ocrSuccess, setOcrSuccess] = useState(false);

  // College-specific instruments (Filtered for demonstration)
  const myInstruments = records.filter(r => 
    r.institutionName.toLowerCase().includes('kalinga') || 
    r.institutionName.toLowerCase().includes('vidyavardhaka') ||
    r.institutionName.toLowerCase().includes('apex')
  );

  const currentNorm = APH_CONFIG.table1_4.find(n => n.program === selectedProgram) || APH_CONFIG.table1_4[0];

  const handleProgramSelect = (prog) => {
    setSelectedProgram(prog);
    const norm = APH_CONFIG.table1_4.find(n => n.program === prog);
    if (norm) {
      setAmount(norm.minAmount);
      setTenorYears(norm.tenorYears);
    }
  };

  const handleSimulateOCR = async () => {
    setIsOCRProcessing(true);
    try {
      const sampleSlipText = `STATE BANK OF INDIA - FIXED DEPOSIT RECEIPT
FDR NO: FDR/SBI/991048221
AMOUNT: INR 35,00,000.00
JOINT ACCOUNT TITLE: MEMBER SECRETARY, AICTE & CHAIRMAN, TRUST
TENOR: 120 MONTHS (10 YEARS)`;

      const res = await fetch('http://127.0.0.1:8000/api/v1/ocr/extract', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: sampleSlipText })
      });
      const data = await res.json();
      setIsOCRProcessing(false);
      setOcrSuccess(true);
      if (data.extracted_fdr_number) setFdrNumber(data.extracted_fdr_number);
      if (data.extracted_amount) setAmount(data.extracted_amount);
    } catch {
      setTimeout(() => {
        setIsOCRProcessing(false);
        setOcrSuccess(true);
      }, 600);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newRecord = {
      id: `FDR-2024-${Math.floor(1000 + Math.random() * 9000)}`,
      fdrNumber,
      institutionId: "1-93284711",
      institutionName: "Kalinga Institute of Advanced Technology",
      trustName: "Kalinga Vidya Bharati Educational Foundation",
      isGovernmentExempt: false,
      region: "Eastern",
      state: "Odisha",
      city: "Bhubaneswar",
      programType: selectedProgram,
      aphNormCode: currentNorm.id,
      amount: Number(amount),
      issuingBank,
      bankType: "Public Sector Scheduled Bank",
      ifsc,
      accountNumber: "40192837461",
      issueDate: new Date().toISOString().slice(0, 10),
      maturityDate: new Date(Date.now() + tenorYears * 365.25 * 86400000).toISOString().slice(0, 10),
      tenorYears: Number(tenorYears),
      daysRemaining: tenorYears * 365,
      jointHolderName: jointHolder,
      lienMarked: true,
      bankConfirmed: true,
      trustLevel: "bank",
      ocrMatchPct: 99.1,
      status: "Active",
      legacyStatus: "Lien confirmed",
      hasDiscrepancies: false,
      discrepancies: [],
      purpose: `APH Table 1.4 Deposit for ${selectedProgram}`,
      releaseDetails: null
    };

    if (onAddNewFDR) onAddNewFDR(newRecord);
    setShowSubmitWizard(false);
    setOcrSuccess(false);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* College Header Card */}
      <div className="paper-card" style={{ padding: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{
              width: 44,
              height: 44,
              borderRadius: 8,
              background: '#fef3c7',
              border: '1px solid #fde68a',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#d97706',
              fontSize: 22
            }}>
              🎓
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <h2 className="serif-heading" style={{ fontSize: 18, color: 'var(--ink-primary)' }}>
                  Institution Nodal Desk • Kalinga Institute of Advanced Technology
                </h2>
                <span className="badge-clean badge-active" style={{ fontSize: 10 }}>
                  Permanent ID: 1-93284711
                </span>
              </div>
              <div style={{ fontSize: 12, color: 'var(--ink-secondary)', marginTop: 2 }}>
                Kalinga Vidya Bharati Educational Foundation • Bhubaneswar, Odisha • Eastern Regional Bureau
              </div>
            </div>
          </div>

          <button
            onClick={() => setShowSubmitWizard(!showSubmitWizard)}
            className="btn btn-ink-primary"
          >
            <Plus size={14} />
            <span>{showSubmitWizard ? 'Close Submission Form' : 'Submit New Deposit / FDR'}</span>
          </button>
        </div>
      </div>

      {/* Submission Wizard Form (Collapsible) */}
      {showSubmitWizard && (
        <form onSubmit={handleSubmit} className="paper-card" style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 18 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border-subtle)', paddingBottom: 12 }}>
            <div>
              <h3 className="serif-heading" style={{ fontSize: 15, color: 'var(--ink-primary)' }}>
                Digital Deposit Submission Wizard (APH 2024-27 Table 1.4)
              </h3>
              <div style={{ fontSize: 11.5, color: 'var(--ink-muted)' }}>
                Upload bank receipt with Member Secretary, AICTE joint lien endorsement
              </div>
            </div>
            <button
              type="button"
              onClick={handleSimulateOCR}
              disabled={isOCRProcessing}
              className="btn btn-paper btn-sm"
              style={{ border: '1px solid var(--color-amber-500)', color: '#d97706', fontWeight: 600 }}
            >
              <Upload size={13} />
              <span>{isOCRProcessing ? 'Reading slip via Python OCR...' : 'Simulate Upload & OCR Extraction'}</span>
            </button>
          </div>

          {ocrSuccess && (
            <div style={{
              padding: '10px 14px',
              borderRadius: 'var(--radius-sm)',
              background: 'var(--ramp-jade-bg)',
              border: '1px solid var(--ramp-jade-border)',
              color: 'var(--ramp-jade-text)',
              fontSize: 12,
              display: 'flex',
              alignItems: 'center',
              gap: 8
            }}>
              <CheckCircle2 size={15} />
              <span>
                <strong>OCR Verified:</strong> 99.1% match against Bank receipt. Form auto-populated below.
              </span>
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 14 }}>
            <div>
              <label style={{ fontSize: 11.5, fontWeight: 600, color: 'var(--ink-secondary)', display: 'block', marginBottom: 4 }}>
                Approved Technical Program:
              </label>
              <select
                className="input-paper"
                value={selectedProgram}
                onChange={(e) => handleProgramSelect(e.target.value)}
              >
                {APH_CONFIG.table1_4.map(n => (
                  <option key={n.id} value={n.program}>{n.program}</option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ fontSize: 11.5, fontWeight: 600, color: 'var(--ink-secondary)', display: 'block', marginBottom: 4 }}>
                FDR Reference Number:
              </label>
              <input
                type="text"
                className="input-paper mono"
                value={fdrNumber}
                onChange={(e) => setFdrNumber(e.target.value)}
                required
              />
            </div>

            <div>
              <label style={{ fontSize: 11.5, fontWeight: 600, color: 'var(--ink-secondary)', display: 'block', marginBottom: 4 }}>
                Deposit Amount (₹):
              </label>
              <input
                type="number"
                className="input-paper mono"
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
                required
              />
            </div>

            <div>
              <label style={{ fontSize: 11.5, fontWeight: 600, color: 'var(--ink-secondary)', display: 'block', marginBottom: 4 }}>
                Tenure (Years):
              </label>
              <input
                type="number"
                className="input-paper mono"
                value={tenorYears}
                onChange={(e) => setTenorYears(Number(e.target.value))}
                required
              />
            </div>

            <div style={{ gridColumn: 'span 2' }}>
              <label style={{ fontSize: 11.5, fontWeight: 600, color: 'var(--ink-secondary)', display: 'block', marginBottom: 4 }}>
                Joint Account Title (Mandatory AICTE Clause):
              </label>
              <input
                type="text"
                className="input-paper"
                value={jointHolder}
                onChange={(e) => setJointHolder(e.target.value)}
                required
              />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, paddingTop: 10, borderTop: '1px solid var(--border-subtle)' }}>
            <button
              type="button"
              onClick={() => setShowSubmitWizard(false)}
              className="btn btn-secondary btn-sm"
            >
              Cancel
            </button>

            <button
              type="submit"
              className="btn btn-ink-primary btn-sm"
            >
              <CheckCircle2 size={13} />
              <span>Submit to AICTE Regulation Bureau</span>
            </button>
          </div>
        </form>
      )}

      {/* College Instruments Table */}
      <div className="paper-card" style={{ padding: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <h3 className="serif-heading" style={{ fontSize: 16, color: 'var(--ink-primary)' }}>
            My College Security Deposits & FDR Instruments
          </h3>
          <span style={{ fontSize: 12, color: 'var(--ink-muted)' }}>
            {myInstruments.length} instruments registered
          </span>
        </div>

        <div style={{ overflowX: 'auto', border: '1px solid var(--border-medium)', borderRadius: 'var(--radius-sm)' }}>
          <table className="paper-table">
            <thead>
              <tr>
                <th>Instrument Number</th>
                <th>Program & Purpose</th>
                <th>Deposit Amount</th>
                <th>Validity Horizon</th>
                <th>Trust Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {myInstruments.map(inst => (
                <tr key={inst.id} onClick={() => onOpenCaseFile(inst)} style={{ cursor: 'pointer' }}>
                  <td>
                    <div className="mono" style={{ fontWeight: 700, color: 'var(--ink-primary)' }}>
                      {inst.fdrNumber}
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--ink-muted)' }}>
                      {inst.issuingBank}
                    </div>
                  </td>

                  <td>
                    <div style={{ fontWeight: 600 }}>{inst.programType}</div>
                    <div style={{ fontSize: 11, color: 'var(--ink-muted)' }}>{inst.purpose}</div>
                  </td>

                  <td>
                    <span className="mono" style={{ fontWeight: 700, fontSize: 13 }}>
                      ₹ {(inst.amount / 100000).toFixed(1)} Lakhs
                    </span>
                  </td>

                  <td>
                    <ExpiryChip days={inst.daysRemaining} />
                    <div className="mono" style={{ fontSize: 10, color: 'var(--ink-muted)', marginTop: 2 }}>
                      Matures: {inst.maturityDate}
                    </div>
                  </td>

                  <td>
                    <TrustStamp level={inst.trustLevel || 'bank'} size="sm" />
                    <div style={{ fontSize: 10, color: 'var(--ink-muted)', marginTop: 2 }}>
                      {inst.legacyStatus}
                    </div>
                  </td>

                  <td style={{ textAlign: 'right' }} onClick={(e) => e.stopPropagation()}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 6 }}>
                      {inst.daysRemaining <= 0 && inst.status !== 'Released' && (
                        <button
                          onClick={() => onOpenReleaseWorkflow(inst)}
                          className="btn btn-sm"
                          style={{ background: '#eff6ff', border: '1px solid #93c5fd', color: '#1d4ed8', fontWeight: 700 }}
                        >
                          <span>Apply Release</span>
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onOpenCaseFile(inst);
                        }}
                        className="btn btn-paper btn-sm"
                        style={{ border: '1.5px solid var(--ink-primary)', fontWeight: 700 }}
                      >
                        <span>Case file</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

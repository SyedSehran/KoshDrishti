import React, { useState } from 'react';
import { X, CheckCircle, ShieldCheck, Download, QrCode, FileText, ArrowRight, UserCheck } from 'lucide-react';
import { TrustStamp } from './SignatureVisuals';

export default function ReleaseWorkflowModal({ 
  fdrRecord, 
  onClose, 
  onApproveRelease 
}) {
  const [currentStep, setCurrentStep] = useState(fdrRecord?.releaseDetails?.workflowStep || 2);
  const [checklist, setChecklist] = useState({
    lockInFulfilled: true,
    noCourtStay: true,
    noStudentGrievance: true,
    roClearanceSigned: true,
    bankNoLienDemandReady: true
  });
  const [approverNotes, setApproverNotes] = useState(
    'All statutory criteria under Table 1.4 of the AICTE Approval Process Handbook have been satisfied. No student fee grievances or legal encumbrances pending.'
  );
  const [isSigned, setIsSigned] = useState(fdrRecord?.status === 'Released');

  if (!fdrRecord) return null;

  const allChecked = Object.values(checklist).every(Boolean);

  const handleGrantFinalApproval = () => {
    setIsSigned(true);
    setCurrentStep(3);
    if (onApproveRelease) {
      onApproveRelease(fdrRecord.id, approverNotes);
    }
  };

  return (
    <div className="drawer-backdrop" onClick={onClose} style={{ alignItems: 'center', justifyContent: 'center' }}>
      <div 
        className="paper-card" 
        style={{ width: '100%', maxWidth: 880, maxHeight: '90vh', overflowY: 'auto', padding: 0 }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{
          padding: '18px 24px',
          borderBottom: '1px solid var(--border-medium)',
          background: 'var(--bg-muted)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <h3 className="serif-heading" style={{ fontSize: 16, color: 'var(--ink-primary)' }}>
                Two-Officer Approval • FDR Release & Discharge Order
              </h3>
              <span className="badge-clean badge-release" style={{ fontSize: 10 }}>
                Stage {currentStep} of 3
              </span>
            </div>
            <div style={{ fontSize: 11, color: 'var(--ink-muted)' }}>
              FDR Ref: <span className="mono">{fdrRecord.fdrNumber}</span> • {fdrRecord.institutionName}
            </div>
          </div>

          <button onClick={onClose} className="btn btn-secondary btn-sm" style={{ padding: 6, borderRadius: '50%' }}>
            <X size={16} />
          </button>
        </div>

        {/* Stepper Strip */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: 12,
          padding: '12px 24px',
          background: 'var(--bg-subtle)',
          borderBottom: '1px solid var(--border-subtle)',
          fontSize: 11
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--ramp-jade-text)', fontWeight: 600 }}>
            <span>✓</span>
            <span>1. Institute Request (10-Yr Term)</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: currentStep >= 2 ? 'var(--ink-primary)' : 'var(--ink-muted)', fontWeight: 600 }}>
            <span>{currentStep > 2 ? '✓' : '2.'}</span>
            <span>2. Scrutiny Officer Audit</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: currentStep === 3 ? 'var(--ramp-jade-text)' : 'var(--ink-muted)', fontWeight: 600 }}>
            <span>{currentStep === 3 ? '✓' : '3.'}</span>
            <span>3. Regional Director Discharge Order</span>
          </div>
        </div>

        {/* Body */}
        <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 20 }}>
          {currentStep < 3 ? (
            /* Checklist & Scrutiny View */
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {/* Institution Request Grounds */}
              <div style={{ background: '#ffffff', padding: 16, border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)' }}>
                <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: 'var(--ink-muted)', marginBottom: 6 }}>
                  Institution Release Petition & Grounds
                </div>
                <div style={{ fontSize: 12.5, color: 'var(--ink-primary)', lineHeight: 1.5 }}>
                  {fdrRecord.releaseDetails?.reason || "Institution completed 10-year statutory regulatory lock-in period with zero pending student complaints. Requesting unencumbered release of fixed deposit to Trust capital endowment."}
                </div>
                <div style={{ display: 'flex', gap: 16, marginTop: 10, fontSize: 11, color: 'var(--ink-secondary)' }}>
                  <span>Principal: <strong className="mono">₹ {fdrRecord.amount.toLocaleString('en-IN')}</strong></span>
                  <span>Bank: <strong>{fdrRecord.issuingBank}</strong></span>
                  <span>Maturity Date: <strong className="mono">{fdrRecord.maturityDate}</strong></span>
                </div>
              </div>

              {/* Statutory Checklist */}
              <div>
                <div style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', color: 'var(--ink-secondary)', letterSpacing: '0.04em', marginBottom: 10 }}>
                  Statutory Condition Compliance Checklist (All Mandatory)
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {[
                    { key: 'lockInFulfilled', label: '10-Year Mandatory Regulatory Lock-in Completed with Zero Pre-matures', proof: 'APH Table 1.4' },
                    { key: 'noCourtStay', label: 'Zero Injunctions, Court Stays, or Legal Restraints from Hon. High Courts', proof: 'Legal Cell Cleared' },
                    { key: 'noStudentGrievance', label: 'Zero Outstanding Student Tuition Fee, Caution Deposit, or Salary Disputes', proof: 'RO Vigilance Clean' },
                    { key: 'roClearanceSigned', label: 'AICTE Regional Office Physical Verification Cleared', proof: 'RO Report #SW-998' },
                    { key: 'bankNoLienDemandReady', label: 'Core Banking Lien Discharge Order Ready for Bank Manager Transmittal', proof: 'SFMS Direct' }
                  ].map(item => (
                    <label
                      key={item.key}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '10px 14px',
                        background: checklist[item.key] ? 'var(--bg-subtle)' : '#ffffff',
                        border: checklist[item.key] ? '1px solid var(--border-medium)' : '1px solid var(--border-subtle)',
                        borderRadius: 'var(--radius-sm)',
                        cursor: 'pointer',
                        fontSize: 12
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <input
                          type="checkbox"
                          checked={checklist[item.key]}
                          onChange={(e) => setChecklist({ ...checklist, [item.key]: e.target.checked })}
                          style={{ width: 15, height: 15, cursor: 'pointer', accentColor: 'var(--ink-primary)' }}
                        />
                        <span style={{ color: 'var(--ink-primary)', fontWeight: checklist[item.key] ? 600 : 400 }}>
                          {item.label}
                        </span>
                      </div>
                      <span className="mono" style={{ fontSize: 10.5, color: 'var(--ink-muted)' }}>
                        [{item.proof}]
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Approver Notes */}
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--ink-secondary)', display: 'block', marginBottom: 4 }}>
                  Approving Officer Sanction Note:
                </label>
                <textarea
                  className="input-paper"
                  rows={2}
                  value={approverNotes}
                  onChange={(e) => setApproverNotes(e.target.value)}
                />
              </div>
            </div>
          ) : (
            /* Step 3: Official Generated AICTE FDR Discharge & Lien Release Order */
            <div style={{
              background: '#ffffff',
              border: '2px solid var(--border-strong)',
              borderRadius: 'var(--radius-sm)',
              padding: '28px 32px'
            }}>
              {/* AICTE Official Header */}
              <div style={{ textAlign: 'center', borderBottom: '1px solid var(--border-medium)', paddingBottom: 14, marginBottom: 16 }}>
                <div style={{ fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase', fontWeight: 700, color: 'var(--ink-secondary)' }}>
                  भारत सरकार • Ministry of Education
                </div>
                <div className="serif-heading" style={{ fontSize: 18, fontWeight: 700, color: 'var(--ink-primary)', marginTop: 2 }}>
                  ALL INDIA COUNCIL FOR TECHNICAL EDUCATION
                </div>
                <div style={{ fontSize: 10.5, color: 'var(--ink-muted)', marginTop: 2 }}>
                  Nelson Mandela Marg, Vasant Kunj, New Delhi - 110070 | Regulation Bureau
                </div>
              </div>

              {/* Order Reference */}
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11.5, color: 'var(--ink-secondary)', marginBottom: 16 }}>
                <div>
                  <div><strong>Ref No:</strong> <span className="mono">{fdrRecord.dischargeCertificateRef || `AICTE/REG/FDR-REL/2026/${(fdrRecord.fdrNumber || fdrRecord.id || '089').replace(/[^a-zA-Z0-9]/g, '').slice(-4).padStart(4, '0')}`}</span></div>
                  <div><strong>Date:</strong> 24 October 2026</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div><strong>Deposit Type:</strong> Refundable Institutional Collateral</div>
                  <div><strong>Handbook Rule:</strong> APH 2024-27 Table 1.4</div>
                </div>
              </div>

              {/* Subject */}
              <div style={{
                background: 'var(--bg-muted)',
                padding: '8px 12px',
                borderRadius: 'var(--radius-xs)',
                marginBottom: 14,
                border: '1px solid var(--border-subtle)',
                fontSize: 12,
                fontWeight: 700,
                color: 'var(--ink-primary)'
              }}>
                SUBJECT: FORMAL DISCHARGE AND UNCONDITIONAL RELEASE OF LIEN ON FDR NO: {fdrRecord.fdrNumber}
              </div>

              {/* Body */}
              <div style={{ fontSize: 12, color: 'var(--ink-secondary)', lineHeight: 1.6, display: 'flex', flexDirection: 'column', gap: 10 }}>
                <p>
                  To The Branch Manager, <strong>{fdrRecord.issuingBank}</strong> ({fdrRecord.branchName}).
                </p>
                <p>
                  With reference to Fixed Deposit Receipt No. <strong>{fdrRecord.fdrNumber}</strong> for the sum of <strong>₹ {fdrRecord.amount ? fdrRecord.amount.toLocaleString('en-IN') : '50,00,000'}</strong> pledged jointly in the name of <em>Member Secretary, AICTE</em> and <em>{fdrRecord.institutionName || 'Applicant Educational Trust'}</em>, it is hereby certified that the institution has completed the requisite 10-year statutory regulatory lock-in period in strict compliance with the AICTE Approval Process Handbook.
                </p>
                <p>
                  The Competent Authority of AICTE has approved the <strong>Unconditional Discharge and Cancellation of Lien</strong> in favor of AICTE. The issuing Bank is hereby authorized to release the maturity proceeds and accumulated interest to the authorized account of the Educational Trust without further reference to this Council.
                </p>
              </div>

              {/* Signatures & Seal */}
              <div style={{
                display: 'flex',
                alignItems: 'flex-end',
                justifyContent: 'space-between',
                marginTop: 24,
                paddingTop: 14,
                borderTop: '1px solid var(--border-subtle)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ background: '#ffffff', border: '1px solid var(--border-medium)', padding: 4, borderRadius: 4 }}>
                    <QrCode size={48} />
                  </div>
                  <div style={{ fontSize: 10, color: 'var(--ink-muted)' }}>
                    <div>Audit Log Ref: #{fdrRecord.auditBlockIndex || 4}</div>
                    <div className="mono">SHA-256: 7f83b165...9069</div>
                    <div style={{ color: 'var(--ramp-jade-text)', fontWeight: 600 }}>✓ Verified Discharge Order</div>
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--ink-primary)' }}>
                    Prof. Rajive Kumar
                  </div>
                  <div style={{ fontSize: 10.5, color: 'var(--ink-muted)' }}>
                    Regional Director, AICTE
                  </div>
                  <div style={{ fontSize: 10, color: 'var(--stamp-bank-color)', marginTop: 2 }}>
                    ✓ e-Sign Digital Signature Verified
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{
          padding: '14px 24px',
          borderTop: '1px solid var(--border-medium)',
          background: 'var(--bg-muted)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-end',
          gap: 10
        }}>
          <button onClick={onClose} className="btn btn-secondary btn-sm">
            Close
          </button>

          {currentStep < 3 ? (
            <button
              onClick={handleGrantFinalApproval}
              disabled={!allChecked}
              className="btn btn-ink-primary btn-sm"
              style={{ opacity: allChecked ? 1 : 0.5 }}
            >
              <UserCheck size={13} />
              <span>Sanction two-officer approval & release lien</span>
            </button>
          ) : (
            <button
              onClick={() => {
                const refNo = fdrRecord.dischargeCertificateRef || `AICTE/REG/FDR-REL/2026/${(fdrRecord.fdrNumber || fdrRecord.id || '089').replace(/[^a-zA-Z0-9]/g, '').slice(-4).padStart(4, '0')}`;
                alert(`Official AICTE FDR Discharge Certificate #${refNo} exported.`);
              }}
              className="btn btn-ink-primary btn-sm"
            >
              <Download size={13} />
              <span>Download Signed Official Discharge PDF</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

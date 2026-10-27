import React, { useState } from 'react';
import { X, Building2, Landmark, Calendar, ShieldCheck, FileText, ArrowRight, ShieldAlert, CheckCircle2, Download, Printer, RefreshCw } from 'lucide-react';
import { ExpiryChip, TrustStamp } from './SignatureVisuals';
import DocumentManager from './DocumentManager';
import RenewalModal from './RenewalModal';

export default function Instrument360Drawer({ 
  instrument, 
  onClose, 
  onOpenCompareSources, 
  onOpenTwoOfficerApproval, 
  onOpenAuditLog,
  authToken
}) {
  // All hooks MUST be called before any early return (Rules of Hooks)
  const [activeTab, setActiveTab] = useState('overview');
  const [showRenewalModal, setShowRenewalModal] = useState(false);

  if (!instrument) return null;

  const caseId = `CF-2026-${instrument.id || '8821'}`;

  const handlePrintDossier = () => {
    window.print();
  };

  return (
    <div 
      className="drawer-backdrop" 
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.6)',
        backdropFilter: 'blur(4px)',
        zIndex: 99999,
        display: 'flex',
        justifyContent: 'flex-end',
        alignItems: 'stretch'
      }}
    >
      <div 
        className="drawer-panel" 
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: 680,
          height: '100vh',
          backgroundColor: '#ffffff',
          boxShadow: '-8px 0 35px rgba(0, 0, 0, 0.25)',
          display: 'flex',
          flexDirection: 'column',
          zIndex: 100000,
          borderLeft: '2px solid var(--border-medium)',
          overflow: 'hidden'
        }}
      >
        {/* 1. Official Regulatory Case File Header */}
        <div style={{
          padding: '18px 24px',
          borderBottom: '1.5px solid var(--border-medium)',
          background: 'linear-gradient(180deg, #fbf9f5 0%, #f4efe6 100%)',
          display: 'flex',
          flexDirection: 'column',
          gap: 8
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 18 }}>📁</span>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span className="serif-heading" style={{ fontSize: 16, fontWeight: 700, color: 'var(--ink-primary)' }}>
                    Statutory Case File
                  </span>
                  <span className="mono" style={{
                    fontSize: 11,
                    background: '#1e293b',
                    color: '#f8fafc',
                    padding: '2px 7px',
                    borderRadius: 3,
                    fontWeight: 700
                  }}>
                    {caseId}
                  </span>
                </div>
                <div style={{ fontSize: 11, color: 'var(--ink-secondary)', marginTop: 2 }}>
                  AICTE Regulation Bureau • 360° FDR & Security Deposit Dossier
                </div>
              </div>
            </div>

            <button
              onClick={onClose}
              className="btn btn-secondary btn-sm"
              style={{
                width: 32,
                height: 32,
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: 0,
                border: '1px solid var(--border-medium)',
                cursor: 'pointer'
              }}
              title="Close Case File"
            >
              <X size={16} />
            </button>
          </div>

          {/* Instrument Title & Trust Stamp Bar */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: '#ffffff',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-sm)',
            padding: '10px 14px',
            marginTop: 4
          }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span className="mono" style={{ fontSize: 15, fontWeight: 700, color: 'var(--ink-primary)' }}>
                  {instrument.fdrNumber}
                </span>
                <TrustStamp level={instrument.trustLevel || 'officer'} size="sm" />
              </div>
              <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--ink-secondary)', marginTop: 3 }}>
                {instrument.institutionName}
              </div>
            </div>

            <div style={{ textAlign: 'right' }}>
              <div className="mono" style={{ fontSize: 14, fontWeight: 700, color: 'var(--ink-primary)' }}>
                {instrument.amount > 0 ? `₹ ${(instrument.amount / 100000).toFixed(1)} Lakhs` : '₹ 0 (Govt Exempt)'}
              </div>
              <div style={{ fontSize: 10.5, color: 'var(--ink-muted)' }}>
                {instrument.issuingBank}
              </div>
            </div>
          </div>

          {/* Sub-Tabs Navigation */}
          <div style={{ display: 'flex', gap: 6, marginTop: 4, flexWrap: 'wrap' }}>
            {[
              { id: 'overview', label: '1. Case Summary' },
              { id: 'aph', label: '2. APH Table 1.4 Norms' },
              { id: 'cbs', label: '3. CBS & Bank Cross-Check' },
              { id: 'timeline', label: '4. 360° Audit Trail' },
              { id: 'documents', label: '5. Documents' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  background: activeTab === tab.id ? 'var(--ink-primary)' : 'transparent',
                  color: activeTab === tab.id ? '#ffffff' : 'var(--ink-secondary)',
                  border: activeTab === tab.id ? 'none' : '1px solid var(--border-subtle)',
                  padding: '5px 10px',
                  borderRadius: 'var(--radius-xs)',
                  fontSize: 11,
                  fontWeight: activeTab === tab.id ? 700 : 500,
                  cursor: 'pointer'
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* 2. Scrollable Body Content */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 18 }}>
          {/* Quick Metrics Strip */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: 10,
            padding: '12px 14px',
            background: 'var(--bg-subtle)',
            borderRadius: 'var(--radius-sm)',
            border: '1px solid var(--border-subtle)'
          }}>
            <div>
              <div style={{ fontSize: 11, color: 'var(--ink-muted)' }}>Validity Horizon</div>
              <div style={{ marginTop: 4 }}>
                <ExpiryChip days={instrument.daysRemaining} />
              </div>
              <div className="mono" style={{ fontSize: 10, color: 'var(--ink-muted)', marginTop: 4 }}>
                Matures: {instrument.maturityDate}
              </div>
            </div>

            <div>
              <div style={{ fontSize: 11, color: 'var(--ink-muted)' }}>OCR Match Confidence</div>
              <div className="mono" style={{ fontSize: 15, fontWeight: 700, color: 'var(--ink-primary)', marginTop: 2 }}>
                {instrument.ocrMatchPct || 98.4}%
              </div>
              <div style={{ fontSize: 10, color: 'var(--ink-muted)', marginTop: 2 }}>
                PaddleOCR / Vision AI
              </div>
            </div>

            <div>
              <div style={{ fontSize: 11, color: 'var(--ink-muted)' }}>Lien Endorsement</div>
              <div style={{ marginTop: 2 }}>
                {instrument.lienMarked ? (
                  <span className="badge-clean badge-active" style={{ fontSize: 10 }}>
                    ✓ Lien Active
                  </span>
                ) : (
                  <span className="badge-clean badge-flagged" style={{ fontSize: 10 }}>
                    ⚠️ No Lien
                  </span>
                )}
              </div>
              <div style={{ fontSize: 10, color: 'var(--ink-muted)', marginTop: 2 }}>
                Joint with AICTE
              </div>
            </div>
          </div>

          {/* Discrepancy Alert Action Callout */}
          {instrument.hasDiscrepancies && (
            <div style={{
              background: '#fef2f2',
              border: '1.5px solid #fca5a5',
              borderRadius: 'var(--radius-sm)',
              padding: '12px 16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 12
            }}>
              <div>
                <div style={{ fontSize: 12.5, fontWeight: 700, color: '#b91c1c' }}>
                  ⚠️ Discrepancy Triangulation Flagged
                </div>
                <div style={{ fontSize: 11, color: '#7f1d1d', marginTop: 2 }}>
                  Direct Core Banking cross-reference differs from institution declaration on joint title or tenure.
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenCompareSources(instrument);
                }}
                className="btn btn-sm"
                style={{
                  background: '#b91c1c',
                  color: '#ffffff',
                  fontWeight: 700,
                  flexShrink: 0
                }}
              >
                <span>Compare Sources</span>
                <ArrowRight size={12} />
              </button>
            </div>
          )}

          {/* Release & NOC Requested Action Callout */}
          {instrument.status === 'Release' && (
            <div style={{
              background: '#eff6ff',
              border: '1.5px solid #bfdbfe',
              borderRadius: 'var(--radius-sm)',
              padding: '12px 16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 12
            }}>
              <div>
                <div style={{ fontSize: 12.5, fontWeight: 700, color: '#1d4ed8' }}>
                  🏛️ 10-Year Maturity Fulfillment • Release Pending
                </div>
                <div style={{ fontSize: 11, color: '#1e40af', marginTop: 2 }}>
                  Maturity lock-in achieved. Ready for Two-Officer condition sign-off and AICTE NOC order generation.
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenTwoOfficerApproval(instrument);
                }}
                className="btn btn-sm"
                style={{
                  background: '#1d4ed8',
                  color: '#ffffff',
                  fontWeight: 700,
                  flexShrink: 0
                }}
              >
                <span>Two-Officer Approval</span>
                <ArrowRight size={12} />
              </button>
            </div>
          )}

          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <h4 style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', color: 'var(--ink-secondary)', letterSpacing: '0.04em', marginBottom: 10 }}>
                  Institution & Statutory Identification
                </h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, fontSize: 12 }}>
                  <div className="paper-card" style={{ padding: 10 }}>
                    <span style={{ color: 'var(--ink-muted)', fontSize: 11 }}>AICTE Permanent ID:</span>
                    <div className="mono" style={{ fontWeight: 600, color: 'var(--ink-primary)', marginTop: 2 }}>
                      {instrument.institutionId}
                    </div>
                  </div>

                  <div className="paper-card" style={{ padding: 10 }}>
                    <span style={{ color: 'var(--ink-muted)', fontSize: 11 }}>Approved Program:</span>
                    <div style={{ fontWeight: 600, color: 'var(--ink-primary)', marginTop: 2 }}>
                      {instrument.programType}
                    </div>
                  </div>

                  <div className="paper-card" style={{ padding: 10 }}>
                    <span style={{ color: 'var(--ink-muted)', fontSize: 11 }}>Trust / Society Name:</span>
                    <div style={{ fontWeight: 600, color: 'var(--ink-primary)', marginTop: 2 }}>
                      {instrument.trustName || 'Technical Education Trust'}
                    </div>
                  </div>

                  <div className="paper-card" style={{ padding: 10 }}>
                    <span style={{ color: 'var(--ink-muted)', fontSize: 11 }}>Jurisdiction & Region:</span>
                    <div style={{ fontWeight: 600, color: 'var(--ink-primary)', marginTop: 2 }}>
                      {instrument.city}, {instrument.state} ({instrument.region})
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h4 style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', color: 'var(--ink-secondary)', letterSpacing: '0.04em', marginBottom: 10 }}>
                  Bank & Escrow Instrument Particulars
                </h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, fontSize: 12 }}>
                  <div className="paper-card" style={{ padding: 10 }}>
                    <span style={{ color: 'var(--ink-muted)', fontSize: 11 }}>Issuing Bank & Type:</span>
                    <div style={{ fontWeight: 600, color: 'var(--ink-primary)', marginTop: 2 }}>
                      {instrument.issuingBank}
                    </div>
                    <div style={{ fontSize: 10.5, color: 'var(--ink-muted)' }}>{instrument.bankType}</div>
                  </div>

                  <div className="paper-card" style={{ padding: 10 }}>
                    <span style={{ color: 'var(--ink-muted)', fontSize: 11 }}>IFSC & Branch Code:</span>
                    <div className="mono" style={{ fontWeight: 600, color: 'var(--ink-primary)', marginTop: 2 }}>
                      {instrument.ifsc}
                    </div>
                    <div className="mono" style={{ fontSize: 10.5, color: 'var(--ink-muted)' }}>A/C: {instrument.accountNumber}</div>
                  </div>

                  <div className="paper-card" style={{ padding: 10, gridColumn: 'span 2' }}>
                    <span style={{ color: 'var(--ink-muted)', fontSize: 11 }}>Statutory Joint Pledgee Title (Lien Endorsement):</span>
                    <div style={{ fontWeight: 600, color: 'var(--ink-primary)', background: 'var(--bg-subtle)', padding: '6px 10px', borderRadius: 4, marginTop: 4 }}>
                      {instrument.jointHolderName}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: APH TABLE 1.4 NORMS */}
          {activeTab === 'aph' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{
                background: 'linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%)',
                border: '1px solid #fde68a',
                borderRadius: 'var(--radius-sm)',
                padding: '14px',
                fontSize: 12
              }}>
                <div style={{ fontWeight: 700, color: '#92400e', marginBottom: 4 }}>
                  AICTE Approval Process Handbook (APH 2024-27) • Chapter I, Table 1.4
                </div>
                <div style={{ color: '#78350f', lineHeight: 1.5 }}>
                  Technical institutions under five (5) years of age must maintain an unconditional security deposit in the joint name of the <strong>Member Secretary, AICTE</strong> and the applicant Trust. Government and University Constituent institutions are exempt upon submission of a valid statutory affidavit.
                </div>
              </div>

              <div className="paper-card" style={{ padding: 16 }}>
                <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 10 }}>Normative Rule Evaluation</div>
                <table className="paper-table" style={{ fontSize: 11.5 }}>
                  <tbody>
                    <tr>
                      <td style={{ color: 'var(--ink-muted)' }}>Applicable APH Category</td>
                      <td style={{ fontWeight: 600 }}>{instrument.programType}</td>
                    </tr>
                    <tr>
                      <td style={{ color: 'var(--ink-muted)' }}>Prescribed Deposit Norm</td>
                      <td className="mono" style={{ fontWeight: 700 }}>
                        {instrument.isGovernmentExempt ? '₹ 0 (Government Exemption under Table 1.4)' : `₹ ${(instrument.amount / 100000).toFixed(1)} Lakhs`}
                      </td>
                    </tr>
                    <tr>
                      <td style={{ color: 'var(--ink-muted)' }}>Mandatory Lock-in Tenure</td>
                      <td style={{ fontWeight: 600 }}>10 Years (Non-callable lien to AICTE)</td>
                    </tr>
                    <tr>
                      <td style={{ color: 'var(--ink-muted)' }}>Deposit Compliance Status</td>
                      <td>
                        <span className="badge-clean badge-active">
                          ✓ Fully Compliant with Table 1.4
                        </span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 3: CBS & BANK CHECK */}
          {activeTab === 'cbs' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div className="paper-card" style={{ padding: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                  <div style={{ fontWeight: 700, fontSize: 13 }}>Core Banking System (CBS) Direct Verification</div>
                  <span className="mono" style={{ fontSize: 10.5, color: 'var(--stamp-bank-color)', fontWeight: 600 }}>
                    Bank verification (simulated)
                  </span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, fontSize: 12 }}>
                  <div style={{ padding: 10, background: 'var(--bg-subtle)', borderRadius: 4 }}>
                    <div style={{ color: 'var(--ink-muted)', fontSize: 11 }}>Core Banking Account Title:</div>
                    <div style={{ fontWeight: 600, marginTop: 2 }}>{instrument.jointHolderName}</div>
                  </div>

                  <div style={{ padding: 10, background: 'var(--bg-subtle)', borderRadius: 4 }}>
                    <div style={{ color: 'var(--ink-muted)', fontSize: 11 }}>Lien Endorsement Flag:</div>
                    <div style={{ fontWeight: 600, color: instrument.lienMarked ? '#047857' : '#b91c1c', marginTop: 2 }}>
                      {instrument.lienMarked ? '✓ LIEN_ENDORSED_AICTE' : '⚠️ NO_LIEN_RECORDED'}
                    </div>
                  </div>

                  <div style={{ padding: 10, background: 'var(--bg-subtle)', borderRadius: 4 }}>
                    <div style={{ color: 'var(--ink-muted)', fontSize: 11 }}>SFMS ISO20022 Status:</div>
                    <div className="mono" style={{ fontWeight: 600, marginTop: 2 }}>SIMULATED_ACK_701_ACCEPTED</div>
                  </div>

                  <div style={{ padding: 10, background: 'var(--bg-subtle)', borderRadius: 4 }}>
                    <div style={{ color: 'var(--ink-muted)', fontSize: 11 }}>Premature Withdrawal Lock:</div>
                    <div style={{ fontWeight: 600, color: '#047857', marginTop: 2 }}>ENFORCED (No release without NOC)</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: 360° LIFECYCLE AUDIT TRAIL */}
          {activeTab === 'timeline' && (
            <div>
              <h4 style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', color: 'var(--ink-secondary)', letterSpacing: '0.04em', marginBottom: 12 }}>
                Cryptographic Lifecycle Milestones
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14, paddingLeft: 8, borderLeft: '2px solid var(--border-medium)', marginLeft: 6 }}>
                <div style={{ position: 'relative', paddingLeft: 14 }}>
                  <span style={{ position: 'absolute', left: -19, top: 4, width: 8, height: 8, borderRadius: '50%', background: 'var(--ink-primary)' }} />
                  <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--ink-primary)' }}>
                    Instrument Inception & Joint Pledge
                  </div>
                  <div className="mono" style={{ fontSize: 11, color: 'var(--ink-muted)' }}>
                    {instrument.issueDate} • Pledged to Member Secretary, AICTE
                  </div>
                </div>

                <div style={{ position: 'relative', paddingLeft: 14 }}>
                  <span style={{ position: 'absolute', left: -19, top: 4, width: 8, height: 8, borderRadius: '50%', background: instrument.bankConfirmed ? 'var(--ramp-jade-dot)' : 'var(--ramp-vermilion-dot)' }} />
                  <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--ink-primary)' }}>
                    {instrument.bankConfirmed ? 'Bank verification confirmed (simulated)' : 'Bank check pending / discrepancy flagged'}
                  </div>
                  <div className="mono" style={{ fontSize: 11, color: 'var(--ink-muted)' }}>
                    Direct Core Banking cross-reference
                  </div>
                </div>

                <div style={{ position: 'relative', paddingLeft: 14 }}>
                  <span style={{ position: 'absolute', left: -19, top: 4, width: 8, height: 8, borderRadius: '50%', background: 'var(--ink-dim)' }} />
                  <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--ink-primary)' }}>
                    Mandatory Lock-in Horizon ({instrument.tenorYears} Years)
                  </div>
                  <div className="mono" style={{ fontSize: 11, color: 'var(--ink-muted)' }}>
                    Maturity: {instrument.maturityDate} ({instrument.daysRemaining > 0 ? `${instrument.daysRemaining} days remaining` : 'Matured'})
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: REGULATORY DOCUMENTS & VERIFICATION SCANS */}
          {activeTab === 'documents' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <h4 style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', color: 'var(--ink-secondary)', letterSpacing: '0.04em', marginBottom: 6 }}>
                  Statutory Documents & Verification Scans
                </h4>
                <p style={{ fontSize: 11.5, color: 'var(--ink-muted)', margin: 0 }}>
                  Upload, store, and verify original Fixed Deposit Receipts, Bank Confirmation Letters, Joint Lien Endorsements, and Board Resolutions for regulatory scrutiny.
                </p>
              </div>

              <DocumentManager
                instrumentId={instrument.fdrNumber || String(instrument.id)}
                authToken={authToken}
                readOnly={false}
              />
            </div>
          )}
        </div>

        {/* 3. Official Regulatory Case File Footer */}
        <div style={{
          padding: '14px 24px',
          borderTop: '1.5px solid var(--border-medium)',
          background: 'var(--bg-muted)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 10
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <button
              type="button"
              onClick={handlePrintDossier}
              className="btn btn-paper btn-sm"
              title="Print regulatory case file dossier"
            >
              <Printer size={13} />
              <span>Print Dossier</span>
            </button>

            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenAuditLog();
              }}
              className="btn btn-secondary btn-sm"
            >
              <span>Inspect Audit Ledger</span>
            </button>
          </div>

          {/* Renewal & Documents action buttons */}
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <button
              type="button"
              onClick={() => setShowRenewalModal(true)}
              className="btn btn-sm"
              style={{ background: '#FF6B35', color: '#fff', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6 }}
            >
              <RefreshCw size={13} /> Submit Renewal / Replacement FDR
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('documents')}
              className="btn btn-secondary btn-sm"
              style={{ display: 'flex', alignItems: 'center', gap: 6 }}
            >
              <FileText size={13} /> Manage Documents
            </button>
          </div>

          <button 
            type="button" 
            onClick={onClose} 
            className="btn btn-ink-primary btn-sm"
            style={{ fontWeight: 700 }}
          >
            Close Case File
          </button>
        </div>
      </div>

      {/* Renewal Modal */}
      {showRenewalModal && (
        <RenewalModal
          fdrRecord={instrument}
          authToken={authToken}
          onClose={() => setShowRenewalModal(false)}
          onSuccess={() => {
            setTimeout(() => setShowRenewalModal(false), 2000);
          }}
        />
      )}
    </div>
  );
}

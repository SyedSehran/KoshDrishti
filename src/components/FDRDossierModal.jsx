import React, { useState } from 'react';
import { 
  X, 
  Building2, 
  Landmark, 
  Calendar, 
  FileText, 
  CheckCircle2, 
  ShieldCheck, 
  Download, 
  GitBranch, 
  Scan, 
  FileCode,
  ShieldAlert,
  ArrowRight
} from 'lucide-react';

export default function FDRDossierModal({ 
  fdrRecord, 
  onClose, 
  onInspectDiscrepancy, 
  onOpenReleaseWorkflow,
  onOpenLineage 
}) {
  const [activeTab, setActiveTab] = useState('overview');

  if (!fdrRecord) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div 
        className="modal-container" 
        style={{ maxWidth: 940 }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{
              width: 36,
              height: 36,
              borderRadius: 'var(--radius-md)',
              background: 'rgba(245, 158, 11, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--gold-400)'
            }}>
              <FileText size={20} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <h3 className="mono" style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)' }}>
                  {fdrRecord.fdrNumber}
                </h3>
                <span className="badge badge-gold" style={{ fontSize: 10 }}>
                  ₹ {(fdrRecord.amount / 100000).toFixed(1)} Lakhs
                </span>
              </div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                {fdrRecord.institutionName} • {fdrRecord.issuingBank}
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="btn btn-secondary btn-sm"
            style={{ padding: 6, borderRadius: '50%' }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Tab Strip */}
        <div style={{ padding: '8px 24px 0', borderBottom: '1px solid var(--border-subtle)', background: 'rgba(255, 255, 255, 0.01)' }}>
          <div style={{ display: 'flex', gap: 12 }}>
            {[
              { id: 'overview', label: 'Instrument Overview' },
              { id: 'ocr_doc', label: 'OCR Scrutiny & Scanned Slip' },
              { id: 'lineage', label: 'Event Lineage & Audit' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  padding: '10px 14px',
                  background: 'transparent',
                  border: 'none',
                  borderBottom: activeTab === tab.id ? '2px solid var(--gold-400)' : '2px solid transparent',
                  color: activeTab === tab.id ? 'var(--gold-400)' : 'var(--text-muted)',
                  fontSize: 13,
                  fontWeight: activeTab === tab.id ? 600 : 500,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Body */}
        <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {activeTab === 'overview' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
              {/* Institution Details */}
              <div className="glass-panel" style={{ padding: 18 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                  <Building2 size={16} color="var(--gold-400)" />
                  <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', textTransform: 'uppercase' }}>
                    Institution & Trust Profile
                  </span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 14, fontSize: 12 }}>
                  <div>
                    <span style={{ color: 'var(--text-dim)' }}>Institution Name:</span>
                    <div style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{fdrRecord.institutionName}</div>
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-dim)' }}>AICTE Permanent ID:</span>
                    <div className="mono" style={{ color: 'var(--gold-400)', fontWeight: 600 }}>{fdrRecord.institutionId}</div>
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-dim)' }}>Sponsoring Society / Trust:</span>
                    <div style={{ color: 'var(--text-primary)' }}>{fdrRecord.trustName}</div>
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-dim)' }}>Jurisdiction / Region:</span>
                    <div style={{ color: 'var(--text-primary)' }}>{fdrRecord.region} Regional Office ({fdrRecord.city}, {fdrRecord.state})</div>
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-dim)' }}>Approved Technical Program:</span>
                    <div style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{fdrRecord.programType}</div>
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-dim)' }}>Purpose of Deposit:</span>
                    <div style={{ color: 'var(--text-secondary)' }}>{fdrRecord.purpose}</div>
                  </div>
                </div>
              </div>

              {/* Core Banking & Lien Details */}
              <div className="glass-panel" style={{ padding: 18 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                  <Landmark size={16} color="var(--cyan-400)" />
                  <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', textTransform: 'uppercase' }}>
                    Issuing Bank & Core Banking Status
                  </span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 14, fontSize: 12 }}>
                  <div>
                    <span style={{ color: 'var(--text-dim)' }}>Issuing Bank & Branch:</span>
                    <div style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{fdrRecord.issuingBank} ({fdrRecord.branchName})</div>
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-dim)' }}>IFSC & Account Number:</span>
                    <div className="mono" style={{ color: 'var(--text-primary)' }}>{fdrRecord.ifsc} • {fdrRecord.accountNumber}</div>
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-dim)' }}>Pledged Account Joint Title:</span>
                    <div style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{fdrRecord.jointHolderName}</div>
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-dim)' }}>Lien Endorsement Status:</span>
                    <div>
                      {fdrRecord.lienMarked ? (
                        <span className="badge badge-verified" style={{ fontSize: 10 }}>✓ Active Lien Endorsed to AICTE</span>
                      ) : (
                        <span className="badge badge-flagged" style={{ fontSize: 10 }}>⚠️ Lien Not Marked</span>
                      )}
                    </div>
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-dim)' }}>Tenor & Maturity:</span>
                    <div className="mono" style={{ color: 'var(--text-primary)' }}>
                      {fdrRecord.tenorYears} Years (Matures {fdrRecord.maturityDate})
                    </div>
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-dim)' }}>SFMS Bank Confirmation Ref:</span>
                    <div className="mono" style={{ color: 'var(--gold-400)' }}>{fdrRecord.bankConfirmationRef}</div>
                  </div>
                </div>
              </div>

              {/* Document Checksum Ledger */}
              <div className="glass-panel" style={{ padding: 18 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 10 }}>
                  Prescribed Supporting Records & SHA-256 Checksums
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {fdrRecord.documents?.map((doc, idx) => (
                    <div
                      key={idx}
                      style={{
                        padding: '10px 14px',
                        background: 'rgba(10, 14, 22, 0.6)',
                        borderRadius: 'var(--radius-sm)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        fontSize: 12
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <FileText size={15} color="var(--gold-400)" />
                        <div>
                          <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{doc.name}</span>
                          <span style={{ color: 'var(--text-dim)', fontSize: 10, marginLeft: 8 }}>({doc.size})</span>
                        </div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span className="mono" style={{ fontSize: 10, color: 'var(--text-dim)' }}>
                          SHA-256: {doc.sha256.substring(0, 18)}...
                        </span>
                        <span className="badge badge-verified" style={{ fontSize: 9 }}>Verified</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'ocr_doc' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {/* Simulated Scanned FDR Document with OCR Bounding Box Annotations */}
              <div style={{
                background: '#0e131d',
                border: '1px solid var(--border-gold)',
                borderRadius: 'var(--radius-md)',
                padding: '24px',
                position: 'relative'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-subtle)', paddingBottom: 12, marginBottom: 16 }}>
                  <div>
                    <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>
                      {fdrRecord.issuingBank.toUpperCase()} • FIXED DEPOSIT RECEIPT
                    </span>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                      Branch: {fdrRecord.branchName} • IFSC: {fdrRecord.ifsc}
                    </div>
                  </div>
                  <span className="badge badge-cyan" style={{ fontSize: 10 }}>OCR Extracted</span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, fontSize: 12, color: 'var(--text-secondary)' }}>
                  <div style={{ padding: 10, border: '1px dashed var(--border-cyan)', borderRadius: 6, background: 'rgba(6, 182, 212, 0.05)' }}>
                    <div style={{ fontSize: 10, color: 'var(--cyan-400)', fontWeight: 600 }}>OCR FIELD [FDR_NO]</div>
                    <div className="mono" style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{fdrRecord.fdrNumber}</div>
                  </div>

                  <div style={{ padding: 10, border: '1px dashed var(--border-cyan)', borderRadius: 6, background: 'rgba(6, 182, 212, 0.05)' }}>
                    <div style={{ fontSize: 10, color: 'var(--cyan-400)', fontWeight: 600 }}>OCR FIELD [PRINCIPAL_AMOUNT]</div>
                    <div className="mono" style={{ fontWeight: 700, color: 'var(--text-primary)' }}>₹ {fdrRecord.amount.toLocaleString('en-IN')}</div>
                  </div>

                  <div style={{ gridColumn: 'span 2', padding: 10, border: fdrRecord.hasDiscrepancies ? '1px dashed var(--status-flagged)' : '1px dashed var(--border-cyan)', borderRadius: 6, background: fdrRecord.hasDiscrepancies ? 'rgba(251, 113, 133, 0.05)' : 'rgba(6, 182, 212, 0.05)' }}>
                    <div style={{ fontSize: 10, color: fdrRecord.hasDiscrepancies ? 'var(--status-flagged)' : 'var(--cyan-400)', fontWeight: 600 }}>
                      OCR FIELD [JOINT_PLEDGEE_TITLE]
                    </div>
                    <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{fdrRecord.jointHolderName}</div>
                  </div>

                  <div style={{ padding: 10, border: '1px dashed var(--border-cyan)', borderRadius: 6, background: 'rgba(6, 182, 212, 0.05)' }}>
                    <div style={{ fontSize: 10, color: 'var(--cyan-400)', fontWeight: 600 }}>OCR FIELD [ISSUE_DATE]</div>
                    <div className="mono" style={{ color: 'var(--text-primary)' }}>{fdrRecord.issueDate}</div>
                  </div>

                  <div style={{ padding: 10, border: '1px dashed var(--border-cyan)', borderRadius: 6, background: 'rgba(6, 182, 212, 0.05)' }}>
                    <div style={{ fontSize: 10, color: 'var(--cyan-400)', fontWeight: 600 }}>OCR FIELD [MATURITY_DATE]</div>
                    <div className="mono" style={{ color: 'var(--text-primary)' }}>{fdrRecord.maturityDate}</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'lineage' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-muted)' }}>
                Instrument Event Trail & Lineage Milestones:
              </div>
              {fdrRecord.lineage?.map((step, idx) => (
                <div
                  key={idx}
                  style={{
                    padding: 14,
                    background: 'rgba(10, 14, 22, 0.6)',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--border-subtle)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 4
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontWeight: 700, color: 'var(--gold-400)', fontSize: 13 }}>{step.event}</span>
                    <span className="mono" style={{ color: 'var(--text-dim)', fontSize: 11 }}>{step.date}</span>
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                    {step.detail}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="modal-footer">
          {fdrRecord.hasDiscrepancies && (
            <button
              onClick={() => {
                onClose();
                onInspectDiscrepancy(fdrRecord);
              }}
              className="btn btn-primary-gold"
            >
              <ShieldAlert size={14} />
              <span>Inspect Triangulation Discrepancy</span>
            </button>
          )}

          {fdrRecord.status === 'Release Requested' && (
            <button
              onClick={() => {
                onClose();
                onOpenReleaseWorkflow(fdrRecord);
              }}
              className="btn btn-cyan"
            >
              <FileCheck2 size={14} />
              <span>Proceed to Two-Officer Approval</span>
            </button>
          )}

          <button onClick={onClose} className="btn btn-secondary">
            Close Dossier
          </button>
        </div>
      </div>
    </div>
  );
}

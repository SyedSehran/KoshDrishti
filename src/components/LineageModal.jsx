import React from 'react';
import { X, GitBranch, ArrowRight, CheckCircle2, Landmark, Calendar, ShieldCheck } from 'lucide-react';

export default function LineageModal({ fdrRecord, onClose }) {
  if (!fdrRecord) return null;

  // Build a sample 3-generation lineage tree based on the record
  const lineageChain = [
    {
      level: 1,
      title: "Inception FDR (Initial Approval)",
      fdrNumber: fdrRecord.fdrNumber.replace(/\d+$/, '1001'),
      period: "2015 - 2020",
      amount: fdrRecord.amount,
      bank: fdrRecord.issuingBank,
      status: "Matured & Reinvested",
      badgeClass: "badge-released",
      note: "Initial establishment deposit pledged to Member Secretary, AICTE."
    },
    {
      level: 2,
      title: "1st Rollover Renewal",
      fdrNumber: fdrRecord.fdrNumber.replace(/\d+$/, '5022'),
      period: "2020 - 2025",
      amount: fdrRecord.amount * 1.15,
      bank: fdrRecord.issuingBank,
      status: "Interest Compounded",
      badgeClass: "badge-gold",
      note: "Renewed under APH Extension of Approval with cumulative interest."
    },
    {
      level: 3,
      title: "Current Active / Tracked Instrument",
      fdrNumber: fdrRecord.fdrNumber,
      period: `${fdrRecord.issueDate} - ${fdrRecord.maturityDate}`,
      amount: fdrRecord.amount,
      bank: fdrRecord.issuingBank,
      status: fdrRecord.status,
      badgeClass: fdrRecord.hasDiscrepancies ? "badge-flagged" : "badge-verified",
      note: fdrRecord.purpose
    }
  ];

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div 
        className="modal-container" 
        style={{ maxWidth: 840 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{
              width: 36,
              height: 36,
              borderRadius: 'var(--radius-md)',
              background: 'var(--gold-glow)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--gold-400)'
            }}>
              <GitBranch size={20} />
            </div>
            <div>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)' }}>
                Instrument Renewal & Replacement Lineage Graph
              </h3>
              <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                Tracing historical renewals, parent FDR links, and replacement guarantees for {fdrRecord.institutionName}
              </div>
            </div>
          </div>

          <button onClick={onClose} className="btn btn-secondary btn-sm" style={{ padding: 6, borderRadius: '50%' }}>
            <X size={16} />
          </button>
        </div>

        <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div style={{
            background: 'rgba(245, 158, 11, 0.08)',
            border: '1px solid var(--border-gold)',
            borderRadius: 'var(--radius-md)',
            padding: '12px 16px',
            fontSize: 12,
            color: 'var(--text-secondary)'
          }}>
            <strong>Lineage Preservation Guarantee:</strong> AICTE regulations mandate that upon rollover, all accumulated interest rights and lien priority clauses transition seamlessly without creating duplicate or unencumbered gaps.
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {lineageChain.map((node, index) => (
              <React.Fragment key={index}>
                <div style={{
                  padding: 16,
                  borderRadius: 'var(--radius-md)',
                  background: 'rgba(10, 14, 22, 0.7)',
                  border: node.level === 3 ? '1px solid var(--border-gold)' : '1px solid var(--border-subtle)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 8
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span className="mono" style={{ fontWeight: 700, color: 'var(--gold-400)', fontSize: 13 }}>
                        {node.fdrNumber}
                      </span>
                      <span className={`badge ${node.badgeClass}`} style={{ fontSize: 10 }}>
                        {node.status}
                      </span>
                    </div>
                    <span className="mono" style={{ fontSize: 11, color: 'var(--text-dim)' }}>
                      {node.period}
                    </span>
                  </div>

                  <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)' }}>
                    {node.title}
                  </div>

                  <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>
                    {node.note}
                  </div>

                  <div style={{ display: 'flex', gap: 16, fontSize: 11, color: 'var(--text-muted)', paddingTop: 4, borderTop: '1px solid var(--border-subtle)' }}>
                    <span>Bank: <strong>{node.bank}</strong></span>
                    <span>Amount: <strong>₹ {(node.amount / 100000).toFixed(1)} Lakhs</strong></span>
                    <span>Lien: <strong style={{ color: 'var(--status-verified)' }}>Member Secretary AICTE</strong></span>
                  </div>
                </div>

                {index < lineageChain.length - 1 && (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--gold-400)', gap: 6, fontSize: 11 }}>
                    <span>↓ Rolled Over & Linked</span>
                  </div>
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        <div className="modal-footer">
          <button onClick={onClose} className="btn btn-secondary">
            Close Lineage
          </button>
        </div>
      </div>
    </div>
  );
}

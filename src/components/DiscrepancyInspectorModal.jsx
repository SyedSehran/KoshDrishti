import React, { useState } from 'react';
import { X, AlertTriangle, CheckCircle, Send, RefreshCw } from 'lucide-react';
import { TrustStamp } from './SignatureVisuals';

export default function DiscrepancyInspectorModal({ 
  fdrRecord, 
  onClose, 
  onResolveDiscrepancy, 
  onIssueRectificationNotice 
}) {
  const [isCheckingBank, setIsCheckingBank] = useState(false);
  const [officerRemark, setOfficerRemark] = useState('');
  const [noticeSent, setNoticeSent] = useState(false);
  const [triangulationScore, setTriangulationScore] = useState(null);

  React.useEffect(() => {
    if (!fdrRecord) return;
    fetch('http://127.0.0.1:8000/api/v1/cbs/triangulate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        institution_data: { amount: fdrRecord.amount, isGovernmentExempt: fdrRecord.isGovernmentExempt },
        bank_record: {
          amount: fdrRecord.hasDiscrepancies ? 1500000 : fdrRecord.amount,
          tenorYears: fdrRecord.hasDiscrepancies ? 5 : (fdrRecord.tenorYears || 10),
          jointHolderName: fdrRecord.hasDiscrepancies ? "Secretary, Trust ONLY" : fdrRecord.jointHolderName,
          lienMarked: !fdrRecord.hasDiscrepancies
        },
        aph_norm: { minAmount: 3500000, tenorYears: 10 }
      })
    })
    .then(r => r.json())
    .then(d => setTriangulationScore(d))
    .catch(() => {});
  }, [fdrRecord]);

  if (!fdrRecord) return null;

  const handleSimulateBankCheck = async () => {
    setIsCheckingBank(true);
    try {
      const res = await fetch('http://127.0.0.1:8000/api/v1/cbs/triangulate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          institution_data: { amount: fdrRecord.amount },
          bank_record: {
            amount: 1500000,
            tenorYears: 5,
            jointHolderName: "Secretary, Trust ONLY",
            lienMarked: false
          },
          aph_norm: { minAmount: 3500000, tenorYears: 10 }
        })
      });
      const data = await res.json();
      setTriangulationScore(data);
    } catch {}
    setIsCheckingBank(false);
  };

  const handleSendNotice = () => {
    setNoticeSent(true);
    if (onIssueRectificationNotice) {
      onIssueRectificationNotice(fdrRecord, officerRemark || "Statutory notice issued for tenure shortfall and missing AICTE joint lien endorsement.");
    }
  };

  return (
    <div className="drawer-backdrop" onClick={onClose} style={{ alignItems: 'center', justifyContent: 'center' }}>
      <div 
        className="paper-card" 
        style={{ width: '100%', maxWidth: 860, maxHeight: '90vh', overflowY: 'auto', padding: 0 }}
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
                Compare Sources • Institution Declared vs Bank Record
              </h3>
              <span className="badge-clean badge-flagged" style={{ fontSize: 10 }}>
                Discrepancy Flagged
              </span>
            </div>
            <div style={{ fontSize: 11, color: 'var(--ink-muted)' }}>
              Cross-verification between institute upload and bank verification (simulated)
            </div>
          </div>

          <button onClick={onClose} className="btn btn-secondary btn-sm" style={{ padding: 6, borderRadius: '50%' }}>
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 18 }}>
          {/* Summary Alert */}
          <div style={{
            background: 'var(--ramp-vermilion-bg)',
            border: '1px solid var(--ramp-vermilion-border)',
            borderRadius: 'var(--radius-sm)',
            padding: '12px 16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 12
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <AlertTriangle size={18} color="var(--ramp-vermilion-text)" />
              <div style={{ fontSize: 12, color: 'var(--ramp-vermilion-text)' }}>
                <strong>Automated discrepancy detected:</strong> 3 inconsistencies found against APH 2024-27 Table 1.4 rules.
              </div>
            </div>

            <button
              onClick={handleSimulateBankCheck}
              disabled={isCheckingBank}
              className="btn btn-paper btn-sm"
              style={{ display: 'flex', alignItems: 'center', gap: 6 }}
            >
              <RefreshCw size={12} className={isCheckingBank ? 'spin' : ''} />
              <span>{isCheckingBank ? 'Checking bank...' : 'Bank check'}</span>
            </button>
          </div>

          {/* Rule-Based Compliance Score Strip */}
          <div style={{
            background: 'var(--bg-subtle)',
            border: '1px solid var(--border-medium)',
            borderRadius: 'var(--radius-sm)',
            padding: '12px 16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 12
          }}>
            <div>
              <span style={{ fontSize: 11, color: 'var(--ink-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: 600 }}>
                Rule-Based Compliance Score (APH Table 1.4)
              </span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 2 }}>
                <span className="mono" style={{ fontSize: 20, fontWeight: 700, color: (triangulationScore?.rule_compliance_score ?? 45) < 70 ? '#b91c1c' : '#047857' }}>
                  {triangulationScore?.rule_compliance_score ?? 45.0}%
                </span>
                <span className="badge-clean badge-flagged" style={{ fontSize: 10 }}>
                  {triangulationScore?.compliance_level || 'FLAGGED'}
                </span>
              </div>
            </div>
            <div style={{ textAlign: 'right', fontSize: 11, color: 'var(--ink-secondary)' }}>
              Deterministic statutory verification against Chapter 1 Table 1.4
            </div>
          </div>

          {/* Side-by-Side Comparison Columns */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            {/* Left Column: Institution Declared */}
            <div style={{ background: 'var(--bg-subtle)', padding: 16, border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                <span style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', color: 'var(--ink-secondary)' }}>
                  1. Institution Declared Data
                </span>
                <TrustStamp level="declared" size="sm" />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: 12 }}>
                <div>
                  <div style={{ color: 'var(--ink-muted)' }}>FDR Reference:</div>
                  <div className="mono" style={{ fontWeight: 600 }}>{fdrRecord.fdrNumber}</div>
                </div>

                <div>
                  <div style={{ color: 'var(--ink-muted)' }}>Claimed Amount:</div>
                  <div className="mono" style={{ fontWeight: 700, color: 'var(--ink-primary)' }}>
                    ₹ {fdrRecord.amount ? fdrRecord.amount.toLocaleString('en-IN') : '15,00,000'}
                  </div>
                </div>

                <div>
                  <div style={{ color: 'var(--ink-muted)' }}>Claimed Joint Pledgee Clause:</div>
                  <div style={{ background: '#ffffff', padding: '6px 8px', border: '1px solid var(--border-subtle)', borderRadius: 4, marginTop: 2 }}>
                    "Member Secretary, AICTE & Trust Secretary"
                  </div>
                </div>

                <div>
                  <div style={{ color: 'var(--ink-muted)' }}>Claimed Tenure:</div>
                  <div className="mono">10 Years Mandatory Term (2023 - 2033)</div>
                </div>
              </div>
            </div>

            {/* Right Column: Bank Confirmation */}
            <div style={{ background: 'var(--ramp-vermilion-bg)', padding: 16, border: '1px solid var(--ramp-vermilion-border)', borderRadius: 'var(--radius-sm)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                <span style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', color: 'var(--ramp-vermilion-text)' }}>
                  2. Bank Verification (Simulated)
                </span>
                <TrustStamp level="bank" size="sm" />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: 12 }}>
                <div>
                  <div style={{ color: 'var(--ink-muted)' }}>Bank & Core Node:</div>
                  <div style={{ fontWeight: 600 }}>{fdrRecord.issuingBank}</div>
                </div>

                <div>
                  <div style={{ color: 'var(--ink-muted)' }}>Recorded Principal:</div>
                  <div className="mono" style={{ fontWeight: 700, color: 'var(--ramp-vermilion-text)' }}>
                    ₹ 15,00,000 (Shortfall: APH Table 1.4 requires ₹35L)
                  </div>
                </div>

                <div>
                  <div style={{ color: 'var(--ink-muted)' }}>Registered Account Title:</div>
                  <div style={{ background: '#ffffff', padding: '6px 8px', border: '1px solid var(--ramp-vermilion-border)', borderRadius: 4, marginTop: 2, color: 'var(--ramp-vermilion-text)', fontWeight: 600 }}>
                    ⚠️ "Secretary, Trust ONLY" (AICTE NOT added!)
                  </div>
                </div>

                <div>
                  <div style={{ color: 'var(--ink-muted)' }}>Recorded Maturity:</div>
                  <div className="mono" style={{ color: 'var(--ramp-vermilion-text)', fontWeight: 600 }}>
                    5 Years (Matures 2028-08-10 — Violates 10-Yr Term)
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Officer Scrutiny Note Box */}
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--ink-secondary)', display: 'block', marginBottom: 4 }}>
              Scrutiny Officer Observation & Action Direction:
            </label>
            <textarea
              className="input-paper"
              rows={2}
              value={officerRemark}
              onChange={(e) => setOfficerRemark(e.target.value)}
              placeholder="Record official observation (logged into audit log #1408)..."
            />
          </div>

          {noticeSent && (
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
              <CheckCircle size={15} />
              <span>
                <strong>Notice issued:</strong> Statutory Rectification Notice #REG/AICTE/2026/DISC dispatched with 15-day compliance window.
              </span>
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
            Close comparison
          </button>

          <button
            onClick={handleSendNotice}
            disabled={noticeSent}
            className="btn btn-ink-primary btn-sm"
          >
            <Send size={13} />
            <span>{noticeSent ? 'Notice Dispatched' : 'Issue Rectification Notice'}</span>
          </button>

          <button
            onClick={() => {
              if (onResolveDiscrepancy) onResolveDiscrepancy(fdrRecord.id);
              onClose();
            }}
            className="btn btn-paper btn-sm"
            title="Simulate bank branch confirming the corrected lien"
          >
            <span>Simulate Bank Endorsement Fix</span>
          </button>
        </div>
      </div>
    </div>
  );
}

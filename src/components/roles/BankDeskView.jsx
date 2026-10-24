import React, { useState } from 'react';
import { Landmark, CheckCircle2, ShieldAlert, FileCode, RefreshCw, KeyRound, ArrowRight } from 'lucide-react';
import { TrustStamp, ExpiryChip } from '../SignatureVisuals';
import { APH_CONFIG } from '../../config/aph';

export default function BankDeskView({ 
  records, 
  onResolveDiscrepancy, 
  onOpenCaseFile,
  onOpenCompareSources 
}) {
  const [selectedBank, setSelectedBank] = useState("Punjab National Bank");
  const [cbsStatus, setCbsStatus] = useState("ONLINE");

  const bankRecords = records.filter(r => r.issuingBank === selectedBank);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Bank Header Card */}
      <div className="paper-card" style={{ padding: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{
              width: 44,
              height: 44,
              borderRadius: 8,
              background: '#e0f2fe',
              border: '1px solid #bae6fd',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#0284c7',
              fontSize: 22
            }}>
              🏦
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <h2 className="serif-heading" style={{ fontSize: 18, color: 'var(--ink-primary)' }}>
                  Bank Branch Verification Desk • Core Banking System Gateway
                </h2>
                <span className="badge-clean badge-active" style={{ fontSize: 10 }}>
                  SFMS ISO20022 Direct Node
                </span>
              </div>
              <div style={{ fontSize: 12, color: 'var(--ink-secondary)', marginTop: 2 }}>
                Confirm or flag joint lien endorsements pledged to Member Secretary, AICTE
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 12, color: 'var(--ink-muted)' }}>Select Bank Node:</span>
            <select
              className="input-paper"
              value={selectedBank}
              onChange={(e) => setSelectedBank(e.target.value)}
              style={{ width: 220, height: 36, fontWeight: 600 }}
            >
              {APH_CONFIG.rbiScheduledBanks.map(b => (
                <option key={b.code} value={b.name}>{b.name} ({b.type.split(' ')[0]})</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Verification Queue Table */}
      <div className="paper-card" style={{ padding: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <div>
            <h3 className="serif-heading" style={{ fontSize: 16, color: 'var(--ink-primary)' }}>
              {selectedBank} • Core Banking Verification Queue
            </h3>
            <div style={{ fontSize: 12, color: 'var(--ink-muted)' }}>
              {bankRecords.length} deposit instruments booked across branches
            </div>
          </div>

          <span className="mono" style={{ fontSize: 11, color: 'var(--stamp-bank-color)', fontWeight: 600 }}>
            Bank verification (simulated)
          </span>
        </div>

        <div style={{ overflowX: 'auto', border: '1px solid var(--border-medium)', borderRadius: 'var(--radius-sm)' }}>
          <table className="paper-table">
            <thead>
              <tr>
                <th>FDR Reference</th>
                <th>Pledged Institution</th>
                <th>Deposit Amount</th>
                <th>Lien Endorsement Status</th>
                <th>Maturity Horizon</th>
                <th style={{ textAlign: 'right' }}>Bank Actions</th>
              </tr>
            </thead>
            <tbody>
              {bankRecords.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '36px', color: 'var(--ink-muted)' }}>
                    No instruments currently queued for {selectedBank}. Select another bank node above.
                  </td>
                </tr>
              ) : (
                bankRecords.map(item => (
                  <tr key={item.id} onClick={() => onOpenCaseFile(item)} style={{ cursor: 'pointer' }}>
                    <td>
                      <div className="mono" style={{ fontWeight: 700, color: 'var(--ink-primary)' }}>
                        {item.fdrNumber}
                      </div>
                      <div className="mono" style={{ fontSize: 10, color: 'var(--ink-muted)' }}>
                        {item.ifsc}
                      </div>
                    </td>

                    <td>
                      <div style={{ fontWeight: 600 }}>{item.institutionName}</div>
                      <div style={{ fontSize: 11, color: 'var(--ink-muted)' }}>{item.jointHolderName}</div>
                    </td>

                    <td>
                      <span className="mono" style={{ fontWeight: 700, fontSize: 13 }}>
                        ₹ {(item.amount / 100000).toFixed(1)} Lakhs
                      </span>
                    </td>

                    <td>
                      {item.hasDiscrepancies ? (
                        <span className="badge-clean badge-flagged">
                          ⚠️ Discrepancy Flagged
                        </span>
                      ) : item.lienMarked ? (
                        <span className="badge-clean badge-active">
                          ✓ Lien Endorsed to AICTE
                        </span>
                      ) : (
                        <span className="badge-clean badge-warning">
                          Pending Endorsement
                        </span>
                      )}
                    </td>

                    <td>
                      <ExpiryChip days={item.daysRemaining} />
                    </td>

                    <td style={{ textAlign: 'right' }} onClick={(e) => e.stopPropagation()}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 6 }}>
                        {item.hasDiscrepancies && (
                          <button
                            onClick={() => onOpenCompareSources(item)}
                            className="btn btn-sm"
                            style={{ background: '#fef2f2', border: '1px solid #fca5a5', color: '#b91c1c', fontWeight: 700 }}
                          >
                            <span>Compare Diff</span>
                          </button>
                        )}

                        {!item.lienMarked || item.hasDiscrepancies ? (
                          <button
                            onClick={() => onResolveDiscrepancy(item.id)}
                            className="btn btn-sm"
                            style={{ background: '#eff6ff', border: '1px solid #93c5fd', color: '#1d4ed8', fontWeight: 700 }}
                            title="Simulate Bank branch endorsing AICTE lien in Core Banking"
                          >
                            <CheckCircle2 size={12} />
                            <span>Endorse Lien in CBS</span>
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onOpenCaseFile(item);
                            }}
                            className="btn btn-paper btn-sm"
                            style={{ border: '1.5px solid var(--ink-primary)', fontWeight: 700 }}
                          >
                            <span>Case file</span>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

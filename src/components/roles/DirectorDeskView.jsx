import React, { useState } from 'react';
import { Award, ShieldCheck, CheckCircle2, FileText, AlertCircle, ArrowRight, UserCheck, Stamp, ExternalLink, Download } from 'lucide-react';
import { TrustStamp, ExpiryChip } from '../SignatureVisuals';

export default function DirectorDeskView({
  records,
  onOpenCaseFile,
  onOpenTwoOfficerApproval,
  onOpenAuditLog
}) {
  const [filterType, setFilterType] = useState('ALL');

  // Filter instruments pending sanction or release
  const pendingSanctions = records.filter(r => r.status === 'Release' || r.daysRemaining <= 0);
  
  // High value portfolio (> 25 Lakhs)
  const highValueInstruments = records.filter(r => r.amount >= 2500000);

  // Total funds in custody
  const totalAmountCr = (records.reduce((acc, r) => acc + (r.amount || 0), 0) / 10000000).toFixed(2);
  const releasedCount = records.filter(r => r.status === 'Released' || r.legacyStatus?.includes('Discharged')).length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* 1. Executive Banner */}
      <div className="paper-card" style={{
        padding: 24,
        background: 'linear-gradient(135deg, #ffffff 0%, #fdf8f0 100%)',
        border: '1.5px solid #fed7aa',
        boxShadow: 'var(--shadow-card)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{
              width: 50,
              height: 50,
              borderRadius: 10,
              background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 26,
              boxShadow: '0 4px 12px rgba(217, 119, 6, 0.25)'
            }}>
              ⚖️
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <h2 className="serif-heading" style={{ fontSize: 20, color: 'var(--ink-primary)' }}>
                  Approving Authority & Directorate Chamber
                </h2>
                <span className="badge-clean badge-warning" style={{ fontSize: 10.5, fontWeight: 700 }}>
                  Regional Director AICTE
                </span>
              </div>
              <div style={{ fontSize: 12.5, color: 'var(--ink-secondary)', marginTop: 3 }}>
                Final statutory sanction authority for security deposit discharge orders, APH Table 1.4 lien closures, and forensic audit sign-offs.
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <button
              onClick={onOpenAuditLog}
              className="btn btn-paper"
              style={{ fontSize: 12, height: 38 }}
            >
              <FileText size={14} />
              <span>Review Regulatory Audit Ledger</span>
            </button>
            <div style={{
              padding: '6px 12px',
              background: '#ecfdf5',
              border: '1px solid #a7f3d0',
              borderRadius: 'var(--radius-sm)',
              fontSize: 12,
              fontWeight: 700,
              color: '#047857',
              display: 'flex',
              alignItems: 'center',
              gap: 6
            }}>
              <CheckCircle2 size={14} />
              <span>DSC Token: Connected (Class 3 Govt)</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Directorate Key Performance Metrics */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 14 }}>
        <div className="paper-card" style={{ padding: 16, borderTop: '3px solid #f59e0b' }}>
          <div style={{ fontSize: 11.5, color: 'var(--ink-muted)', fontWeight: 600 }}>Total Custody Escrow</div>
          <div className="mono" style={{ fontSize: 22, fontWeight: 700, color: 'var(--ink-primary)', marginTop: 4 }}>
            ₹ {totalAmountCr} <span style={{ fontSize: 13, fontWeight: 500 }}>Crores</span>
          </div>
          <div style={{ fontSize: 11, color: 'var(--ink-secondary)', marginTop: 4 }}>
            In 10-Yr / 8-Yr lien escrow
          </div>
        </div>

        <div className="paper-card" style={{ padding: 16, borderTop: '3px solid #ef4444' }}>
          <div style={{ fontSize: 11.5, color: 'var(--ink-muted)', fontWeight: 600 }}>Sanctions Pending DSC</div>
          <div className="mono" style={{ fontSize: 22, fontWeight: 700, color: '#b91c1c', marginTop: 4 }}>
            {pendingSanctions.length} <span style={{ fontSize: 13, fontWeight: 500 }}>Institutions</span>
          </div>
          <div style={{ fontSize: 11, color: '#b91c1c', marginTop: 4 }}>
            Awaiting 2nd Officer Sanction
          </div>
        </div>

        <div className="paper-card" style={{ padding: 16, borderTop: '3px solid #10b981' }}>
          <div style={{ fontSize: 11.5, color: 'var(--ink-muted)', fontWeight: 600 }}>Discharged Post 10-Yr</div>
          <div className="mono" style={{ fontSize: 22, fontWeight: 700, color: '#047857', marginTop: 4 }}>
            {releasedCount} <span style={{ fontSize: 13, fontWeight: 500 }}>NOCs Issued</span>
          </div>
          <div style={{ fontSize: 11, color: '#047857', marginTop: 4 }}>
            Digital NOC orders dispatched
          </div>
        </div>

        <div className="paper-card" style={{ padding: 16, borderTop: '3px solid #3b82f6' }}>
          <div style={{ fontSize: 11.5, color: 'var(--ink-muted)', fontWeight: 600 }}>APH Table 1.4 Compliance</div>
          <div className="mono" style={{ fontSize: 22, fontWeight: 700, color: '#1d4ed8', marginTop: 4 }}>
            98.8%
          </div>
          <div style={{ fontSize: 11, color: '#1d4ed8', marginTop: 4 }}>
            All joint titles reconciled
          </div>
        </div>
      </div>

      {/* 3. High-Priority Two-Officer Sanction Queue */}
      <div className="paper-card" style={{ padding: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, flexWrap: 'wrap', gap: 10 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <h3 className="serif-heading" style={{ fontSize: 16, color: 'var(--ink-primary)' }}>
                Two-Officer Digital Sanction Queue (Release / NOC Orders)
              </h3>
              <span className="badge-clean badge-warning" style={{ fontSize: 10 }}>
                {pendingSanctions.length} Urgent
              </span>
            </div>
            <div style={{ fontSize: 12, color: 'var(--ink-muted)', marginTop: 2 }}>
              Requires Class-3 Digital Signature Certificate (DSC) from Regional Director AICTE after scrutiny officer verification.
            </div>
          </div>
        </div>

        <div style={{ overflowX: 'auto', border: '1px solid var(--border-medium)', borderRadius: 'var(--radius-sm)' }}>
          <table className="paper-table">
            <thead>
              <tr>
                <th>Instrument & Trust</th>
                <th>Institution & State</th>
                <th>Original Deposit</th>
                <th>Lock-in Status</th>
                <th>Scrutiny Clearance</th>
                <th style={{ textAlign: 'right' }}>Directorate Action</th>
              </tr>
            </thead>
            <tbody>
              {pendingSanctions.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '36px', color: 'var(--ink-muted)' }}>
                    No discharge sanctions currently pending in queue.
                  </td>
                </tr>
              ) : (
                pendingSanctions.map(item => (
                  <tr key={item.id} onClick={() => onOpenCaseFile(item)} style={{ cursor: 'pointer' }}>
                    <td>
                      <div className="mono" style={{ fontWeight: 700, color: 'var(--ink-primary)' }}>
                        {item.fdrNumber}
                      </div>
                      <div style={{ marginTop: 3 }}>
                        <TrustStamp level={item.trustLevel || 'bank'} size="sm" />
                      </div>
                      <div style={{ fontSize: 10.5, color: 'var(--ink-muted)', marginTop: 2 }}>
                        {item.issuingBank}
                      </div>
                    </td>

                    <td>
                      <div style={{ fontWeight: 600, color: 'var(--ink-primary)' }}>
                        {item.institutionName}
                      </div>
                      <div style={{ fontSize: 11, color: 'var(--ink-secondary)', marginTop: 1 }}>
                        {item.city}, {item.state} • <span className="mono">{item.institutionId}</span>
                      </div>
                      <div style={{ fontSize: 10.5, color: 'var(--ink-muted)' }}>
                        {item.programType}
                      </div>
                    </td>

                    <td>
                      <div className="mono" style={{ fontWeight: 700, fontSize: 13, color: 'var(--ink-primary)' }}>
                        ₹ {(item.amount / 100000).toFixed(1)} Lakhs
                      </div>
                      <div style={{ fontSize: 10.5, color: 'var(--ink-muted)' }}>
                        {item.tenorYears || 10} Yrs Lock-in
                      </div>
                    </td>

                    <td>
                      <ExpiryChip days={item.daysRemaining} />
                      <div className="mono" style={{ fontSize: 10.5, color: 'var(--ink-muted)', marginTop: 3 }}>
                        Matured: {item.maturityDate}
                      </div>
                    </td>

                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 5, color: '#047857', fontSize: 11.5, fontWeight: 600 }}>
                        <CheckCircle2 size={13} />
                        <span>Officer Cleared</span>
                      </div>
                      <div style={{ fontSize: 10, color: 'var(--ink-muted)', marginTop: 1 }}>
                        No ongoing vigilance inquiry
                      </div>
                    </td>

                    <td style={{ textAlign: 'right' }} onClick={(e) => e.stopPropagation()}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 6 }}>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onOpenTwoOfficerApproval(item);
                          }}
                          className="btn btn-ink-primary btn-sm"
                          style={{
                            background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
                            color: '#ffffff',
                            fontWeight: 700
                          }}
                          title="Open 5-point condition checklist and digitally sign AICTE discharge order"
                        >
                          <Stamp size={12} />
                          <span>Sanction Discharge</span>
                        </button>

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
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 4. High-Value Deposit Register (> ₹25 Lakhs) */}
      <div className="paper-card" style={{ padding: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <div>
            <h3 className="serif-heading" style={{ fontSize: 16, color: 'var(--ink-primary)' }}>
              High-Value Escrow Portfolio (≥ ₹25 Lakhs Deposits)
            </h3>
            <div style={{ fontSize: 12, color: 'var(--ink-muted)' }}>
              Major technical institutions governed under Table 1.4 Chapter 1
            </div>
          </div>
          <span className="mono" style={{ fontSize: 11, color: 'var(--ink-muted)' }}>
            Showing {highValueInstruments.slice(0, 8).length} of {highValueInstruments.length} instruments
          </span>
        </div>

        <div style={{ overflowX: 'auto', border: '1px solid var(--border-medium)', borderRadius: 'var(--radius-sm)' }}>
          <table className="paper-table">
            <thead>
              <tr>
                <th>FDR Number</th>
                <th>Institution</th>
                <th>Amount</th>
                <th>Pledge Details</th>
                <th>Validity Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {highValueInstruments.slice(0, 8).map(item => (
                <tr key={item.id} onClick={() => onOpenCaseFile(item)} style={{ cursor: 'pointer' }}>
                  <td>
                    <div className="mono" style={{ fontWeight: 700, color: 'var(--ink-primary)' }}>
                      {item.fdrNumber}
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--ink-muted)' }}>{item.issuingBank}</div>
                  </td>
                  <td>
                    <div style={{ fontWeight: 600 }}>{item.institutionName}</div>
                    <div style={{ fontSize: 11, color: 'var(--ink-muted)' }}>{item.city}, {item.state}</div>
                  </td>
                  <td>
                    <span className="mono" style={{ fontWeight: 700, fontSize: 13 }}>
                      ₹ {(item.amount / 100000).toFixed(1)} Lakhs
                    </span>
                  </td>
                  <td>
                    <div style={{ fontSize: 11, color: 'var(--ink-secondary)' }}>{item.jointHolderName}</div>
                  </td>
                  <td>
                    <ExpiryChip days={item.daysRemaining} />
                  </td>
                  <td style={{ textAlign: 'right' }} onClick={(e) => e.stopPropagation()}>
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

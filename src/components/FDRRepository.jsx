import React, { useState } from 'react';
import { 
  Building2, 
  Calendar, 
  ExternalLink, 
  FileSearch, 
  ShieldCheck, 
  ShieldAlert, 
  Clock, 
  FileText, 
  ChevronRight, 
  CheckCircle2, 
  Download,
  Info,
  GitBranch,
  Filter
} from 'lucide-react';

export default function FDRRepository({ 
  records, 
  onSelectFDR, 
  onInspectDiscrepancy, 
  onOpenReleaseWorkflow,
  onOpenLineageModal,
  searchQuery,
  activeFilter
}) {
  const [selectedRegion, setSelectedRegion] = useState('ALL');
  const [selectedBank, setSelectedBank] = useState('ALL');
  const [sortBy, setSortBy] = useState('amount_desc');

  // Filter logic
  const filteredRecords = records.filter(item => {
    // Search query filter
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch = !q || 
      item.fdrNumber.toLowerCase().includes(q) ||
      item.institutionName.toLowerCase().includes(q) ||
      item.institutionId.toLowerCase().includes(q) ||
      item.issuingBank.toLowerCase().includes(q) ||
      item.city.toLowerCase().includes(q) ||
      item.state.toLowerCase().includes(q);

    // Filter pill
    let matchesPill = true;
    if (activeFilter === 'verified') matchesPill = item.status === 'Verified & Active';
    if (activeFilter === 'discrepancy') matchesPill = item.hasDiscrepancies || item.status === 'Discrepancy Flagged';
    if (activeFilter === 'expiring') matchesPill = item.status === 'Expiring Soon' || (item.daysRemaining > 0 && item.daysRemaining <= 60);
    if (activeFilter === 'release') matchesPill = item.status === 'Release Requested';

    // Dropdown filters
    const matchesRegion = selectedRegion === 'ALL' || item.region === selectedRegion;
    const matchesBank = selectedBank === 'ALL' || item.issuingBank === selectedBank;

    return matchesSearch && matchesPill && matchesRegion && matchesBank;
  });

  // Sort logic
  const sortedRecords = [...filteredRecords].sort((a, b) => {
    if (sortBy === 'amount_desc') return b.amount - a.amount;
    if (sortBy === 'amount_asc') return a.amount - b.amount;
    if (sortBy === 'maturity_asc') return new Date(a.maturityDate) - new Date(b.maturityDate);
    if (sortBy === 'confidence_desc') return b.scrutinyConfidence - a.scrutinyConfidence;
    return 0;
  });

  // Helpers
  const formatLakhs = (amt) => {
    if (amt >= 10000000) return `₹ ${(amt / 10000000).toFixed(2)} Cr`;
    return `₹ ${(amt / 100000).toFixed(1)} Lakhs`;
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Verified & Active':
        return <span className="badge badge-verified"><CheckCircle2 size={12} /> Active Lien</span>;
      case 'Discrepancy Flagged':
        return <span className="badge badge-flagged"><ShieldAlert size={12} /> Discrepancy</span>;
      case 'Expiring Soon':
        return <span className="badge badge-warning"><Clock size={12} /> Expiring &lt;30d</span>;
      case 'Release Requested':
        return <span className="badge badge-cyan"><FileText size={12} /> 4-Eye Release</span>;
      case 'Rolled Over':
        return <span className="badge badge-gold"><GitBranch size={12} /> Rolled Over</span>;
      case 'Released':
        return <span className="badge badge-released"><ShieldCheck size={12} /> Discharged</span>;
      default:
        return <span className="badge">{status}</span>;
    }
  };

  const regions = ['ALL', 'Northern', 'Western', 'Southern', 'South-Western', 'Eastern', 'Central', 'North-West'];
  const banks = ['ALL', 'State Bank of India', 'Punjab National Bank', 'Canara Bank', 'Bank of Baroda', 'HDFC Bank', 'Union Bank of India', 'Bank of India'];

  return (
    <div className="glass-panel" style={{ padding: 24 }}>
      {/* Table Control Bar */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 16,
        marginBottom: 20
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-primary)' }}>
            Centralized FDR & Security Repository
          </h2>
          <span className="badge badge-gold" style={{ fontSize: 11 }}>
            {sortedRecords.length} Instruments Loaded
          </span>
        </div>

        {/* Filters and Sort */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          {/* Region selector */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Region:</span>
            <select
              className="input-control"
              value={selectedRegion}
              onChange={(e) => setSelectedRegion(e.target.value)}
              style={{ width: 140, height: 34, padding: '4px 28px 4px 10px', fontSize: 12 }}
            >
              {regions.map(r => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </div>

          {/* Bank selector */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Bank:</span>
            <select
              className="input-control"
              value={selectedBank}
              onChange={(e) => setSelectedBank(e.target.value)}
              style={{ width: 160, height: 34, padding: '4px 28px 4px 10px', fontSize: 12 }}
            >
              {banks.map(b => (
                <option key={b} value={b}>{b === 'ALL' ? 'All Banks' : b.split(' ')[0] + ' ' + (b.split(' ')[1] || '')}</option>
              ))}
            </select>
          </div>

          {/* Sort selector */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Sort:</span>
            <select
              className="input-control"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              style={{ width: 150, height: 34, padding: '4px 28px 4px 10px', fontSize: 12 }}
            >
              <option value="amount_desc">Amount (High to Low)</option>
              <option value="amount_asc">Amount (Low to High)</option>
              <option value="maturity_asc">Maturity Date (Earliest)</option>
              <option value="confidence_desc">Scrutiny Score</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table Structure */}
      <div style={{ overflowX: 'auto', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 13 }}>
          <thead>
            <tr style={{
              background: 'rgba(10, 14, 22, 0.75)',
              borderBottom: '1px solid var(--border-medium)',
              color: 'var(--text-muted)',
              fontSize: 11,
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.04em'
            }}>
              <th style={{ padding: '14px 18px' }}>Instrument Reference</th>
              <th style={{ padding: '14px 18px' }}>Technical Institution & Trust</th>
              <th style={{ padding: '14px 18px' }}>Deposit Amount</th>
              <th style={{ padding: '14px 18px' }}>Lien & Joint Clause</th>
              <th style={{ padding: '14px 18px' }}>Tenor & Maturity</th>
              <th style={{ padding: '14px 18px' }}>Status & Confidence</th>
              <th style={{ padding: '14px 18px', textAlign: 'right' }}>Regulatory Actions</th>
            </tr>
          </thead>
          <tbody>
            {sortedRecords.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-muted)' }}>
                  No FDR records matched the selected query or filters.
                </td>
              </tr>
            ) : (
              sortedRecords.map((item, idx) => (
                <tr
                  key={item.id}
                  style={{
                    borderBottom: '1px solid var(--border-subtle)',
                    background: idx % 2 === 0 ? 'rgba(255, 255, 255, 0.01)' : 'rgba(255, 255, 255, 0.025)',
                    transition: 'background 0.15s ease'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(245, 158, 11, 0.04)'}
                  onMouseLeave={(e) => e.currentTarget.style.background = idx % 2 === 0 ? 'rgba(255, 255, 255, 0.01)' : 'rgba(255, 255, 255, 0.025)'}
                >
                  {/* FDR Ref & Bank */}
                  <td style={{ padding: '14px 18px' }}>
                    <div className="mono" style={{ fontWeight: 700, color: 'var(--gold-400)', fontSize: 13 }}>
                      {item.fdrNumber}
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 6, marginTop: 3 }}>
                      <span>{item.issuingBank}</span>
                      <span>•</span>
                      <span className="mono" style={{ color: 'var(--text-dim)' }}>{item.ifsc}</span>
                    </div>
                    <div style={{ fontSize: 10, color: 'var(--cyan-400)', marginTop: 2 }}>
                      {item.bankCategory || "RBI Scheduled Commercial Bank"}
                    </div>
                  </td>

                  {/* Institution Name & Trust */}
                  <td style={{ padding: '14px 18px', maxWidth: 260 }}>
                    <div style={{ fontWeight: 600, color: 'var(--text-primary)', lineHeight: 1.3 }}>
                      {item.institutionName}
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 3 }}>
                      ID: <span className="mono">{item.institutionId}</span> ({item.city}, {item.state})
                    </div>
                    <div style={{ fontSize: 10, color: item.isGovernmentExempt ? 'var(--status-verified)' : 'var(--gold-400)', marginTop: 2, display: 'flex', alignItems: 'center', gap: 4 }}>
                      <span>{item.aphTableNorm || item.programType}</span>
                    </div>
                  </td>

                  {/* Amount */}
                  <td style={{ padding: '14px 18px' }}>
                    {item.isGovernmentExempt ? (
                      <div>
                        <div className="mono" style={{ fontSize: 13, fontWeight: 700, color: 'var(--status-verified)' }}>
                          ₹ 0 (Govt Exempt)
                        </div>
                        <div style={{ fontSize: 10, color: 'var(--text-dim)', marginTop: 2 }}>
                          APH 1.4(c) Affidavit Verified
                        </div>
                      </div>
                    ) : (
                      <div>
                        <div className="mono" style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>
                          {formatLakhs(item.amount)}
                        </div>
                        <div style={{ fontSize: 10, color: 'var(--text-dim)', marginTop: 2 }}>
                          ₹ {item.amount.toLocaleString('en-IN')}
                        </div>
                      </div>
                    )}
                  </td>

                  {/* Lien & Joint Clause */}
                  <td style={{ padding: '14px 18px', maxWidth: 220 }}>
                    {item.hasDiscrepancies ? (
                      <div>
                        <span className="badge badge-flagged" style={{ fontSize: 10 }}>
                          Missing AICTE Joint Lien
                        </span>
                        <div style={{ fontSize: 11, color: 'var(--status-flagged)', marginTop: 4 }}>
                          Registered in institute name only
                        </div>
                      </div>
                    ) : item.lienMarked ? (
                      <div>
                        <span className="badge badge-verified" style={{ fontSize: 10 }}>
                          <CheckCircle2 size={10} /> Lien Endorsed
                        </span>
                        <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 4 }}>
                          Joint with Member Secretary
                        </div>
                      </div>
                    ) : (
                      <div>
                        <span className="badge badge-released" style={{ fontSize: 10 }}>
                          Lien Released
                        </span>
                        <div style={{ fontSize: 11, color: 'var(--text-dim)', marginTop: 4 }}>
                          Discharged to Trust
                        </div>
                      </div>
                    )}
                  </td>

                  {/* Tenor & Maturity */}
                  <td style={{ padding: '14px 18px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <Calendar size={13} color="var(--text-muted)" />
                      <span className="mono" style={{ fontSize: 12, color: 'var(--text-primary)' }}>
                        {item.maturityDate}
                      </span>
                    </div>
                    <div style={{ fontSize: 11, marginTop: 4 }}>
                      {item.daysRemaining > 0 ? (
                        <span style={{ color: item.daysRemaining <= 30 ? 'var(--status-warning)' : 'var(--text-muted)' }}>
                          {item.daysRemaining} days left ({item.tenorYears}y tenor)
                        </span>
                      ) : (
                        <span style={{ color: 'var(--status-released)' }}>
                          Matured ({item.tenorYears}y completed)
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Status & Confidence */}
                  <td style={{ padding: '14px 18px' }}>
                    <div style={{ marginBottom: 4 }}>
                      {getStatusBadge(item.status)}
                    </div>
                    {item.legacyPortalStatus && (
                      <div style={{ fontSize: 10, color: 'var(--text-dim)', marginBottom: 6 }}>
                        Legacy: {item.legacyPortalStatus}
                      </div>
                    )}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <div style={{
                        width: 50,
                        height: 5,
                        borderRadius: 3,
                        background: 'rgba(255, 255, 255, 0.1)',
                        overflow: 'hidden'
                      }}>
                        <div style={{
                          width: `${item.scrutinyConfidence}%`,
                          height: '100%',
                          background: item.scrutinyConfidence > 90 ? 'var(--status-verified)' : item.scrutinyConfidence > 70 ? 'var(--status-warning)' : 'var(--status-flagged)'
                        }} />
                      </div>
                      <span className="mono" style={{ fontSize: 10, color: 'var(--text-muted)' }}>
                        {item.scrutinyConfidence}%
                      </span>
                    </div>
                  </td>

                  {/* Actions */}
                  <td style={{ padding: '14px 18px', textAlign: 'right' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 6 }}>
                      {/* If discrepancy, highlight inspection */}
                      {item.hasDiscrepancies && (
                        <button
                          onClick={() => onInspectDiscrepancy(item)}
                          className="btn btn-primary-gold btn-sm"
                          title="Inspect bank vs institute discrepancy"
                        >
                          <ShieldAlert size={12} />
                          <span>Inspect Diff</span>
                        </button>
                      )}

                      {/* If release requested, highlight 4-eye approval */}
                      {item.status === 'Release Requested' && (
                        <button
                          onClick={() => onOpenReleaseWorkflow(item)}
                          className="btn btn-cyan btn-sm"
                          title="Open 4-Eye Release & Discharge Workflow"
                        >
                          <FileText size={12} />
                          <span>4-Eye Approval</span>
                        </button>
                      )}

                      {/* Lineage / Rollover ancestry */}
                      <button
                        onClick={() => onOpenLineageModal(item)}
                        className="btn btn-secondary btn-sm"
                        title="View instrument lineage and renewal chain"
                      >
                        <GitBranch size={12} />
                      </button>

                      {/* Detail inspector */}
                      <button
                        onClick={() => onSelectFDR(item)}
                        className="btn btn-secondary btn-sm"
                        title="View instrument dossier and documents"
                      >
                        <FileSearch size={12} />
                        <span>Dossier</span>
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
  );
}

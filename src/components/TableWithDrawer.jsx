import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Filter, ShieldAlert, FileText, CheckCircle2, Download } from 'lucide-react';
import { ExpiryChip, TrustStamp } from './SignatureVisuals';

export default function TableWithDrawer({
  records,
  onSelectInstrument,
  onOpenCompareSources,
  onOpenTwoOfficerApproval,
  searchQuery,
  statusFilter,
  setStatusFilter,
  regionFilter,
  setRegionFilter
}) {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [sortBy, setSortBy] = useState('amount_desc');
  const [bankFilter, setBankFilter] = useState('ALL');

  // Filter records
  const filtered = records.filter(item => {
    // Search query
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch = !q ||
      item.fdrNumber?.toLowerCase().includes(q) ||
      item.institutionName?.toLowerCase().includes(q) ||
      item.institutionId?.toLowerCase().includes(q) ||
      item.issuingBank?.toLowerCase().includes(q) ||
      item.city?.toLowerCase().includes(q) ||
      item.state?.toLowerCase().includes(q);

    // Status filter
    let matchesStatus = true;
    if (statusFilter !== 'ALL') {
      if (statusFilter === 'Discrepancy') matchesStatus = item.status === 'Discrepancy' || item.hasDiscrepancies;
      else if (statusFilter === 'Release') matchesStatus = item.status === 'Release' || item.status === 'Released';
      else matchesStatus = item.status === statusFilter;
    }

    // Region filter
    const matchesRegion = regionFilter === 'ALL' || item.region === regionFilter;

    // Bank filter
    const matchesBank = bankFilter === 'ALL' || item.issuingBank === bankFilter;

    return matchesSearch && matchesStatus && matchesRegion && matchesBank;
  });

  // Sort records
  const sorted = [...filtered].sort((a, b) => {
    if (sortBy === 'amount_desc') return b.amount - a.amount;
    if (sortBy === 'amount_asc') return a.amount - b.amount;
    if (sortBy === 'maturity_asc') return new Date(a.maturityDate) - new Date(b.maturityDate);
    if (sortBy === 'ocr_desc') return (b.ocrMatchPct || 0) - (a.ocrMatchPct || 0);
    return a.institutionName.localeCompare(b.institutionName);
  });

  // Paginate
  const totalPages = Math.ceil(sorted.length / pageSize) || 1;
  const paginated = sorted.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  // Bank list
  const uniqueBanks = Array.from(new Set(records.map(r => r.issuingBank))).filter(Boolean);

  return (
    <div className="paper-card" style={{ padding: 24 }}>
      {/* Table Top Controls & Filters */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 14,
        marginBottom: 20
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <h3 className="serif-heading" style={{ fontSize: 18, color: 'var(--ink-primary)' }}>
            Instrument Master Register
          </h3>
          <span className="mono" style={{ fontSize: 12, color: 'var(--ink-muted)' }}>
            Showing {filtered.length} of {records.length} records
          </span>
        </div>

        {/* Filter controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          {/* Status selector */}
          <select
            className="input-paper"
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setCurrentPage(1);
            }}
            style={{ width: 140, height: 36, fontSize: 12.5 }}
          >
            <option value="ALL">All Statuses</option>
            <option value="Active">Active</option>
            <option value="Expiring">Expiring</option>
            <option value="Matured">Matured</option>
            <option value="Renewed">Renewed</option>
            <option value="Release">Release / NOC</option>
            <option value="Discrepancy">Discrepancy</option>
          </select>

          {/* Region selector */}
          <select
            className="input-paper"
            value={regionFilter}
            onChange={(e) => {
              setRegionFilter(e.target.value);
              setCurrentPage(1);
            }}
            style={{ width: 140, height: 36, fontSize: 12.5 }}
          >
            <option value="ALL">All Regions</option>
            <option value="Northern">Northern</option>
            <option value="Western">Western</option>
            <option value="Southern">Southern</option>
            <option value="South-Western">South-Western</option>
            <option value="Eastern">Eastern</option>
            <option value="Central">Central</option>
            <option value="North-West">North-West</option>
          </select>

          {/* Bank selector */}
          <select
            className="input-paper"
            value={bankFilter}
            onChange={(e) => {
              setBankFilter(e.target.value);
              setCurrentPage(1);
            }}
            style={{ width: 160, height: 36, fontSize: 12.5 }}
          >
            <option value="ALL">All Banks</option>
            {uniqueBanks.map(b => (
              <option key={b} value={b}>{b}</option>
            ))}
          </select>

          {/* Sort selector */}
          <select
            className="input-paper"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            style={{ width: 160, height: 36, fontSize: 12.5 }}
          >
            <option value="amount_desc">Amount (Highest)</option>
            <option value="amount_asc">Amount (Lowest)</option>
            <option value="maturity_asc">Maturity Date (Earliest)</option>
            <option value="ocr_desc">OCR Match %</option>
          </select>

          {/* Export to CSV Button */}
          <button
            type="button"
            onClick={() => {
              const headers = [
                'FDR Number', 'Institution ID', 'Institution Name', 'Trust Name',
                'Region', 'City', 'State', 'Program Type', 'Amount (INR)',
                'Issuing Bank', 'Issue Date', 'Maturity Date', 'Tenor (Years)',
                'Days Remaining', 'Joint Holder', 'Lien Marked', 'Bank Confirmed',
                'OCR Match %', 'Status'
              ];
              const rows = sorted.map(r => [
                `"${r.fdrNumber || ''}"`,
                `"${r.institutionId || ''}"`,
                `"${(r.institutionName || '').replace(/"/g, '""')}"`,
                `"${(r.trustName || '').replace(/"/g, '""')}"`,
                `"${r.region || ''}"`,
                `"${r.city || ''}"`,
                `"${r.state || ''}"`,
                `"${(r.programType || '').replace(/"/g, '""')}"`,
                r.amount || 0,
                `"${(r.issuingBank || '').replace(/"/g, '""')}"`,
                `"${r.issueDate || ''}"`,
                `"${r.maturityDate || ''}"`,
                r.tenorYears || 0,
                r.daysRemaining || 0,
                `"${(r.jointHolderName || '').replace(/"/g, '""')}"`,
                r.lienMarked ? 'YES' : 'NO',
                r.bankConfirmed ? 'YES' : 'NO',
                r.ocrMatchPct || 0,
                `"${r.status || ''}"`
              ]);
              const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
              const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
              const url = URL.createObjectURL(blob);
              const link = document.createElement('a');
              link.setAttribute('href', url);
              link.setAttribute('download', `kosh_drishti_master_register_${new Date().toISOString().slice(0, 10)}.csv`);
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
            }}
            className="btn btn-secondary btn-sm"
            style={{ display: 'flex', alignItems: 'center', gap: 6, height: 36, padding: '0 12px' }}
            title="Export filtered records to regulatory CSV"
          >
            <Download size={13} />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Main Table Structure */}
      <div style={{ overflowX: 'auto', border: '1px solid var(--border-medium)', borderRadius: 'var(--radius-sm)' }}>
        <table className="paper-table">
          <thead>
            <tr>
              <th style={{ width: 180 }}>Instrument & Trust Stamp</th>
              <th>Technical Institution</th>
              <th style={{ width: 140 }}>Deposit Amount</th>
              <th style={{ width: 130 }}>Validity Ramp</th>
              <th style={{ width: 110 }}>OCR Match %</th>
              <th style={{ width: 130 }}>Status</th>
              <th style={{ width: 150, textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginated.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', padding: '36px', color: 'var(--ink-muted)' }}>
                  No records match the active filter criteria.
                </td>
              </tr>
            ) : (
              paginated.map(item => (
                <tr
                  key={item.id}
                  onClick={() => onSelectInstrument(item)}
                  style={{ cursor: 'pointer' }}
                  title="Click to open 360° timeline drawer"
                >
                  {/* Instrument & Trust Stamp */}
                  <td>
                    <div className="mono" style={{ fontWeight: 700, color: 'var(--ink-primary)', fontSize: 14 }}>
                      {item.fdrNumber}
                    </div>
                    <div style={{ marginTop: 4 }}>
                      <TrustStamp level={item.trustLevel || 'officer'} size="sm" />
                    </div>
                    <div style={{ fontSize: 11.5, color: 'var(--ink-muted)', marginTop: 3 }}>
                      {item.issuingBank}
                    </div>
                  </td>

                  {/* Institution */}
                  <td>
                    <div style={{ fontWeight: 600, color: 'var(--ink-primary)', lineHeight: 1.3, fontSize: 14.5 }}>
                      {item.institutionName}
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--ink-secondary)', marginTop: 2 }}>
                      {item.city}, {item.state} • <span className="mono">{item.institutionId}</span>
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--ink-muted)', marginTop: 2 }}>
                      {item.programType}
                    </div>
                  </td>

                  {/* Amount */}
                  <td>
                    {item.isGovernmentExempt ? (
                      <div>
                        <span className="mono" style={{ fontWeight: 700, color: 'var(--ramp-jade-text)', fontSize: 14.5 }}>
                          ₹ 0
                        </span>
                        <div style={{ fontSize: 11, color: 'var(--ink-muted)' }}>Govt exempt</div>
                      </div>
                    ) : (
                      <div>
                        <span className="mono" style={{ fontWeight: 700, color: 'var(--ink-primary)', fontSize: 14.5 }}>
                          ₹ {(item.amount / 100000).toFixed(1)} Lakhs
                        </span>
                        <div style={{ fontSize: 11, color: 'var(--ink-muted)' }}>
                          ₹ {item.amount.toLocaleString('en-IN')}
                        </div>
                      </div>
                    )}
                  </td>

                  {/* Validity Ramp */}
                  <td>
                    <ExpiryChip days={item.daysRemaining} />
                    <div className="mono" style={{ fontSize: 11, color: 'var(--ink-muted)', marginTop: 4 }}>
                      {item.maturityDate}
                    </div>
                  </td>

                  {/* OCR Match % */}
                  <td>
                    <div className="mono" style={{ fontWeight: 700, fontSize: 14, color: 'var(--ink-primary)' }} title="Automated text extraction accuracy between uploaded document and bank record">
                      {item.ocrMatchPct || 98.4}%
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--ink-muted)' }}>
                      Tesseract/Paddle
                    </div>
                  </td>

                  {/* Status */}
                  <td>
                    <div style={{ fontSize: 11, fontWeight: 600 }}>
                      {item.status === 'Active' && <span className="badge-clean badge-active">Active</span>}
                      {item.status === 'Expiring' && <span className="badge-clean badge-warning">Expiring &lt;60d</span>}
                      {item.status === 'Matured' && <span className="badge-clean badge-released">Matured</span>}
                      {item.status === 'Renewed' && <span className="badge-clean badge-release">Renewed</span>}
                      {item.status === 'Release' && <span className="badge-clean badge-release">Release NOC</span>}
                      {item.status === 'Discrepancy' && <span className="badge-clean badge-flagged">Discrepancy</span>}
                      {item.status === 'Pending' && <span className="badge-clean" style={{ background: '#f3f4f6' }}>Pending</span>}
                    </div>
                    <div style={{ fontSize: 9.5, color: 'var(--ink-muted)', marginTop: 2 }}>
                      {item.legacyStatus}
                    </div>
                  </td>

                  {/* Actions */}
                  <td style={{ textAlign: 'right' }} onClick={(e) => e.stopPropagation()}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 6 }}>
                      {item.hasDiscrepancies && (
                        <button
                          onClick={() => onOpenCompareSources(item)}
                          className="btn btn-sm"
                          style={{
                            background: '#fef2f2',
                            border: '1px solid #fca5a5',
                            color: '#b91c1c',
                            fontWeight: 700
                          }}
                          title="Open side-by-side comparison between institution claim and bank CBS"
                        >
                          <span>Compare</span>
                        </button>
                      )}

                      {item.status === 'Release' && (
                        <button
                          onClick={() => onOpenTwoOfficerApproval(item)}
                          className="btn btn-sm"
                          style={{
                            background: '#eff6ff',
                            border: '1px solid #93c5fd',
                            color: '#1d4ed8',
                            fontWeight: 700
                          }}
                          title="Review two-officer condition checklist and generate AICTE discharge letter"
                        >
                          <span>Two-officer</span>
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectInstrument(item);
                        }}
                        className="btn btn-paper btn-sm"
                        style={{ border: '1.5px solid var(--ink-primary)', fontWeight: 700, color: 'var(--ink-primary)' }}
                        title="Open 360° lifecycle timeline drawer"
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

      {/* Pagination Bar */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginTop: 14,
        paddingTop: 10,
        borderTop: '1px solid var(--border-subtle)',
        fontSize: 12
      }}>
        <div style={{ color: 'var(--ink-muted)' }}>
          Page {currentPage} of {totalPages} ({filtered.length} total technical institutions)
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <button
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="btn btn-paper btn-sm"
            style={{ opacity: currentPage === 1 ? 0.5 : 1 }}
          >
            <ChevronLeft size={13} />
            <span>Previous</span>
          </button>

          <span className="mono" style={{ fontWeight: 600 }}>{currentPage} / {totalPages}</span>

          <button
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="btn btn-paper btn-sm"
            style={{ opacity: currentPage === totalPages ? 0.5 : 1 }}
          >
            <span>Next</span>
            <ChevronRight size={13} />
          </button>
        </div>
      </div>
    </div>
  );
}

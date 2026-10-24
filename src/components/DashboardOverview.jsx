import React from 'react';
import { 
  ShieldAlert, 
  Clock, 
  CheckCircle, 
  IndianRupee, 
  FileCheck2, 
  Layers, 
  Building, 
  ArrowUpRight, 
  Zap, 
  Download, 
  Eye, 
  FileText,
  AlertOctagon,
  TrendingUp,
  RefreshCw
} from 'lucide-react';

export default function DashboardOverview({ 
  records, 
  onSelectFDR, 
  onRunBatchTriangulation, 
  onInspectDiscrepancy, 
  onOpenReleaseWorkflow,
  activeFilter,
  setActiveFilter
}) {
  // Compute real-time aggregations
  const totalAmount = records.reduce((acc, curr) => acc + (curr.amount || 0), 0);
  const totalCrores = (totalAmount / 10000000).toFixed(2);

  const discrepancyCount = records.filter(r => r.hasDiscrepancies || r.status === "Discrepancy Flagged").length;
  const expiringSoonCount = records.filter(r => r.status === "Expiring Soon" || (r.daysRemaining > 0 && r.daysRemaining <= 60)).length;
  const releasePendingCount = records.filter(r => r.status === "Release Requested").length;
  const verifiedCount = records.filter(r => r.status === "Verified & Active").length;

  // Formatting helpers
  const formatCurrency = (amt) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amt);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Top Hero Banner & Quick Actions */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 16
      }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>
            Regulatory FDR & Security Deposit Intelligence
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>
            Continuous automated reconciliation against Core Banking Systems, lien registry, and AICTE Approval Process Handbook (APH) norms.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <button
            onClick={onRunBatchTriangulation}
            className="btn btn-cyan"
            title="Scan all FDR records against connected Bank CBS/SFMS endpoints"
          >
            <Zap size={15} />
            <span>Run CBS Cross-Check</span>
          </button>

          <button
            onClick={() => {
              const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(records, null, 2));
              const downloadAnchor = document.createElement('a');
              downloadAnchor.setAttribute("href", dataStr);
              downloadAnchor.setAttribute("download", `AICTE_FDR_Regulatory_Dossier_${new Date().toISOString().slice(0, 10)}.json`);
              document.body.appendChild(downloadAnchor);
              downloadAnchor.click();
              downloadAnchor.remove();
            }}
            className="btn btn-secondary"
          >
            <Download size={15} />
            <span>Export Regulatory Dossier</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))',
        gap: 16
      }}>
        {/* KPI 1: Total Collateral Held */}
        <div className="kpi-card">
          <div className="kpi-accent-glow" style={{ background: 'var(--gold-500)' }} />
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Guaranteed Collateral
            </span>
            <div style={{
              width: 32,
              height: 32,
              borderRadius: 'var(--radius-sm)',
              background: 'rgba(245, 158, 11, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--gold-400)'
            }}>
              <IndianRupee size={17} />
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
            <span className="mono" style={{ fontSize: 26, fontWeight: 700, color: 'var(--text-primary)' }}>
              ₹ {totalCrores}
            </span>
            <span style={{ fontSize: 13, color: 'var(--gold-400)', fontWeight: 600 }}>Crores</span>
          </div>
          <div style={{ fontSize: 11, color: 'var(--text-dim)', marginTop: 6, display: 'flex', alignItems: 'center', gap: 5 }}>
            <TrendingUp size={12} color="var(--status-verified)" />
            <span>Across 7 tracked technical institutes</span>
          </div>
        </div>

        {/* KPI 2: Active & Verified */}
        <div className="kpi-card">
          <div className="kpi-accent-glow" style={{ background: 'var(--status-verified)' }} />
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Active & Endorsed
            </span>
            <div style={{
              width: 32,
              height: 32,
              borderRadius: 'var(--radius-sm)',
              background: 'var(--status-verified-bg)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--status-verified)'
            }}>
              <CheckCircle size={17} />
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
            <span className="mono" style={{ fontSize: 26, fontWeight: 700, color: 'var(--text-primary)' }}>
              {verifiedCount}
            </span>
            <span style={{ fontSize: 12, color: 'var(--status-verified)', fontWeight: 600 }}>Instruments (100% Lien)</span>
          </div>
          <div style={{ fontSize: 11, color: 'var(--text-dim)', marginTop: 6 }}>
            Dual-holder Member Secretary confirmed
          </div>
        </div>

        {/* KPI 3: Discrepancies Caught */}
        <div 
          className="kpi-card" 
          style={{ cursor: 'pointer', border: discrepancyCount > 0 ? '1px solid rgba(251, 113, 133, 0.3)' : undefined }}
          onClick={() => setActiveFilter('discrepancy')}
        >
          <div className="kpi-accent-glow" style={{ background: 'var(--status-flagged)' }} />
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Discrepancies Flagged
            </span>
            <div style={{
              width: 32,
              height: 32,
              borderRadius: 'var(--radius-sm)',
              background: 'var(--status-flagged-bg)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--status-flagged)'
            }}>
              <ShieldAlert size={17} />
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
            <span className="mono" style={{ fontSize: 26, fontWeight: 700, color: 'var(--status-flagged)' }}>
              {discrepancyCount}
            </span>
            <span className="badge badge-flagged" style={{ fontSize: 10 }}>Urgent Action</span>
          </div>
          <div style={{ fontSize: 11, color: 'var(--status-flagged)', marginTop: 6 }}>
            Missing AICTE lien / tenor violation
          </div>
        </div>

        {/* KPI 4: Expiring in < 60 Days */}
        <div 
          className="kpi-card"
          style={{ cursor: 'pointer' }}
          onClick={() => setActiveFilter('expiring')}
        >
          <div className="kpi-accent-glow" style={{ background: 'var(--status-warning)' }} />
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Maturity Window (&lt;60d)
            </span>
            <div style={{
              width: 32,
              height: 32,
              borderRadius: 'var(--radius-sm)',
              background: 'var(--status-warning-bg)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--status-warning)'
            }}>
              <Clock size={17} />
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
            <span className="mono" style={{ fontSize: 26, fontWeight: 700, color: 'var(--text-primary)' }}>
              {expiringSoonCount}
            </span>
            <span className="badge badge-warning" style={{ fontSize: 10 }}>27 Days Left</span>
          </div>
          <div style={{ fontSize: 11, color: 'var(--text-dim)', marginTop: 6 }}>
            Auto-escalation notice triggered
          </div>
        </div>

        {/* KPI 5: Release Workflow */}
        <div 
          className="kpi-card"
          style={{ cursor: 'pointer' }}
          onClick={() => setActiveFilter('release')}
        >
          <div className="kpi-accent-glow" style={{ background: 'var(--iris-500)' }} />
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Release Pipeline (4-Eye)
            </span>
            <div style={{
              width: 32,
              height: 32,
              borderRadius: 'var(--radius-sm)',
              background: 'var(--iris-glow)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--iris-400)'
            }}>
              <FileCheck2 size={17} />
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
            <span className="mono" style={{ fontSize: 26, fontWeight: 700, color: 'var(--text-primary)' }}>
              {releasePendingCount}
            </span>
            <span className="badge badge-cyan" style={{ fontSize: 10 }}>Stage 2 Cleared</span>
          </div>
          <div style={{ fontSize: 11, color: 'var(--text-dim)', marginTop: 6 }}>
            Vidyavardhaka (10-Yr Term Met)
          </div>
        </div>
      </div>

      {/* Filter Chips Bar */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 12,
        padding: '12px 18px',
        background: 'rgba(255, 255, 255, 0.02)',
        borderRadius: 'var(--radius-md)',
        border: '1px solid var(--border-subtle)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', marginRight: 4 }}>
            Filter Instruments:
          </span>
          {[
            { id: 'all', label: `All Deposits (${records.length})` },
            { id: 'verified', label: `Active & Clean (${verifiedCount})` },
            { id: 'discrepancy', label: `Discrepancy Alerts (${discrepancyCount})` },
            { id: 'expiring', label: `Expiring Soon (${expiringSoonCount})` },
            { id: 'release', label: `Release Petitions (${releasePendingCount})` }
          ].map(f => (
            <button
              key={f.id}
              onClick={() => setActiveFilter(f.id)}
              style={{
                padding: '6px 12px',
                borderRadius: 'var(--radius-full)',
                fontSize: 12,
                fontWeight: activeFilter === f.id ? 600 : 500,
                border: activeFilter === f.id ? '1px solid var(--border-gold)' : '1px solid var(--border-subtle)',
                background: activeFilter === f.id ? 'var(--gold-glow)' : 'rgba(255, 255, 255, 0.03)',
                color: activeFilter === f.id ? 'var(--gold-400)' : 'var(--text-muted)',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              {f.label}
            </button>
          ))}
        </div>

        <div style={{ fontSize: 12, color: 'var(--text-dim)' }}>
          Showing filtered instruments ready for regulatory scrutiny
        </div>
      </div>

      {/* Critical Attention Box (If discrepancies or exipiries exist) */}
      {discrepancyCount > 0 && (
        <div style={{
          background: 'linear-gradient(135deg, rgba(251, 113, 133, 0.08) 0%, rgba(20, 27, 39, 0.95) 100%)',
          border: '1px solid rgba(251, 113, 133, 0.3)',
          borderRadius: 'var(--radius-lg)',
          padding: '18px 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 16
        }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
            <div style={{
              width: 38,
              height: 38,
              borderRadius: 'var(--radius-md)',
              background: 'var(--status-flagged-bg)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--status-flagged)',
              flexShrink: 0
            }}>
              <AlertOctagon size={20} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                <span style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: 14 }}>
                  Critical Discrepancy Triangulation Alert: FDR/PNB/661039811
                </span>
                <span className="badge badge-flagged">Lien Not Registered</span>
              </div>
              <p style={{ color: 'var(--text-secondary)', fontSize: 12, maxWidth: 750 }}>
                <strong>Aryabhatta Institute of Applied Computing:</strong> The institution claimed an 8-year deposit with joint lien to AICTE, but the direct Punjab National Bank CBS API reports a 5-year deposit with <em>no joint lien endorsed</em>. AICTE Approval Process Handbook (APH) regulations violated.
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              const flaggedRecord = records.find(r => r.hasDiscrepancies);
              if (flaggedRecord) onInspectDiscrepancy(flaggedRecord);
            }}
            className="btn btn-primary-gold btn-sm"
          >
            <ShieldAlert size={14} />
            <span>Open Triangulation Inspector</span>
          </button>
        </div>
      )}
    </div>
  );
}

import React from 'react';
import { 
  CheckCircle2, 
  Clock, 
  RotateCcw, 
  ShieldCheck, 
  FileClock, 
  ShieldAlert, 
  IndianRupee,
  Layers,
  Sparkles,
  TrendingUp,
  FileCheck2
} from 'lucide-react';

export default function KPIRowExactPS({ records, activeStatusFilter, onSelectStatusFilter }) {
  // Aggregate exact counts matching Problem Statement 26265
  const activeCount = records.filter(r => r.status === 'Active').length;
  const expiringCount = records.filter(r => r.status === 'Expiring' || (r.daysRemaining > 0 && r.daysRemaining <= 60)).length;
  const maturedCount = records.filter(r => r.status === 'Matured' || (r.daysRemaining <= 0 && r.status !== 'Released')).length;
  const renewedCount = records.filter(r => r.status === 'Renewed').length;
  const releasedCount = records.filter(r => r.status === 'Release' || r.status === 'Released').length;
  const pendingCount = records.filter(r => r.status === 'Pending').length;
  const discrepancyCount = records.filter(r => r.status === 'Discrepancy' || r.hasDiscrepancies).length;

  const totalAmount = records.reduce((sum, r) => sum + (r.amount || 0), 0);
  const totalCrores = (totalAmount / 10000000).toFixed(2);

  const kpis = [
    {
      id: 'Active',
      label: 'Active',
      count: activeCount,
      icon: CheckCircle2,
      accentGrad: 'linear-gradient(90deg, #10b981 0%, #059669 100%)',
      iconBg: '#d1fae5',
      iconColor: '#059669',
      cardBg: 'linear-gradient(180deg, #ffffff 0%, #f0fdf4 100%)',
      borderColor: '#a7f3d0',
      desc: 'Lien confirmed & running'
    },
    {
      id: 'Expiring',
      label: 'Expiring',
      count: expiringCount,
      icon: Clock,
      accentGrad: 'linear-gradient(90deg, #f59e0b 0%, #d97706 100%)',
      iconBg: '#fef3c7',
      iconColor: '#d97706',
      cardBg: 'linear-gradient(180deg, #ffffff 0%, #fffbeb 100%)',
      borderColor: '#fde68a',
      desc: '<60 days to maturity'
    },
    {
      id: 'Matured',
      label: 'Matured',
      count: maturedCount,
      icon: FileClock,
      accentGrad: 'linear-gradient(90deg, #64748b 0%, #475569 100%)',
      iconBg: '#e2e8f0',
      iconColor: '#334155',
      cardBg: 'linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)',
      borderColor: '#cbd5e1',
      desc: 'Lock-in completed'
    },
    {
      id: 'Renewed',
      label: 'Renewed',
      count: renewedCount,
      icon: RotateCcw,
      accentGrad: 'linear-gradient(90deg, #3b82f6 0%, #2563eb 100%)',
      iconBg: '#dbeafe',
      iconColor: '#2563eb',
      cardBg: 'linear-gradient(180deg, #ffffff 0%, #eff6ff 100%)',
      borderColor: '#bfdbfe',
      desc: 'Successor FDR linked'
    },
    {
      id: 'Release',
      label: 'Released / NOC',
      count: releasedCount,
      icon: FileCheck2,
      accentGrad: 'linear-gradient(90deg, #8b5cf6 0%, #7c3aed 100%)',
      iconBg: '#f3e8ff',
      iconColor: '#7c3aed',
      cardBg: 'linear-gradient(180deg, #ffffff 0%, #faf5ff 100%)',
      borderColor: '#e9d5ff',
      desc: 'NOC issued to Bank'
    },
    {
      id: 'Pending',
      label: 'Pending',
      count: pendingCount,
      icon: Layers,
      accentGrad: 'linear-gradient(90deg, #f97316 0%, #ea580c 100%)',
      iconBg: '#ffedd5',
      iconColor: '#ea580c',
      cardBg: 'linear-gradient(180deg, #ffffff 0%, #fff7ed 100%)',
      borderColor: '#fed7aa',
      desc: 'Deposit requested / review'
    },
    {
      id: 'Discrepancy',
      label: 'Discrepancy',
      count: discrepancyCount,
      icon: ShieldAlert,
      accentGrad: 'linear-gradient(90deg, #f43f5e 0%, #e11d48 100%)',
      iconBg: '#ffe4e6',
      iconColor: '#e11d48',
      cardBg: 'linear-gradient(180deg, #ffffff 0%, #fff1f2 100%)',
      borderColor: '#fecdd3',
      desc: 'Action required'
    }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Top Banner with Total Collateral */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 14,
        padding: '16px 24px',
        background: 'linear-gradient(90deg, #ffffff 0%, #fdfbf7 100%)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-md)',
        boxShadow: 'var(--shadow-sm)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{
            width: 44,
            height: 44,
            borderRadius: 'var(--radius-sm)',
            background: 'linear-gradient(135deg, #fef3c7 0%, #fed7aa 100%)',
            border: '1px solid var(--color-amber-border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--color-amber-600)',
            boxShadow: '0 2px 6px rgba(245, 158, 11, 0.12)'
          }}>
            <IndianRupee size={22} />
          </div>
          <div>
            <span className="serif-heading" style={{ fontSize: 19, fontWeight: 700, color: 'var(--ink-primary)' }}>
              Instrument Lifecycle Overview
            </span>
            <div style={{ fontSize: 13, color: 'var(--ink-muted)', marginTop: 2 }}>
              Tracking {records.length} technical institutions across India (APH 2024-27 Table 1.4)
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 11.5, color: 'var(--ink-muted)', textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.04em' }}>
              Total Guaranteed Collateral
            </div>
            <div className="mono" style={{ fontWeight: 800, fontSize: 22, color: 'var(--ink-primary)', marginTop: 2 }}>
              ₹ {totalCrores} <span style={{ fontSize: 14, color: 'var(--color-amber-600)', fontWeight: 600 }}>Crores</span>
            </div>
          </div>
        </div>
      </div>

      {/* Colorful 7 KPI Tiles - Fixed Single Row with Roomy, Uncompacted Dimensions */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(7, minmax(0, 1fr))',
        gap: 14,
        width: '100%'
      }}>
        {kpis.map(tile => {
          const isSelected = activeStatusFilter === tile.id;
          const Icon = tile.icon;

          return (
            <button
              key={tile.id}
              onClick={() => onSelectStatusFilter(isSelected ? 'ALL' : tile.id)}
              style={{
                background: isSelected ? 'var(--bg-muted)' : tile.cardBg,
                border: isSelected ? '2px solid var(--ink-primary)' : `1px solid ${tile.borderColor}`,
                borderRadius: 'var(--radius-md)',
                padding: '18px 18px',
                textAlign: 'left',
                cursor: 'pointer',
                transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                display: 'flex',
                flexDirection: 'column',
                gap: 10,
                minHeight: 136,
                position: 'relative',
                overflow: 'hidden',
                boxShadow: isSelected ? '0 4px 14px rgba(0,0,0,0.1)' : 'var(--shadow-sm)'
              }}
              onMouseEnter={(e) => {
                if (!isSelected) {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = 'var(--shadow-hover)';
                }
              }}
              onMouseLeave={(e) => {
                if (!isSelected) {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
                }
              }}
            >
              {/* Top Accent Gradient Line */}
              <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: 4,
                background: tile.accentGrad
              }} />

              {/* Title & Icon */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', gap: 6 }}>
                <span style={{
                  fontSize: 12.5,
                  fontWeight: 700,
                  color: tile.iconColor,
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis'
                }} title={tile.label}>
                  {tile.label}
                </span>

                <div style={{
                  width: 32,
                  height: 32,
                  borderRadius: '50%',
                  background: tile.iconBg,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: tile.iconColor,
                  flexShrink: 0
                }}>
                  <Icon size={17} />
                </div>
              </div>

              {/* Number Count */}
              <div className="mono" style={{ fontSize: 32, fontWeight: 800, color: 'var(--ink-primary)', lineHeight: 1, margin: '2px 0' }}>
                {tile.count}
              </div>

              {/* Description */}
              <div style={{
                fontSize: 12,
                color: 'var(--ink-secondary)',
                lineHeight: 1.35,
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis'
              }} title={tile.desc}>
                {tile.desc}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

import React from 'react';
import { Calendar, MapPin, IndianRupee, ArrowRight, TrendingUp, Sparkles } from 'lucide-react';
import { ExpiryChip } from './SignatureVisuals';

export default function HeroRunwayAndMap({ 
  records, 
  selectedRegion, 
  setSelectedRegion, 
  onSelectMonthFilter, 
  activeMonthFilter 
}) {
  // 12-Month Runway Distribution (Nov 2026 - Oct 2027)
  const months = [
    { key: "2026-11", label: "Nov '26", quarter: "Q3", color: "#f59e0b", bg: "#fffbeb", border: "#fde68a" },
    { key: "2026-12", label: "Dec '26", quarter: "Q3", color: "#f59e0b", bg: "#fffbeb", border: "#fde68a" },
    { key: "2027-01", label: "Jan '27", quarter: "Q4", color: "#0ea5e9", bg: "#f0f9ff", border: "#bae6fd" },
    { key: "2027-02", label: "Feb '27", quarter: "Q4", color: "#0ea5e9", bg: "#f0f9ff", border: "#bae6fd" },
    { key: "2027-03", label: "Mar '27", quarter: "Q4", color: "#0ea5e9", bg: "#f0f9ff", border: "#bae6fd" },
    { key: "2027-04", label: "Apr '27", quarter: "Q1", color: "#10b981", bg: "#ecfdf5", border: "#a7f3d0" },
    { key: "2027-05", label: "May '27", quarter: "Q1", color: "#10b981", bg: "#ecfdf5", border: "#a7f3d0" },
    { key: "2027-06", label: "Jun '27", quarter: "Q1", color: "#10b981", bg: "#ecfdf5", border: "#a7f3d0" },
    { key: "2027-07", label: "Jul '27", quarter: "Q2", color: "#8b5cf6", bg: "#f5f3ff", border: "#ddd6fe" },
    { key: "2027-08", label: "Aug '27", quarter: "Q2", color: "#8b5cf6", bg: "#f5f3ff", border: "#ddd6fe" },
    { key: "2027-09", label: "Sep '27", quarter: "Q2", color: "#8b5cf6", bg: "#f5f3ff", border: "#ddd6fe" },
    { key: "2027-10", label: "Oct '27", quarter: "Q3", color: "#f59e0b", bg: "#fffbeb", border: "#fde68a" }
  ];

  // Map records into month buckets based on maturityDate
  const runwayData = months.map(m => {
    const matching = records.filter(r => r.maturityDate && r.maturityDate.startsWith(m.key));
    const totalAmt = matching.reduce((sum, r) => sum + (r.amount || 0), 0);
    return {
      ...m,
      count: matching.length,
      amountLakhs: (totalAmt / 100000).toFixed(1),
      records: matching
    };
  });

  // Regional breakdown with distinct vibrant colors
  const regions = [
    { name: "Northern", states: "UP, Delhi, Haryana, Bihar", count: records.filter(r => r.region === "Northern").length, color: "#d97706", bg: "#fef3c7", border: "#fde68a" },
    { name: "Western", states: "Maharashtra, Goa", count: records.filter(r => r.region === "Western").length, color: "#7c3aed", bg: "#f3e8ff", border: "#e9d5ff" },
    { name: "Southern", states: "Tamil Nadu, Kerala, AP", count: records.filter(r => r.region === "Southern").length, color: "#0284c7", bg: "#e0f2fe", border: "#bae6fd" },
    { name: "South-Western", states: "Karnataka, Telangana", count: records.filter(r => r.region === "South-Western").length, color: "#0d9488", bg: "#ccfbf1", border: "#99f6e4" },
    { name: "Eastern", states: "Odisha, WB, Assam, Jharkhand", count: records.filter(r => r.region === "Eastern").length, color: "#e11d48", bg: "#ffe4e6", border: "#fecdd3" },
    { name: "Central", states: "Gujarat, MP, Chhattisgarh", count: records.filter(r => r.region === "Central").length, color: "#ea580c", bg: "#ffedd5", border: "#fed7aa" },
    { name: "North-West", states: "Punjab, Rajasthan, HP", count: records.filter(r => r.region === "North-West").length, color: "#2563eb", bg: "#dbeafe", border: "#bfdbfe" }
  ];

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))', gap: 20 }}>
      {/* Hero Tile 1: 12-Month Maturity Runway */}
      <div className="paper-card" style={{ padding: 24 }}>
        {/* Top colored accent line */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: 4,
          background: 'linear-gradient(90deg, #f59e0b 0%, #0ea5e9 33%, #10b981 66%, #8b5cf6 100%)'
        }} />

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 30,
              height: 30,
              borderRadius: 6,
              background: '#fef3c7',
              color: '#d97706',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Calendar size={17} />
            </div>
            <span style={{ fontSize: 14, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--ink-primary)' }}>
              12-Month Maturity Runway
            </span>
          </div>

          <div style={{ display: 'flex', gap: 6 }}>
            <span style={{ fontSize: 11, padding: '3px 7px', borderRadius: 4, background: '#fef3c7', color: '#d97706', fontWeight: 600 }}>Q3 Amber</span>
            <span style={{ fontSize: 11, padding: '3px 7px', borderRadius: 4, background: '#e0f2fe', color: '#0284c7', fontWeight: 600 }}>Q4 Cyan</span>
            <span style={{ fontSize: 11, padding: '3px 7px', borderRadius: 4, background: '#d1fae5', color: '#059669', fontWeight: 600 }}>Q1 Mint</span>
            <span style={{ fontSize: 11, padding: '3px 7px', borderRadius: 4, background: '#f3e8ff', color: '#7c3aed', fontWeight: 600 }}>Q2 Violet</span>
          </div>
        </div>

        <p style={{ fontSize: 13, color: 'var(--ink-secondary)', marginBottom: 16 }}>
          Impending instrument maturities by calendar month. Click any month to filter table records below:
        </p>

        {/* Runway Bars Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(6, 1fr)',
          gap: 8
        }}>
          {runwayData.map((item, idx) => {
            const isSelected = activeMonthFilter === item.key;
            const hasExpiries = item.count > 0;
            const isCriticalFirst = idx === 0 && item.count > 0;

            return (
              <button
                key={item.key}
                onClick={() => onSelectMonthFilter(isSelected ? null : item.key)}
                style={{
                  background: isSelected 
                    ? 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)' 
                    : isCriticalFirst 
                    ? 'linear-gradient(180deg, #ffffff 0%, #fef2f2 100%)' 
                    : hasExpiries 
                    ? `linear-gradient(180deg, #ffffff 0%, ${item.bg} 100%)` 
                    : '#faf9f6',
                  color: isSelected ? '#ffffff' : isCriticalFirst ? 'var(--ramp-vermilion-text)' : 'var(--ink-primary)',
                  border: isSelected 
                    ? '2px solid var(--ink-primary)' 
                    : isCriticalFirst 
                    ? '1.5px solid var(--ramp-vermilion-border)' 
                    : `1px solid ${item.border}`,
                  borderRadius: 'var(--radius-sm)',
                  padding: '11px 6px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 4,
                  cursor: 'pointer',
                  transition: 'all 0.18s ease',
                  boxShadow: isSelected ? '0 4px 12px rgba(0,0,0,0.15)' : 'none'
                }}
                onMouseEnter={(e) => {
                  if (!isSelected) {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.08)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isSelected) {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = 'none';
                  }
                }}
              >
                <span style={{ fontSize: 11, fontWeight: 700, color: isSelected ? '#ffffff' : item.color }}>
                  {item.label}
                </span>
                <span className="mono" style={{ fontSize: 16, fontWeight: 800 }}>
                  {item.count}
                </span>
                <span className="mono" style={{ fontSize: 10.5, color: isSelected ? '#cbd5e1' : 'var(--ink-muted)' }}>
                  {item.count > 0 ? `₹${item.amountLakhs}L` : '—'}
                </span>
              </button>
            );
          })}
        </div>

        {/* Footer info strip */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginTop: 14,
          fontSize: 11.5,
          color: 'var(--ink-secondary)',
          paddingTop: 10,
          borderTop: '1px solid var(--border-subtle)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--ramp-vermilion-dot)', display: 'inline-block' }} />
            <span>Critical &lt;30d window: <strong>Symbiosis PGDM (27 days left)</strong></span>
          </div>

          {activeMonthFilter && (
            <button
              onClick={() => onSelectMonthFilter(null)}
              style={{
                background: '#fef2f2',
                border: '1px solid #fecaca',
                color: '#dc2626',
                padding: '2px 8px',
                borderRadius: 4,
                cursor: 'pointer',
                fontWeight: 600,
                fontSize: 11
              }}
            >
              Clear month filter ✕
            </button>
          )}
        </div>
      </div>

      {/* Hero Tile 2: Regional Office Distribution */}
      <div className="paper-card" style={{ padding: 24 }}>
        {/* Top colored accent line */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: 4,
          background: 'linear-gradient(90deg, #d97706 0%, #7c3aed 20%, #0284c7 40%, #0d9488 60%, #e11d48 80%, #ea580c 100%)'
        }} />

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 30,
              height: 30,
              borderRadius: 6,
              background: '#e0f2fe',
              color: '#0284c7',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <MapPin size={17} />
            </div>
            <span style={{ fontSize: 14, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--ink-primary)' }}>
              Regional Office Distribution
            </span>
          </div>

          <span className="mono" style={{ fontSize: 12, color: 'var(--ink-muted)' }}>
            7 AICTE Bureaus
          </span>
        </div>

        <p style={{ fontSize: 13, color: 'var(--ink-secondary)', marginBottom: 16 }}>
          Active deposits across India (data.gov.in scale). Click any region to filter:
        </p>

        {/* Region List with Colorful Badges */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {regions.map(r => {
            const isSelected = selectedRegion === r.name;
            return (
              <div
                key={r.name}
                onClick={() => setSelectedRegion(isSelected ? 'ALL' : r.name)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '9px 14px',
                  borderRadius: 'var(--radius-sm)',
                  background: isSelected ? r.bg : '#ffffff',
                  border: isSelected ? `2px solid ${r.color}` : `1px solid ${r.border}`,
                  cursor: 'pointer',
                  transition: 'all 0.16s ease'
                }}
                onMouseEnter={(e) => {
                  if (!isSelected) {
                    e.currentTarget.style.background = r.bg;
                    e.currentTarget.style.borderColor = r.color;
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isSelected) {
                    e.currentTarget.style.background = '#ffffff';
                    e.currentTarget.style.borderColor = r.border;
                  }
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{
                    width: 9,
                    height: 9,
                    borderRadius: '50%',
                    background: r.color,
                    flexShrink: 0
                  }} />
                  <span style={{ fontSize: 13, fontWeight: isSelected ? 700 : 600, color: 'var(--ink-primary)' }}>
                    {r.name} Bureau
                  </span>
                  <span style={{ fontSize: 11.5, color: 'var(--ink-muted)' }}>
                    ({r.states})
                  </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span className="mono" style={{ fontSize: 13, fontWeight: 700, color: r.color }}>
                    {r.count} deposits
                  </span>
                  {isSelected && <span style={{ fontSize: 11, color: r.color, fontWeight: 700 }}>✓ Filtered</span>}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

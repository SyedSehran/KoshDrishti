import React from 'react';
import { Shield, Landmark, Building2, CheckCircle2, Search, Link2, KeyRound, Sparkles, AlertTriangle } from 'lucide-react';

export default function Header({ currentRole, setCurrentRole, onOpenLedger, onOpenDemoGuide, searchQuery, setSearchQuery }) {
  const roles = [
    { id: 'bureau_officer', name: 'Bureau Scrutiny Officer', icon: Shield, badge: 'AICTE HQ' },
    { id: 'director', name: 'Regional Director Desk', icon: Landmark, badge: 'Sanction Auth' },
    { id: 'institution', name: 'Institute Nodal Officer', icon: Building2, badge: 'College Desk' },
    { id: 'bank_validator', name: 'Bank Branch Validator', icon: KeyRound, badge: 'CBS Gateway' }
  ];

  return (
    <header style={{
      background: 'rgba(12, 16, 24, 0.88)',
      backdropFilter: 'blur(16px)',
      borderBottom: '1px solid var(--border-medium)',
      position: 'sticky',
      top: 0,
      zIndex: 100,
      padding: '12px 28px'
    }}>
      <div style={{
        maxWidth: 1440,
        margin: '0 auto',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 20
      }}>
        {/* Left: Branding & Emblem */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          {/* Sovereign Crest Icon */}
          <div style={{
            width: 44,
            height: 44,
            borderRadius: 'var(--radius-md)',
            background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.2) 0%, rgba(217, 119, 6, 0.05) 100%)',
            border: '1px solid var(--border-gold)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--gold-400)',
            boxShadow: '0 0 16px rgba(245, 158, 11, 0.15)'
          }}>
            <Landmark size={24} />
          </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{
                fontFamily: 'var(--font-heading)',
                fontSize: 18,
                fontWeight: 700,
                color: 'var(--text-primary)',
                letterSpacing: '-0.01em'
              }}>
                AICTE VISHWAS-FDR
              </span>
              <span className="badge badge-gold" style={{ fontSize: 10, padding: '2px 7px' }} title="Modelled on AICTE Approval Process Handbook Table 1.4">
                APH 2024-27 Table 1.4
              </span>
              <span className="badge badge-cyan" style={{ fontSize: 9, padding: '2px 6px' }}>
                RBI Scheduled Banks
              </span>
            </div>
            <div style={{
              fontSize: 11,
              color: 'var(--text-muted)',
              display: 'flex',
              alignItems: 'center',
              gap: 6
            }}>
              <span>Regulation Bureau</span>
              <span>•</span>
              <span>Ministry of Education, Govt of India</span>
              <span>•</span>
              <span style={{ color: 'var(--status-verified)', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                <span className="pulse-dot" style={{ backgroundColor: 'var(--status-verified)' }} />
                Python ML/OCR API (:8000) Active
              </span>
              <span>•</span>
              <span style={{ color: 'var(--cyan-400)', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                SFMS CBS Gateway Synced
              </span>
            </div>
          </div>
        </div>

        {/* Center: Search Field */}
        <div style={{ flex: 1, maxWidth: 380, position: 'relative' }}>
          <Search size={15} style={{
            position: 'absolute',
            left: 12,
            top: '50%',
            transform: 'translateY(-50%)',
            color: 'var(--text-dim)'
          }} />
          <input
            type="text"
            className="input-control"
            placeholder="Search FDR #, Institute ID, Bank, or Region..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ paddingLeft: 34, height: 38 }}
          />
        </div>

        {/* Right: Role Switcher & Cryptographic Ledger Access */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {/* Role Switcher Pill */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            background: 'rgba(255, 255, 255, 0.04)',
            padding: '3px',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-subtle)',
            gap: 2
          }}>
            {roles.map(r => {
              const Icon = r.icon;
              const isActive = currentRole === r.id;
              return (
                <button
                  key={r.id}
                  onClick={() => setCurrentRole(r.id)}
                  title={r.name}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    padding: '6px 12px',
                    borderRadius: 'var(--radius-sm)',
                    border: 'none',
                    background: isActive ? 'linear-gradient(135deg, rgba(245, 158, 11, 0.16) 0%, rgba(217, 119, 6, 0.08) 100%)' : 'transparent',
                    color: isActive ? 'var(--gold-400)' : 'var(--text-muted)',
                    cursor: 'pointer',
                    fontSize: 12,
                    fontWeight: isActive ? 600 : 500,
                    outline: 'none',
                    transition: 'all 0.18s ease',
                    boxShadow: isActive ? '0 1px 6px rgba(0,0,0,0.3)' : 'none',
                    border: isActive ? '1px solid var(--border-gold)' : '1px solid transparent'
                  }}
                >
                  <Icon size={14} />
                  <span>{r.name.split(' ')[0]}</span>
                </button>
              );
            })}
          </div>

          {/* Cryptographic Ledger Button */}
          <button
            onClick={onOpenLedger}
            className="btn btn-iris btn-sm"
            style={{ height: 36, display: 'flex', alignItems: 'center', gap: 6 }}
          >
            <Link2 size={14} />
            <span className="mono" style={{ fontSize: 11 }}>Audit Ledger</span>
          </button>

          {/* Interactive Demo Guide button */}
          <button
            onClick={onOpenDemoGuide}
            className="btn btn-primary-gold btn-sm"
            style={{ height: 36 }}
          >
            <Sparkles size={14} />
            <span>Judge Demo Tours</span>
          </button>
        </div>
      </div>
    </header>
  );
}

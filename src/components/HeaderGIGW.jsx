import React, { useState } from 'react';
import { Search, ChevronDown, User, Shield, HelpCircle, FileText, CheckCircle2, Bookmark, Award } from 'lucide-react';

export default function HeaderGIGW({
  currentRole,
  setCurrentRole,
  onOpenAuditLog,
  onOpenDemoTours,
  searchQuery,
  setSearchQuery,
  language,
  setLanguage,
  textSize,
  setTextSize
}) {
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const roles = [
    { id: 'bureau_officer', name: 'Scrutiny Officer', labelHi: 'जांच अधिकारी' },
    { id: 'director', name: 'Approving Authority (Director)', labelHi: 'अनुमोदन अधिकारी' },
    { id: 'institution', name: 'Institution Nodal Desk', labelHi: 'संस्थान पटल' },
    { id: 'bank_validator', name: 'Bank Branch Desk', labelHi: 'बैंक शाखा' }
  ];

  return (
    <header style={{ borderBottom: '1px solid var(--border-medium)', background: '#ffffff', position: 'sticky', top: 0, zIndex: 100 }}>
      {/* 1. GIGW Top Masthead */}
      <div className="gigw-masthead">
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          {/* Ashoka Emblem / Govt of India masthead */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontSize: 13, fontWeight: 700 }}>🏛️ भारत सरकार</span>
            <span>|</span>
            <span>Government of India • Ministry of Education</span>
          </div>
          <span>•</span>
          <span style={{ color: 'var(--ink-muted)' }}>
            AICTE Regulation Bureau • Last updated: 24 Oct 2026
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          {/* Text-size control (GIGW Accessibility) */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11 }}>
            <span style={{ color: 'var(--ink-muted)', marginRight: 2 }}>Text Size:</span>
            {['sm', 'md', 'lg'].map(size => (
              <button
                key={size}
                onClick={() => setTextSize(size)}
                style={{
                  background: textSize === size ? 'var(--ink-primary)' : 'transparent',
                  color: textSize === size ? '#ffffff' : 'var(--ink-secondary)',
                  border: '1px solid var(--border-medium)',
                  padding: '1px 6px',
                  borderRadius: 2,
                  cursor: 'pointer',
                  fontSize: 10,
                  fontWeight: 600
                }}
              >
                {size === 'sm' ? 'A-' : size === 'md' ? 'A' : 'A+'}
              </button>
            ))}
          </div>

          {/* Language Toggle EN / हिं */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
            <button
              onClick={() => setLanguage('en')}
              style={{
                background: language === 'en' ? 'var(--ink-primary)' : 'transparent',
                color: language === 'en' ? '#ffffff' : 'var(--ink-secondary)',
                border: '1px solid var(--border-medium)',
                padding: '2px 7px',
                borderRadius: 2,
                cursor: 'pointer',
                fontSize: 11,
                fontWeight: 600
              }}
            >
              English
            </button>
            <button
              onClick={() => setLanguage('hi')}
              style={{
                background: language === 'hi' ? 'var(--ink-primary)' : 'transparent',
                color: language === 'hi' ? '#ffffff' : 'var(--ink-secondary)',
                border: '1px solid var(--border-medium)',
                padding: '2px 7px',
                borderRadius: 2,
                cursor: 'pointer',
                fontSize: 11,
                fontWeight: 600
              }}
            >
              हिन्दी
            </button>
          </div>

          {/* Help link */}
          <a
            href="#help"
            onClick={(e) => {
              e.preventDefault();
              alert("AICTE VISHWAS-FDR Helpdesk: Regulation Bureau helpline 011-29581000 / helpdesk@aicte-india.org");
            }}
            style={{ color: 'var(--ink-secondary)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4, fontSize: 11 }}
          >
            <HelpCircle size={12} />
            <span>Help</span>
          </a>
        </div>
      </div>

      {/* Colorful Accent Ribbon under GIGW bar */}
      <div style={{
        height: 3,
        background: 'linear-gradient(90deg, #f97316 0%, #f59e0b 25%, #ffffff 48%, #0ea5e9 52%, #10b981 75%, #059669 100%)'
      }} />

      {/* 2. Simplified Main Header Bar */}
      <div style={{
        padding: '12px 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 16
      }}>
        {/* Left: Emblem + Name */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 42,
            height: 42,
            borderRadius: 'var(--radius-sm)',
            background: 'linear-gradient(135deg, #fef3c7 0%, #fed7aa 100%)',
            border: '1px solid #fde68a',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 22,
            boxShadow: '0 2px 6px rgba(245, 158, 11, 0.15)'
          }}>
            🏛️
          </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span className="serif-heading" style={{ fontSize: 17, fontWeight: 700, color: 'var(--ink-primary)' }}>
                {language === 'hi' ? 'अखिल भारतीय तकनीकी शिक्षा परिषद' : 'All India Council for Technical Education'}
              </span>
              <span className="badge-clean badge-warning" style={{ fontSize: 10, fontWeight: 700 }}>
                APH 2024-27 Table 1.4
              </span>
              <span className="badge-clean badge-active" style={{ fontSize: 10, fontWeight: 700 }}>
                RBI Scheduled Banks
              </span>
            </div>
            <div style={{ fontSize: 11, color: 'var(--ink-muted)', display: 'flex', alignItems: 'center', gap: 6, marginTop: 1 }}>
              <span style={{ fontWeight: 600, color: 'var(--ink-secondary)' }}>
                {language === 'hi' ? 'कोषदृष्टि (KoshDrishti) • सुरक्षा जमा एवं एफडीआर प्रबंधन पोर्टल' : 'KoshDrishti (कोषदृष्टि) • Security Deposit & FDR Management Portal'}
              </span>
              <span>•</span>
              <span style={{ color: 'var(--stamp-bank-color)', fontWeight: 600, background: '#eff6ff', padding: '1px 6px', borderRadius: 4, border: '1px solid #bfdbfe' }}>
                Bank verification (simulated)
              </span>
            </div>
          </div>
        </div>

        {/* Center: Search Field */}
        <div style={{ flex: 1, maxWidth: 360, position: 'relative' }}>
          <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--ink-muted)' }} />
          <input
            type="text"
            className="input-paper"
            placeholder={language === 'hi' ? 'संस्थान, एफडीआर संख्या या बैंक खोजें...' : 'Search FDR #, Institute, Bank, or State...'}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ paddingLeft: 30, height: 34, fontSize: 12.5 }}
          />
        </div>

        {/* Right: Role Switcher & Simplified User Menu */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {/* Role selector dropdown */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12 }}>
            <span style={{ color: 'var(--ink-muted)' }}>Role:</span>
            <select
              className="input-paper"
              value={currentRole}
              onChange={(e) => setCurrentRole(e.target.value)}
              style={{ width: 170, height: 34, fontSize: 12, padding: '4px 26px 4px 8px' }}
            >
              {roles.map(r => (
                <option key={r.id} value={r.id}>
                  {language === 'hi' ? r.labelHi : r.name}
                </option>
              ))}
            </select>
          </div>

          {/* Audit log #1408 button (Renamed from Block #1408) */}
          <button
            onClick={onOpenAuditLog}
            className="btn btn-paper btn-sm"
            style={{ height: 34 }}
            title="Open cryptographically hash-chained regulatory audit ledger"
          >
            <span className="mono" style={{ fontSize: 11, fontWeight: 600 }}>Audit log #1408</span>
          </button>

          {/* User Menu Dropdown */}
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              className="btn btn-ink-primary btn-sm"
              style={{ height: 34, display: 'flex', alignItems: 'center', gap: 6 }}
            >
              <User size={13} />
              <span>Officer Menu</span>
              <ChevronDown size={11} />
            </button>

            {userMenuOpen && (
              <div
                style={{
                  position: 'absolute',
                  right: 0,
                  top: 40,
                  width: 220,
                  background: '#ffffff',
                  border: '1px solid var(--border-medium)',
                  borderRadius: 'var(--radius-sm)',
                  boxShadow: 'var(--shadow-modal)',
                  zIndex: 200,
                  padding: 6
                }}
              >
                <div style={{ padding: '8px 10px', borderBottom: '1px solid var(--border-subtle)', fontSize: 11 }}>
                  <div style={{ fontWeight: 700, color: 'var(--ink-primary)' }}>Regulation Bureau</div>
                  <div style={{ color: 'var(--ink-muted)' }}>Officer ID: AICTE-REG-042</div>
                </div>

                <button
                  onClick={() => {
                    setUserMenuOpen(false);
                    onOpenDemoTours();
                  }}
                  style={{
                    width: '100%',
                    padding: '8px 10px',
                    textAlign: 'left',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: 12,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    color: 'var(--ink-primary)'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-muted)'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'none'}
                >
                  <Award size={14} color="var(--ramp-turmeric-text)" />
                  <span>Judge Demo Scripts (3 Flows)</span>
                </button>

                <button
                  onClick={() => {
                    setUserMenuOpen(false);
                    onOpenAuditLog();
                  }}
                  style={{
                    width: '100%',
                    padding: '8px 10px',
                    textAlign: 'left',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: 12,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    color: 'var(--ink-primary)'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-muted)'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'none'}
                >
                  <FileText size={14} />
                  <span>Audit Trail Explorer</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 3. Role Switcher Tabs Bar (Instant, One-Click Multi-Desk Navigation) */}
      <div style={{
        background: 'linear-gradient(90deg, #f8f6f0 0%, #f1ece1 100%)',
        borderTop: '1px solid var(--border-subtle)',
        padding: '6px 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 12,
        overflowX: 'auto'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--ink-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', marginRight: 4 }}>
            Active Desk:
          </span>

          {[
            { id: 'bureau_officer', icon: '🏛️', name: 'Scrutiny Officer Desk', badge: 'Bureau Triage' },
            { id: 'director', icon: '⚖️', name: 'Approving Authority (Director)', badge: 'Sanctions Queue' },
            { id: 'institution', icon: '🎓', name: 'Technical Institution Desk', badge: 'College Portal' },
            { id: 'bank_validator', icon: '🏦', name: 'Bank Branch Desk', badge: 'CBS Gateway' }
          ].map(role => {
            const isActive = currentRole === role.id;
            return (
              <button
                key={role.id}
                type="button"
                onClick={() => setCurrentRole(role.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '5px 12px',
                  borderRadius: 'var(--radius-xs)',
                  background: isActive ? 'var(--ink-primary)' : '#ffffff',
                  color: isActive ? '#ffffff' : 'var(--ink-secondary)',
                  border: isActive ? '1px solid var(--ink-primary)' : '1px solid var(--border-medium)',
                  cursor: 'pointer',
                  fontSize: 11.5,
                  fontWeight: isActive ? 700 : 500,
                  boxShadow: isActive ? '0 2px 6px rgba(15, 23, 42, 0.2)' : 'none',
                  transition: 'all 0.15s ease'
                }}
              >
                <span>{role.icon}</span>
                <span>{role.name}</span>
                <span style={{
                  fontSize: 9.5,
                  padding: '1px 5px',
                  borderRadius: 3,
                  background: isActive ? 'rgba(255, 255, 255, 0.2)' : 'var(--bg-muted)',
                  color: isActive ? '#ffffff' : 'var(--ink-muted)',
                  fontWeight: 600
                }}>
                  {role.badge}
                </span>
              </button>
            );
          })}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 11, color: 'var(--ink-secondary)' }}>
          <span style={{ display: 'inline-block', width: 7, height: 7, borderRadius: '50%', background: '#10b981' }} />
          <span>Role-Based Access Control (RBAC): <strong>Active</strong></span>
        </div>
      </div>
    </header>
  );
}

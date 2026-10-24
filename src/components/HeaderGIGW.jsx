import React, { useState, useEffect } from 'react';
import { Search, ChevronDown, User, Shield, HelpCircle, FileText, CheckCircle2, Bookmark, Award, Bell, KeyRound, LogIn } from 'lucide-react';

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
  const [alertsOpen, setAlertsOpen] = useState(false);
  const [loginMenuOpen, setLoginMenuOpen] = useState(false);
  const [alerts, setAlerts] = useState([]);
  const [currentUser, setCurrentUser] = useState({
    name: "Rajesh Sharma",
    email: "officer@aicte.gov.in",
    role: "bureau_officer",
    department: "Regulation Bureau"
  });

  const ROLE_ACCOUNTS = {
    bureau_officer: { email: 'officer@aicte.gov.in', pw: 'Officer@123', name: 'Rajesh Sharma', role: 'bureau_officer' },
    director: { email: 'director@aicte.gov.in', pw: 'Director@123', name: 'Prof. Rajive Kumar', role: 'director' },
    institution: { email: 'college@kalinga.edu.in', pw: 'College@123', name: 'Dr. S. Mohanty', role: 'institution' },
    bank_validator: { email: 'validator@sbi.co.in', pw: 'Bank@123', name: 'A. K. Verma', role: 'bank_validator' }
  };

  // Login handler using backend PyJWT auth endpoint
  const handleDemoLogin = async (email, password) => {
    try {
      const res = await fetch('http://127.0.0.1:8000/api/v1/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (data.token) {
        localStorage.setItem('kosh_jwt_token', data.token);
        setCurrentUser(data.user);
        setCurrentRole(data.user.role);
        setLoginMenuOpen(false);
      }
    } catch (err) {
      console.error("Login failed:", err);
    }
  };

  // Fetch real alerts and ensure initial PyJWT token is active
  useEffect(() => {
    fetch('http://127.0.0.1:8000/api/v1/alerts')
      .then(r => r.json())
      .then(d => setAlerts(d.alerts || []))
      .catch(() => {});

    const acc = ROLE_ACCOUNTS[currentRole] || ROLE_ACCOUNTS.bureau_officer;
    handleDemoLogin(acc.email, acc.pw);
  }, []);

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

      {/* 2. Streamlined Main Header Bar */}
      <div style={{
        padding: '12px 32px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 16
      }}>
        {/* Left: Emblem + Sovereign Identity */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{
            width: 44,
            height: 44,
            borderRadius: 'var(--radius-sm)',
            background: 'linear-gradient(135deg, #fef3c7 0%, #fed7aa 100%)',
            border: '1px solid #fde68a',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 22,
            boxShadow: '0 2px 6px rgba(245, 158, 11, 0.15)',
            flexShrink: 0
          }}>
            🏛️
          </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span className="serif-heading" style={{ fontSize: 17, fontWeight: 700, color: 'var(--ink-primary)' }}>
                {language === 'hi' ? 'अखिल भारतीय तकनीकी शिक्षा परिषद' : 'All India Council for Technical Education'}
              </span>
              <span className="badge-clean badge-warning" style={{ fontSize: 10.5, fontWeight: 700, padding: '2px 7px' }}>
                APH 2024-27
              </span>
            </div>
            <div style={{ fontSize: 12, color: 'var(--ink-muted)', display: 'flex', alignItems: 'center', gap: 6, marginTop: 2 }}>
              <span style={{ fontWeight: 600, color: 'var(--ink-secondary)' }}>
                {language === 'hi' ? 'कोषदृष्टि (KoshDrishti) • सुरक्षा जमा एवं एफडीआर प्रबंधन पोर्टल' : 'KoshDrishti (कोषदृष्टि) • Security Deposit & FDR Management Portal'}
              </span>
            </div>
          </div>
        </div>

        {/* Center: Search Field */}
        <div style={{ flex: 1, maxWidth: 320, position: 'relative' }}>
          <Search size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--ink-muted)' }} />
          <input
            type="text"
            className="input-paper"
            placeholder={language === 'hi' ? 'संस्थान, एफडीआर संख्या या बैंक खोजें...' : 'Search FDR #, Institute, Bank, or State...'}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ paddingLeft: 34, height: 36, fontSize: 12.5 }}
          />
        </div>

        {/* Right: Unified Action Controls (Uniform 36px height) */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {/* Real Alerts Notification Bell */}
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setAlertsOpen(!alertsOpen)}
              className="btn btn-paper btn-sm"
              style={{ height: 36, padding: '0 10px', display: 'flex', alignItems: 'center', gap: 6 }}
              title="Statutory alerts and expiry notices from DB"
            >
              <Bell size={14} color={alerts.length > 0 ? '#b91c1c' : 'var(--ink-secondary)'} />
              {alerts.length > 0 && (
                <span style={{
                  background: '#ef4444',
                  color: '#ffffff',
                  fontSize: 10,
                  fontWeight: 700,
                  padding: '1px 5px',
                  borderRadius: 8
                }}>
                  {alerts.length}
                </span>
              )}
            </button>

            {alertsOpen && (
              <div style={{
                position: 'absolute',
                right: 0,
                top: 42,
                width: 320,
                background: '#ffffff',
                border: '1px solid var(--border-medium)',
                borderRadius: 'var(--radius-sm)',
                boxShadow: 'var(--shadow-modal)',
                zIndex: 250,
                padding: 10
              }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--ink-primary)', borderBottom: '1px solid var(--border-subtle)', paddingBottom: 6, marginBottom: 8, display: 'flex', justifyContent: 'space-between' }}>
                  <span>Statutory Expiry Alarms</span>
                  <span className="mono" style={{ fontSize: 10, color: 'var(--ink-muted)' }}>Real SQLite Alerts</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 240, overflowY: 'auto' }}>
                  {alerts.map(a => (
                    <div key={a.id} style={{
                      padding: 8,
                      background: a.daysRemaining <= 30 ? '#fef2f2' : 'var(--bg-subtle)',
                      border: `1px solid ${a.daysRemaining <= 30 ? '#fca5a5' : 'var(--border-subtle)'}`,
                      borderRadius: 4,
                      fontSize: 11
                    }}>
                      <div style={{ fontWeight: 600, color: a.daysRemaining <= 30 ? '#b91c1c' : 'var(--ink-primary)' }}>
                        {a.institutionName}
                      </div>
                      <div style={{ color: 'var(--ink-muted)', marginTop: 2 }}>{a.message}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Audit log button */}
          <button
            onClick={onOpenAuditLog}
            className="btn btn-paper btn-sm"
            style={{ height: 36, display: 'flex', alignItems: 'center', gap: 6 }}
            title="Open cryptographically hash-chained regulatory audit ledger"
          >
            <Shield size={13} color="var(--ink-secondary)" />
            <span className="mono" style={{ fontSize: 11, fontWeight: 600 }}>Audit log #1408</span>
          </button>

          {/* Interactive Demo Scripts Button */}
          <button
            onClick={onOpenDemoTours}
            className="btn btn-paper btn-sm"
            style={{ height: 36, display: 'flex', alignItems: 'center', gap: 6, color: '#d97706', borderColor: '#fde68a', background: '#fffbeb' }}
            title="Launch interactive evaluation scripts (3 flows)"
          >
            <Award size={13} color="#d97706" />
            <span style={{ fontWeight: 600 }}>Demo Scripts</span>
          </button>

          {/* PyJWT Demo Login Dropdown */}
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setLoginMenuOpen(!loginMenuOpen)}
              className="btn btn-paper btn-sm"
              style={{ height: 36, border: '1px solid #10b981', color: '#047857', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6, background: '#f0fdf4' }}
              title="Log in with real PyJWT token as any of the 4 roles"
            >
              <KeyRound size={13} />
              <span>Login</span>
              <ChevronDown size={11} />
            </button>

            {loginMenuOpen && (
              <div style={{
                position: 'absolute',
                right: 0,
                top: 42,
                width: 260,
                background: '#ffffff',
                border: '1px solid var(--border-medium)',
                borderRadius: 'var(--radius-sm)',
                boxShadow: 'var(--shadow-modal)',
                zIndex: 250,
                padding: 8
              }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--ink-muted)', textTransform: 'uppercase', padding: '4px 6px', marginBottom: 4 }}>
                  Select Authenticated Role (PyJWT)
                </div>
                {[
                  { name: 'Scrutiny Officer', email: 'officer@aicte.gov.in', pw: 'Officer@123', role: 'bureau_officer' },
                  { name: 'Approving Authority', email: 'director@aicte.gov.in', pw: 'Director@123', role: 'director' },
                  { name: 'College Nodal Desk', email: 'college@kalinga.edu.in', pw: 'College@123', role: 'institution' },
                  { name: 'Bank Branch Desk', email: 'validator@sbi.co.in', pw: 'Bank@123', role: 'bank_validator' }
                ].map(u => (
                  <button
                    key={u.role}
                    type="button"
                    onClick={() => handleDemoLogin(u.email, u.pw)}
                    style={{
                      width: '100%',
                      padding: '8px 10px',
                      textAlign: 'left',
                      background: currentUser.email === u.email ? 'var(--bg-muted)' : 'none',
                      border: 'none',
                      borderRadius: 4,
                      cursor: 'pointer',
                      fontSize: 12,
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 2,
                      color: 'var(--ink-primary)'
                    }}
                  >
                    <div style={{ fontWeight: 600 }}>{u.name}</div>
                    <div className="mono" style={{ fontSize: 10, color: 'var(--ink-muted)' }}>{u.email}</div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* User Menu Dropdown */}
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              className="btn btn-ink-primary btn-sm"
              style={{ height: 36, display: 'flex', alignItems: 'center', gap: 6 }}
            >
              <User size={13} />
              <span>{currentUser.name.split(' ')[0]}</span>
              <ChevronDown size={11} />
            </button>

            {userMenuOpen && (
              <div
                style={{
                  position: 'absolute',
                  right: 0,
                  top: 42,
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
                  <div style={{ fontWeight: 700, color: 'var(--ink-primary)' }}>{currentUser.name}</div>
                  <div style={{ color: 'var(--ink-muted)' }}>{currentUser.email}</div>
                  <div style={{ color: 'var(--color-amber-600)', fontWeight: 600, marginTop: 2 }}>
                    {currentUser.role === 'director' ? 'Director / Sanctions Authority' : currentUser.role === 'institution' ? 'College Nodal Desk' : currentUser.role === 'bank_validator' ? 'Bank Branch Validator' : 'Regulation Scrutiny Officer'}
                  </div>
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

      {/* 3. Segmented Active Desk Navigation Bar */}
      <div style={{
        background: 'linear-gradient(90deg, #f8f6f0 0%, #f1ece1 100%)',
        borderTop: '1px solid var(--border-subtle)',
        padding: '6px 32px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 16,
        overflowX: 'auto'
      }}>
        {/* Segmented Desk Selector */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(255, 255, 255, 0.7)', padding: '3px 4px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
          <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--ink-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', padding: '0 8px' }}>
            Desk:
          </span>

          {[
            { id: 'bureau_officer', icon: '🏛️', name: 'Scrutiny Officer Desk' },
            { id: 'director', icon: '⚖️', name: 'Approving Authority (Director)' },
            { id: 'institution', icon: '🎓', name: 'College Nodal Desk' },
            { id: 'bank_validator', icon: '🏦', name: 'Bank Branch Desk' }
          ].map(role => {
            const isActive = currentRole === role.id;
            return (
              <button
                key={role.id}
                type="button"
                onClick={() => {
                  setCurrentRole(role.id);
                  const acc = ROLE_ACCOUNTS[role.id];
                  if (acc) handleDemoLogin(acc.email, acc.pw);
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '5px 12px',
                  borderRadius: 4,
                  background: isActive ? 'var(--ink-primary)' : 'transparent',
                  color: isActive ? '#ffffff' : 'var(--ink-secondary)',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: 12,
                  fontWeight: isActive ? 700 : 500,
                  boxShadow: isActive ? '0 1px 4px rgba(15, 23, 42, 0.2)' : 'none',
                  transition: 'all 0.15s ease'
                }}
              >
                <span>{role.icon}</span>
                <span>{role.name}</span>
              </button>
            );
          })}
        </div>

        {/* Right Status Pill */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 11.5, color: 'var(--ink-secondary)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ display: 'inline-block', width: 7, height: 7, borderRadius: '50%', background: '#10b981' }} />
            <span>Role-Based Access Control: <strong>Active</strong></span>
          </div>
          <span>•</span>
          <span style={{ color: 'var(--stamp-bank-color)', fontWeight: 600 }}>
            Bank verification (simulated)
          </span>
        </div>
      </div>
    </header>
  );
}

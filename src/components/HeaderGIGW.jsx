import React, { useState, useEffect } from 'react';
import { Search, ChevronDown, User, Shield, FileText, CheckCircle2, Award, Bell, KeyRound, X, ExternalLink, HelpCircle, CheckCheck } from 'lucide-react';

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
  setTextSize,
  records = [],
  onSelectInstrument
}) {
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [alertsOpen, setAlertsOpen] = useState(false);
  const [loginMenuOpen, setLoginMenuOpen] = useState(false);
  const [alerts, setAlerts] = useState([]);
  const [currentUser, setCurrentUser] = useState({
    name: "Shri Alok K. Mishra",
    email: "officer@aicte.gov.in",
    role: "bureau_officer",
    department: "Regulation Bureau"
  });

  const ROLE_ACCOUNTS = {
    bureau_officer: { email: 'officer@aicte.gov.in', pw: 'Officer@123', name: 'Shri Alok K. Mishra', role: 'bureau_officer', badge: 'Scrutiny Officer Desk' },
    director: { email: 'director@aicte.gov.in', pw: 'Director@123', name: 'Prof. Rajive Kumar', role: 'director', badge: 'Regional Director Desk' },
    institution: { email: 'college@kalinga.edu.in', pw: 'College@123', name: 'Dr. S. Mohanty', role: 'institution', badge: 'College Nodal Desk' },
    bank_validator: { email: 'validator@sbi.co.in', pw: 'Bank@123', name: 'A. K. Verma', role: 'bank_validator', badge: 'Bank Branch Desk' }
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

  // Dismiss single alert
  const handleDismissAlert = async (e, alertId) => {
    e.stopPropagation();
    try {
      const token = localStorage.getItem('kosh_jwt_token') || '';
      await fetch(`http://127.0.0.1:8000/api/v1/alerts/${alertId}/dismiss`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
    } catch {}
    setAlerts(prev => prev.filter(a => a.id !== alertId));
  };

  // Dismiss all alerts
  const handleDismissAll = async () => {
    try {
      const token = localStorage.getItem('kosh_jwt_token') || '';
      await fetch('http://127.0.0.1:8000/api/v1/alerts/dismiss-all', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
    } catch {}
    setAlerts([]);
  };

  // Clicking an alert opens the college 360 dossier drawer and clears the alert
  const handleAlertClick = async (alertItem) => {
    try {
      const token = localStorage.getItem('kosh_jwt_token') || '';
      await fetch(`http://127.0.0.1:8000/api/v1/alerts/${alertItem.id}/dismiss`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
    } catch {}
    setAlerts(prev => prev.filter(a => a.id !== alertItem.id));
    setAlertsOpen(false);

    if (onSelectInstrument && records && records.length > 0) {
      const instQuery = alertItem.institutionName ? alertItem.institutionName.toLowerCase().split(' [')[0].trim() : '';
      const matched = records.find(r => 
        (alertItem.fdrId && (r.id === alertItem.fdrId || r.fdrNumber === alertItem.fdrId)) ||
        (instQuery && r.institutionName && r.institutionName.toLowerCase().includes(instQuery))
      ) || records.find(r => r.institutionName && r.institutionName.toLowerCase().includes('symbiosis')) || records[0];

      if (matched) {
        onSelectInstrument(matched);
      }
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
                width: 380,
                background: '#ffffff',
                border: '1px solid var(--border-medium)',
                borderRadius: 'var(--radius-sm)',
                boxShadow: '0 12px 32px rgba(15, 23, 42, 0.16)',
                zIndex: 250,
                padding: 12
              }}>
                {/* Popover Header */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border-subtle)', paddingBottom: 8, marginBottom: 8 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--ink-primary)' }}>
                      Statutory Expiry Alarms
                    </span>
                    <span style={{
                      background: alerts.length > 0 ? '#fee2e2' : '#ecfdf5',
                      color: alerts.length > 0 ? '#b91c1c' : '#047857',
                      fontSize: 10,
                      fontWeight: 700,
                      padding: '1px 6px',
                      borderRadius: 10
                    }}>
                      {alerts.length} Active
                    </span>
                  </div>

                  {alerts.length > 0 && (
                    <button
                      type="button"
                      onClick={handleDismissAll}
                      className="btn btn-secondary btn-sm"
                      style={{ fontSize: 10.5, padding: '2px 8px', height: 24, display: 'flex', alignItems: 'center', gap: 4 }}
                      title="Mark all alerts as acknowledged/dismissed"
                    >
                      <CheckCheck size={12} />
                      <span>Clear All</span>
                    </button>
                  )}
                </div>

                <div style={{ fontSize: 10.5, color: 'var(--ink-muted)', marginBottom: 8 }}>
                  Click an institution to inspect its 360° dossier • Click ✕ to dismiss
                </div>

                {/* Alerts List */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6, maxHeight: 300, overflowY: 'auto' }}>
                  {alerts.length === 0 ? (
                    <div style={{ padding: '20px 10px', textAlign: 'center', color: 'var(--ink-muted)', fontSize: 12 }}>
                      <CheckCircle2 size={24} color="#10b981" style={{ margin: '0 auto 6px auto' }} />
                      <div style={{ fontWeight: 600, color: 'var(--ink-primary)' }}>All Clear!</div>
                      <div style={{ fontSize: 11, marginTop: 2 }}>No active statutory alarms pending review.</div>
                    </div>
                  ) : (
                    alerts.map(a => (
                      <div
                        key={a.id}
                        onClick={() => handleAlertClick(a)}
                        style={{
                          padding: '8px 10px',
                          background: a.daysRemaining <= 30 ? '#fff5f5' : 'var(--bg-subtle)',
                          border: `1px solid ${a.daysRemaining <= 30 ? '#fecaca' : 'var(--border-subtle)'}`,
                          borderRadius: 6,
                          fontSize: 11,
                          cursor: 'pointer',
                          transition: 'all 0.15s ease',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: 3
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.borderColor = '#3b82f6';
                          e.currentTarget.style.boxShadow = '0 2px 8px rgba(59, 130, 246, 0.12)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.borderColor = a.daysRemaining <= 30 ? '#fecaca' : 'var(--border-subtle)';
                          e.currentTarget.style.boxShadow = 'none';
                        }}
                        title="Click to view institution 360° dossier"
                      >
                        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 6 }}>
                          <div style={{
                            fontWeight: 700,
                            color: a.daysRemaining <= 30 ? '#b91c1c' : '#1d4ed8',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 5
                          }}>
                            <span style={{ textDecoration: 'underline', textDecorationColor: 'rgba(59, 130, 246, 0.4)' }}>
                              {a.institutionName}
                            </span>
                            <ExternalLink size={11} color={a.daysRemaining <= 30 ? '#b91c1c' : '#2563eb'} />
                          </div>

                          <button
                            type="button"
                            onClick={(e) => handleDismissAlert(e, a.id)}
                            style={{
                              background: 'none',
                              border: 'none',
                              cursor: 'pointer',
                              color: 'var(--ink-muted)',
                              padding: '0 2px',
                              borderRadius: 2
                            }}
                            title="Dismiss this alert"
                          >
                            <X size={12} />
                          </button>
                        </div>

                        <div style={{ color: 'var(--ink-secondary)', fontSize: 11, lineHeight: 1.3 }}>
                          {a.message}
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 2, fontSize: 10, color: 'var(--ink-muted)' }}>
                          <span className="mono" style={{ fontWeight: 600 }}>{a.fdrId}</span>
                          <span>•</span>
                          <span style={{ color: a.daysRemaining <= 30 ? '#b91c1c' : 'var(--color-amber-600)', fontWeight: 600 }}>
                            {a.daysRemaining > 0 ? `${a.daysRemaining} days remaining` : `Matured ${Math.abs(a.daysRemaining)}d ago`}
                          </span>
                        </div>
                      </div>
                    ))
                  )}
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
            <span className="mono" style={{ fontSize: 11, fontWeight: 600 }}>Audit Ledger</span>
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
                  { name: 'Shri Alok K. Mishra', roleTitle: 'Senior Scrutiny Officer', dept: 'AICTE Regulation Bureau', email: 'officer@aicte.gov.in', pw: 'Officer@123', role: 'bureau_officer', badge: 'Scrutiny Officer Desk' },
                  { name: 'Prof. Rajive Kumar', roleTitle: 'Regional Director & Sanctioning Authority', dept: 'AICTE Regional Directorate', email: 'director@aicte.gov.in', pw: 'Director@123', role: 'director', badge: 'Regional Director Desk' },
                  { name: 'Dr. S. Mohanty', roleTitle: 'College Registrar & Nodal Officer', dept: 'Kalinga Institute of Advanced Technology', email: 'college@kalinga.edu.in', pw: 'College@123', role: 'institution', badge: 'College Nodal Desk' },
                  { name: 'A. K. Verma', roleTitle: 'Chief Manager (CBS Operations)', dept: 'State Bank of India', email: 'validator@sbi.co.in', pw: 'Bank@123', role: 'bank_validator', badge: 'Bank Branch Desk' }
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
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ fontWeight: 700 }}>{u.name}</span>
                      <span style={{ fontSize: 9.5, fontWeight: 700, padding: '1px 5px', borderRadius: 4, background: '#f1f5f9', color: 'var(--ink-secondary)' }}>
                        {u.badge}
                      </span>
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--color-amber-600)', fontWeight: 600 }}>{u.roleTitle}</div>
                    <div className="mono" style={{ fontSize: 10, color: 'var(--ink-muted)' }}>{u.email} • {u.dept}</div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* User Menu Dropdown - Clear Persona Name & Segregation Badge */}
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              className="btn btn-ink-primary btn-sm"
              style={{ height: 36, display: 'flex', alignItems: 'center', gap: 6, padding: '0 10px' }}
              title={`Logged in as ${currentUser.name} (${currentUser.role})`}
            >
              <User size={13} />
              <span style={{ fontWeight: 600 }}>{currentUser.name}</span>
              <span style={{
                fontSize: 10,
                padding: '1px 6px',
                borderRadius: 4,
                background: 'rgba(255, 255, 255, 0.2)',
                fontWeight: 600,
                letterSpacing: '0.02em'
              }}>
                {currentUser.role === 'director' ? 'Member Secy' : currentUser.role === 'institution' ? 'College' : currentUser.role === 'bank_validator' ? 'Bank' : 'Scrutiny Officer'}
              </span>
              <ChevronDown size={11} />
            </button>

            {userMenuOpen && (
              <div
                style={{
                  position: 'absolute',
                  right: 0,
                  top: 42,
                  width: 250,
                  background: '#ffffff',
                  border: '1px solid var(--border-medium)',
                  borderRadius: 'var(--radius-sm)',
                  boxShadow: 'var(--shadow-modal)',
                  zIndex: 200,
                  padding: 8
                }}
              >
                <div style={{ padding: '8px 10px', borderBottom: '1px solid var(--border-subtle)', fontSize: 11.5 }}>
                  <div style={{ fontWeight: 700, color: 'var(--ink-primary)', fontSize: 13 }}>{currentUser.name}</div>
                  <div style={{ color: 'var(--ink-muted)', fontSize: 11 }}>{currentUser.email}</div>
                  <div style={{ color: 'var(--color-amber-600)', fontWeight: 600, marginTop: 4, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Shield size={12} />
                    <span>
                      {currentUser.role === 'director'
                        ? 'Regional Director & Sanctioning Authority'
                        : currentUser.role === 'institution'
                        ? 'College Nodal Desk'
                        : currentUser.role === 'bank_validator'
                        ? 'Bank Branch Desk'
                        : 'Scrutiny Officer Desk'}
                    </span>
                  </div>
                  <div style={{ fontSize: 10.5, color: 'var(--ink-secondary)', marginTop: 2 }}>
                    {currentUser.department || 'AICTE Regulation Bureau'}
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
            { id: 'director', icon: '⚖️', name: 'Regional Director Desk' },
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

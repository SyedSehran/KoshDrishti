import React, { useState } from 'react';
import { 
  Clock, 
  AlertTriangle, 
  Bell, 
  Send, 
  GitBranch, 
  Calendar, 
  Building2, 
  CheckCircle2, 
  ChevronRight, 
  ArrowRight, 
  Mail, 
  Smartphone, 
  ShieldAlert,
  Layers
} from 'lucide-react';

export default function MaturityRadar({ records, onSelectFDR, onOpenLineageModal }) {
  const [selectedHorizon, setSelectedHorizon] = useState('30d');
  const [alertLog, setAlertLog] = useState([
    {
      id: 'ALT-1',
      date: '2026-10-20 09:30 AM',
      fdrNo: 'FDR/BOB/554109823',
      institution: 'Symbiosis Institute of Digital Enterprise',
      channel: 'SMS & DigiLocker',
      tier: 'CRITICAL (30 Days Left)',
      message: 'Urgent: FDR expires on 20 Nov 2026. Submit Rollover Renewal or Replacement e-BG within 15 days to avoid approval freeze.'
    },
    {
      id: 'ALT-2',
      date: '2026-09-20 10:00 AM',
      fdrNo: 'FDR/BOB/554109823',
      institution: 'Symbiosis Institute of Digital Enterprise',
      channel: 'Registered Email',
      tier: 'ADVANCE WARNING (60 Days Left)',
      message: 'Notice of upcoming maturity under APH Regulation Clause 2.15.'
    }
  ]);
  const [isDispatching, setIsDispatching] = useState(false);

  // Classify records by maturity window
  const criticalRecords = records.filter(r => r.daysRemaining > 0 && r.daysRemaining <= 30);
  const warningRecords = records.filter(r => r.daysRemaining > 30 && r.daysRemaining <= 90);
  const safeRecords = records.filter(r => r.daysRemaining > 90);
  const maturedRecords = records.filter(r => r.daysRemaining <= 0);

  const handleSimulateAlertDispatch = (record) => {
    setIsDispatching(true);
    setTimeout(() => {
      const newAlert = {
        id: `ALT-${alertLog.length + 1}`,
        date: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) + ' Just Now',
        fdrNo: record.fdrNumber,
        institution: record.institutionName,
        channel: 'DigiLocker + Bank CBS SFMS',
        tier: 'INSTANT ESCALATION NOTICE',
        message: `High-priority regulatory reminder generated for ${record.fdrNumber}. Bank branch copy transmitted to ${record.issuingBank}.`
      };
      setAlertLog([newAlert, ...alertLog]);
      setIsDispatching(false);
    }, 800);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Top Banner */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h2 style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-primary)' }}>
            Automated Maturity Radar & Rollover Lineage
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>
            90-60-30-15 day countdown triggers, automated statutory notice dispatch, and rollover lineage mapping.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span className="badge badge-warning" style={{ fontSize: 11, padding: '4px 10px' }}>
            <Clock size={13} />
            <span>1 Instrument in Critical &lt;30d Window</span>
          </span>
        </div>
      </div>

      {/* Horizon Selector Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: 14
      }}>
        <div
          onClick={() => setSelectedHorizon('30d')}
          style={{
            padding: 16,
            borderRadius: 'var(--radius-md)',
            background: selectedHorizon === '30d' ? 'rgba(251, 191, 36, 0.12)' : 'rgba(20, 27, 39, 0.6)',
            border: selectedHorizon === '30d' ? '1px solid var(--border-gold)' : '1px solid var(--border-subtle)',
            cursor: 'pointer',
            transition: 'all 0.2s ease'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--status-warning)', textTransform: 'uppercase' }}>
              &lt; 30 Days (Critical)
            </span>
            <span className="badge badge-warning">{criticalRecords.length}</span>
          </div>
          <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
            Immediate replacement guarantee or renewal required
          </div>
        </div>

        <div
          onClick={() => setSelectedHorizon('90d')}
          style={{
            padding: 16,
            borderRadius: 'var(--radius-md)',
            background: selectedHorizon === '90d' ? 'rgba(6, 182, 212, 0.12)' : 'rgba(20, 27, 39, 0.6)',
            border: selectedHorizon === '90d' ? '1px solid var(--border-cyan)' : '1px solid var(--border-subtle)',
            cursor: 'pointer',
            transition: 'all 0.2s ease'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--cyan-400)', textTransform: 'uppercase' }}>
              31 - 90 Days (Warning)
            </span>
            <span className="badge badge-cyan">{warningRecords.length}</span>
          </div>
          <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
            Advance advisory notices dispatched to Trust
          </div>
        </div>

        <div
          onClick={() => setSelectedHorizon('safe')}
          style={{
            padding: 16,
            borderRadius: 'var(--radius-md)',
            background: selectedHorizon === 'safe' ? 'rgba(45, 212, 191, 0.12)' : 'rgba(20, 27, 39, 0.6)',
            border: selectedHorizon === 'safe' ? '1px solid rgba(45, 212, 191, 0.3)' : '1px solid var(--border-subtle)',
            cursor: 'pointer',
            transition: 'all 0.2s ease'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--status-verified)', textTransform: 'uppercase' }}>
              &gt; 90 Days (Lock-in Safe)
            </span>
            <span className="badge badge-verified">{safeRecords.length}</span>
          </div>
          <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
            Active compliance with unencumbered lien
          </div>
        </div>

        <div
          onClick={() => setSelectedHorizon('matured')}
          style={{
            padding: 16,
            borderRadius: 'var(--radius-md)',
            background: selectedHorizon === 'matured' ? 'rgba(203, 213, 225, 0.12)' : 'rgba(20, 27, 39, 0.6)',
            border: selectedHorizon === 'matured' ? '1px solid var(--border-medium)' : '1px solid var(--border-subtle)',
            cursor: 'pointer',
            transition: 'all 0.2s ease'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              Matured / Discharged
            </span>
            <span className="badge badge-released">{maturedRecords.length}</span>
          </div>
          <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
            Completed 10-year term / Rolled over / Released
          </div>
        </div>
      </div>

      {/* Detail Grid for Active Horizon */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: 20 }}>
        {/* Left Column: Instruments in this Horizon */}
        <div className="glass-panel" style={{ padding: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>
              Horizon Instruments ({selectedHorizon === '30d' ? criticalRecords.length : selectedHorizon === '90d' ? warningRecords.length : selectedHorizon === 'safe' ? safeRecords.length : maturedRecords.length})
            </div>
            <span className="mono" style={{ fontSize: 11, color: 'var(--gold-400)' }}>
              Autonomous Daemon Check: Active
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {(selectedHorizon === '30d' ? criticalRecords : selectedHorizon === '90d' ? warningRecords : selectedHorizon === 'safe' ? safeRecords : maturedRecords).map(item => (
              <div
                key={item.id}
                style={{
                  padding: 14,
                  borderRadius: 'var(--radius-md)',
                  background: 'rgba(10, 14, 22, 0.6)',
                  border: item.daysRemaining <= 30 && item.daysRemaining > 0 ? '1px solid var(--border-gold)' : '1px solid var(--border-subtle)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 10
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <span className="mono" style={{ fontWeight: 700, color: 'var(--gold-400)', fontSize: 13 }}>
                      {item.fdrNumber}
                    </span>
                    <span style={{ fontSize: 12, color: 'var(--text-muted)', marginLeft: 8 }}>
                      ({item.issuingBank})
                    </span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    {item.daysRemaining > 0 ? (
                      <span className="badge badge-warning" style={{ fontSize: 10 }}>
                        <Clock size={11} /> {item.daysRemaining} Days Left
                      </span>
                    ) : (
                      <span className="badge badge-released" style={{ fontSize: 10 }}>
                        Matured
                      </span>
                    )}
                  </div>
                </div>

                <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                  <strong>{item.institutionName}</strong>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 11, color: 'var(--text-muted)', paddingTop: 6, borderTop: '1px solid var(--border-subtle)' }}>
                  <span>Principal: <strong style={{ color: 'var(--text-primary)' }}>₹ {(item.amount / 100000).toFixed(1)} L</strong></span>
                  <span>Matures: <strong style={{ color: 'var(--text-primary)' }}>{item.maturityDate}</strong></span>

                  <div style={{ display: 'flex', gap: 6 }}>
                    <button
                      onClick={() => handleSimulateAlertDispatch(item)}
                      disabled={isDispatching}
                      className="btn btn-secondary btn-sm"
                      style={{ padding: '3px 8px', fontSize: 11 }}
                    >
                      <Bell size={11} />
                      <span>Dispatch Alert</span>
                    </button>

                    <button
                      onClick={() => onSelectFDR(item)}
                      className="btn btn-cyan btn-sm"
                      style={{ padding: '3px 8px', fontSize: 11 }}
                    >
                      <span>View</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Multi-Channel Alert & Escalation Feed */}
        <div className="glass-panel" style={{ padding: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Bell size={16} color="var(--gold-400)" />
              <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>
                Multi-Channel Notice Feed
              </span>
            </div>
            <span className="badge badge-gold" style={{ fontSize: 10 }}>Live Telemetry</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, maxHeight: 380, overflowY: 'auto' }}>
            {alertLog.map(alert => (
              <div
                key={alert.id}
                style={{
                  padding: 12,
                  borderRadius: 'var(--radius-sm)',
                  background: 'rgba(10, 14, 22, 0.8)',
                  border: '1px solid var(--border-subtle)',
                  fontSize: 12,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 6
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span className="badge badge-warning" style={{ fontSize: 9 }}>
                    {alert.tier}
                  </span>
                  <span className="mono" style={{ fontSize: 10, color: 'var(--text-dim)' }}>
                    {alert.date}
                  </span>
                </div>

                <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: 12 }}>
                  {alert.institution}
                </div>

                <div style={{ color: 'var(--text-muted)', fontSize: 11 }}>
                  {alert.message}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 10, color: 'var(--gold-400)', paddingTop: 4 }}>
                  <span>Channel: {alert.channel}</span>
                  <span>•</span>
                  <span>Delivered via NIC Gateway</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

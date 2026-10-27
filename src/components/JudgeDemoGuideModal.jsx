import React from 'react';
import { X, Award, ArrowRight, ShieldAlert, Clock, CheckCircle2, UserCheck, FileText } from 'lucide-react';

export default function JudgeDemoGuideModal({ onClose, onTriggerFlow }) {
  const demoFlows = [
    {
      id: 'flow_discrepancy',
      title: 'Demo Flow 1: Non-Compliant / Mismatched FDR Detection',
      badge: 'Core Problem Statement Innovation',
      steps: [
        '1. Institution claims 10-year deposit of ₹35 Lakhs with AICTE joint lien.',
        '2. Bank verification (simulated) reveals Core Banking has only 5 years, ₹15 Lakhs, and NO AICTE lien.',
        '3. Officer opens "Compare sources" and issues a 15-day statutory rectification mandate.'
      ],
      actionLabel: 'Launch Flow 1 (Compare Sources)',
      color: 'var(--ramp-vermilion-text)',
      bg: 'var(--ramp-vermilion-bg)',
      border: 'var(--ramp-vermilion-border)'
    },
    {
      id: 'flow_maturity',
      title: 'Demo Flow 2: Approaching Maturity Runway & Escalation',
      badge: 'Automated Lifecycle Tracking',
      steps: [
        '1. Maturity runway dynamically flags instruments entering the critical 30-day window.',
        '2. System automatically generates reminder notice and prepares Regional Bureau escalation.',
        '3. Officer inspects instrument 360° drawer and dispatches multi-channel notice.'
      ],
      actionLabel: 'Launch Flow 2 (Maturity Runway)',
      color: 'var(--ramp-turmeric-text)',
      bg: 'var(--ramp-turmeric-bg)',
      border: 'var(--ramp-turmeric-border)'
    },
    {
      id: 'flow_release',
      title: 'Demo Flow 3: Two-Officer Approval & Official AICTE Discharge Order',
      badge: 'NOC & Discharge Pipeline',
      steps: [
        '1. Vidyavardhaka College completes full 10-year lock-in under APH Table 1.4.',
        '2. Scrutiny Officer verifies 5-point statutory checklist (zero student complaints, RO clearance).',
        '3. Approving Authority digitally sanctions release, auto-generating the official AICTE Discharge Letter with QR seal.'
      ],
      actionLabel: 'Launch Flow 3 (Two-Officer Approval)',
      color: 'var(--stamp-bank-color)',
      bg: 'var(--stamp-bank-bg)',
      border: 'var(--stamp-bank-border)'
    }
  ];

  return (
    <div className="drawer-backdrop" onClick={onClose} style={{ alignItems: 'center', justifyContent: 'center' }}>
      <div 
        className="paper-card" 
        style={{ width: '100%', maxWidth: 760, maxHeight: '90vh', overflowY: 'auto', padding: 0 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{
          padding: '18px 24px',
          borderBottom: '1px solid var(--border-medium)',
          background: 'var(--bg-muted)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Award size={18} color="var(--ink-primary)" />
            <div>
              <h3 className="serif-heading" style={{ fontSize: 16, color: 'var(--ink-primary)' }}>
                Evaluator Demonstration Scripts • Problem Statement 26265
              </h3>
              <div style={{ fontSize: 11, color: 'var(--ink-muted)' }}>
                Step-by-step presentation rehearsal flows aligned with AICTE APH 2024-27
              </div>
            </div>
          </div>

          <button onClick={onClose} className="btn btn-secondary btn-sm" style={{ padding: 6, borderRadius: '50%' }}>
            <X size={16} />
          </button>
        </div>

        <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
          <p style={{ fontSize: 12.5, color: 'var(--ink-secondary)', lineHeight: 1.5 }}>
            Each script below demonstrates how AICTE VISHWAS-FDR replaces fragmented manual tracking with an automated, credible regulatory workflow:
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {demoFlows.map((flow, idx) => (
              <div
                key={flow.id}
                style={{
                  border: `1px solid ${flow.border}`,
                  borderRadius: 'var(--radius-sm)',
                  padding: 16,
                  background: '#ffffff',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 10
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--ink-primary)' }}>
                      {flow.title}
                    </span>
                    <span className="badge-clean" style={{ background: flow.bg, color: flow.color, fontSize: 10 }}>
                      {flow.badge}
                    </span>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 4, paddingLeft: 4, fontSize: 11.5, color: 'var(--ink-secondary)' }}>
                  {flow.steps.map((s, i) => (
                    <div key={i}>{s}</div>
                  ))}
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: 6, borderTop: '1px solid var(--border-subtle)' }}>
                  <button
                    onClick={() => {
                      onTriggerFlow(flow.id);
                      onClose();
                    }}
                    className="btn btn-ink-primary btn-sm"
                  >
                    <span>{flow.actionLabel}</span>
                    <ArrowRight size={12} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div style={{
          padding: '12px 24px',
          borderTop: '1px solid var(--border-medium)',
          background: 'var(--bg-muted)',
          display: 'flex',
          justifyContent: 'flex-end'
        }}>
          <button onClick={onClose} className="btn btn-secondary btn-sm">
            Close Scripts
          </button>
        </div>
      </div>
    </div>
  );
}

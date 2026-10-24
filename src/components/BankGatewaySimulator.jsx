import React, { useState } from 'react';
import { 
  Landmark, 
  KeyRound, 
  CheckCircle2, 
  ShieldAlert, 
  Zap, 
  ArrowRight, 
  FileCode, 
  Layers, 
  RefreshCw,
  Lock,
  Unlock,
  Radio
} from 'lucide-react';
import { MOCK_BANK_CATALOG } from '../data/mockData';

export default function BankGatewaySimulator({ records, onInjectDiscrepancyScenario, onBankConfirmLien }) {
  const [selectedBank, setSelectedBank] = useState('Punjab National Bank');
  const [activeTab, setActiveTab] = useState('telemetry');
  const [apiLogs, setApiLogs] = useState([
    {
      time: '14:28:10',
      bank: 'SBI',
      endpoint: '/api/v2/cbs/fdr/verify',
      status: '200 OK',
      ref: 'SBI/SFMS/2024/09812',
      detail: 'Lien confirmed for Member Secretary AICTE'
    },
    {
      time: '14:25:04',
      bank: 'PNB',
      endpoint: '/api/v2/cbs/fdr/verify',
      status: '409 CONFLICT',
      ref: 'PNB/CBS/DIFF/9981',
      detail: 'Discrepancy: Pledgee clause missing Member Secretary AICTE'
    }
  ]);

  const bankInfo = MOCK_BANK_CATALOG.find(b => b.name === selectedBank) || MOCK_BANK_CATALOG[0];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Banner */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h2 style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-primary)' }}>
            Core Banking System (CBS) & SFMS ISO20022 Gateway
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>
            Simulate real-time bank branch confirmation, lien registry, and regulatory discrepancy injection.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span className="badge badge-cyan" style={{ fontSize: 11, padding: '4px 10px' }}>
            <Radio size={12} className="pulse-dot" />
            <span>SFMS 798 Direct Tunnel: Connected</span>
          </span>
        </div>
      </div>

      {/* Simulator Bank Selector & Live Status */}
      <div className="glass-panel" style={{ padding: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{
              width: 44,
              height: 44,
              borderRadius: 'var(--radius-md)',
              background: 'rgba(6, 182, 212, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--cyan-400)'
            }}>
              <Landmark size={24} />
            </div>
            <div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Simulated Banking Node:</div>
              <select
                className="input-control"
                value={selectedBank}
                onChange={(e) => setSelectedBank(e.target.value)}
                style={{ fontSize: 14, fontWeight: 700, height: 36, marginTop: 4, width: 260 }}
              >
                {MOCK_BANK_CATALOG.map(b => (
                  <option key={b.name} value={b.name}>{b.name} ({b.code})</option>
                ))}
              </select>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 24, fontSize: 12 }}>
            <div>
              <div style={{ color: 'var(--text-dim)' }}>API Gateway Latency</div>
              <div className="mono" style={{ color: 'var(--status-verified)', fontWeight: 700, marginTop: 2 }}>
                {bankInfo.responseLatencyMs} ms (Sub-second)
              </div>
            </div>
            <div>
              <div style={{ color: 'var(--text-dim)' }}>SFMS ISO Standard</div>
              <div className="mono" style={{ color: 'var(--cyan-400)', fontWeight: 700, marginTop: 2 }}>
                MT798 / camt.053
              </div>
            </div>
            <div>
              <div style={{ color: 'var(--text-dim)' }}>Digital Signature Protocol</div>
              <div className="mono" style={{ color: 'var(--gold-400)', fontWeight: 700, marginTop: 2 }}>
                e-Sign PKI (2048-bit)
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Judge Interactive Scenarios Bar */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.08) 0%, rgba(20, 27, 39, 0.9) 100%)',
        border: '1px solid var(--border-gold)',
        borderRadius: 'var(--radius-lg)',
        padding: '20px 24px',
        display: 'flex',
        flexDirection: 'column',
        gap: 14
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Zap size={18} color="var(--gold-400)" />
          <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>
            Interactive Demo Testing Scenarios for Evaluators:
          </span>
        </div>
        <p style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
          Click any scenario below to trigger immediate Core Banking simulation and see how AICTE VISHWAS-FDR responds instantaneously:
        </p>

        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <button
            onClick={() => onInjectDiscrepancyScenario('MISSING_LIEN')}
            className="btn btn-secondary btn-sm"
            style={{ border: '1px solid var(--border-gold)' }}
          >
            <ShieldAlert size={14} color="var(--status-flagged)" />
            <span>Scenario A: Inject "Missing AICTE Lien" Discrepancy</span>
          </button>

          <button
            onClick={() => onInjectDiscrepancyScenario('TENOR_SHORTFALL')}
            className="btn btn-secondary btn-sm"
            style={{ border: '1px solid var(--border-gold)' }}
          >
            <ShieldAlert size={14} color="var(--status-warning)" />
            <span>Scenario B: Inject "Tenor Shortfall (5y instead of 10y)"</span>
          </button>

          <button
            onClick={() => onBankConfirmLien('FDR-2023-4109')}
            className="btn btn-cyan btn-sm"
          >
            <CheckCircle2 size={14} />
            <span>Scenario C: Bank Branch Endorses Lien & Clears Flag</span>
          </button>
        </div>
      </div>

      {/* CBS Telemetry & SFMS Payloads */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        {/* Left: Live API Request / Response Log */}
        <div className="glass-panel" style={{ padding: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>
              Live Core Banking API Transaction Log
            </span>
            <span className="mono" style={{ fontSize: 11, color: 'var(--text-dim)' }}>Auto-polling</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {apiLogs.map((log, i) => (
              <div
                key={i}
                style={{
                  padding: 12,
                  borderRadius: 'var(--radius-sm)',
                  background: 'rgba(10, 14, 22, 0.7)',
                  border: '1px solid var(--border-subtle)',
                  fontSize: 12,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 4
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span className="mono" style={{ color: log.status.includes('200') ? 'var(--status-verified)' : 'var(--status-flagged)', fontWeight: 700 }}>
                    {log.status}
                  </span>
                  <span className="mono" style={{ color: 'var(--text-dim)', fontSize: 10 }}>{log.time}</span>
                </div>
                <div className="mono" style={{ color: 'var(--gold-400)', fontSize: 11 }}>
                  {log.bank} • {log.endpoint}
                </div>
                <div style={{ color: 'var(--text-secondary)', fontSize: 11 }}>
                  {log.detail}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Simulated SFMS MT798 Payload Viewer */}
        <div className="glass-panel" style={{ padding: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <FileCode size={16} color="var(--cyan-400)" />
              <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>
                SFMS MT798 Regulatory Payload Preview
              </span>
            </div>
            <span className="badge badge-cyan" style={{ fontSize: 10 }}>ISO Standard</span>
          </div>

          <pre className="mono" style={{
            background: 'rgba(10, 14, 22, 0.95)',
            padding: 14,
            borderRadius: 'var(--radius-sm)',
            border: '1px solid var(--border-subtle)',
            fontSize: 11,
            color: 'var(--cyan-400)',
            lineHeight: 1.6,
            overflowX: 'auto',
            maxHeight: 280
          }}>
{`{
  ":20:TRANSACTION_REF": "SFMS/AICTE/2024/09812",
  ":21:RELATED_REF": "FDR/SBI/782194002",
  ":77E:FINANCIAL_INSTRUMENT": "FIXED_DEPOSIT_RECEIPT",
  ":32B:CURRENCY_AMOUNT": "INR 3500000.00",
  ":30:ISSUE_DATE": "20240315",
  ":31E:EXPIRY_DATE": "20340315",
  ":79:LIEN_ENDORSEMENT": {
    "PLEDGEE_1": "MEMBER SECRETARY, AICTE",
    "PLEDGEE_2": "KALINGA VIDYA BHARATI TRUST",
    "LIEN_STATUS": "ACTIVE_REGISTERED",
    "PREMATURE_SURRENDER_RESTRICTION": "STRICT_AICTE_SANCTION_REQUIRED",
    "BRANCH_IFSC": "SBIN0006240"
  },
  "CRYPTO_SEAL": "e3b0c44298fc1c149afbf4c8996fb92427ae"
}`}
          </pre>
        </div>
      </div>
    </div>
  );
}

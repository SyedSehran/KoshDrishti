import React, { useState, useEffect } from 'react';
import { 
  X, 
  Link2, 
  ShieldCheck, 
  CheckCircle2, 
  AlertTriangle, 
  Copy, 
  Lock, 
  ArrowDown, 
  RefreshCw,
  Bug,
  RotateCcw
} from 'lucide-react';

export default function CryptoLedgerModal({ onClose }) {
  const [blocks, setBlocks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [verificationResult, setVerificationResult] = useState(null);
  const [copiedHash, setCopiedHash] = useState(null);
  const [actionNotice, setActionNotice] = useState(null);

  const fetchLedger = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('http://127.0.0.1:8000/api/v1/ledger');
      const data = await res.json();
      setBlocks(data.blocks || []);
    } catch (err) {
      console.error("Failed to fetch ledger:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLedger();
  }, []);

  const handleVerifyLedger = async () => {
    try {
      const res = await fetch('http://127.0.0.1:8000/api/v1/ledger/verify');
      const data = await res.json();
      setVerificationResult(data);
    } catch (err) {
      setVerificationResult({ valid: false, error: "Failed to connect to backend verification API" });
    }
  };

  const handleTamperDemo = async () => {
    try {
      const token = localStorage.getItem('kosh_jwt_token') || '';
      const res = await fetch('http://127.0.0.1:8000/api/v1/ledger/tamper', { 
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      setActionNotice(data.message);
      await fetchLedger();
      // Immediately run verification to prove it fails
      const vRes = await fetch('http://127.0.0.1:8000/api/v1/ledger/verify');
      const vData = await vRes.json();
      setVerificationResult(vData);
    } catch (err) {
      console.error(err);
    }
  };

  const handleRepairDemo = async () => {
    try {
      const token = localStorage.getItem('kosh_jwt_token') || '';
      const res = await fetch('http://127.0.0.1:8000/api/v1/ledger/repair', { 
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      setActionNotice(data.message);
      await fetchLedger();
      const vRes = await fetch('http://127.0.0.1:8000/api/v1/ledger/verify');
      const vData = await vRes.json();
      setVerificationResult(vData);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCopy = (hash) => {
    navigator.clipboard?.writeText(hash);
    setCopiedHash(hash);
    setTimeout(() => setCopiedHash(null), 1500);
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div 
        className="modal-dialog" 
        style={{ maxWidth: 960, maxHeight: '90vh' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{
          padding: '18px 24px',
          borderBottom: '1px solid var(--border-medium)',
          background: 'var(--bg-muted)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{
              width: 38,
              height: 38,
              borderRadius: 8,
              background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff'
            }}>
              <Link2 size={18} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <h3 className="serif-heading" style={{ fontSize: 16, color: 'var(--ink-primary)' }}>
                  Tamper-Evident SHA-256 Merkle Regulatory Ledger
                </h3>
                <span className="mono" style={{
                  fontSize: 10.5,
                  background: 'var(--ink-primary)',
                  color: '#ffffff',
                  padding: '2px 6px',
                  borderRadius: 3
                }}>
                  Height: Block #{blocks.length > 0 ? blocks[blocks.length - 1].blockIndex : 0}
                </span>
              </div>
              <div style={{ fontSize: 11.5, color: 'var(--ink-secondary)', marginTop: 2 }}>
                Real SHA-256 hash-chained regulatory ledger persisted in SQLite. Survives page reload.
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="btn btn-secondary btn-sm"
            style={{ width: 30, height: 30, borderRadius: '50%', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            <X size={15} />
          </button>
        </div>

        {/* Action & Verification Control Bar */}
        <div style={{
          padding: '12px 24px',
          background: '#ffffff',
          borderBottom: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 10
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <button
              onClick={handleVerifyLedger}
              className="btn btn-ink-primary btn-sm"
              style={{ fontWeight: 700 }}
            >
              <CheckCircle2 size={13} />
              <span>Verify Cryptographic Chain</span>
            </button>

            <button
              onClick={handleTamperDemo}
              className="btn btn-sm"
              style={{ background: '#fef2f2', border: '1px solid #fca5a5', color: '#b91c1c', fontWeight: 600 }}
              title="Intentionally mutate block #1 in SQLite without hash update to test detection"
            >
              <Bug size={13} />
              <span>Tamper Row #1 (Judge Demo)</span>
            </button>

            <button
              onClick={handleRepairDemo}
              className="btn btn-sm"
              style={{ background: '#ecfdf5', border: '1px solid #a7f3d0', color: '#047857', fontWeight: 600 }}
              title="Restore legitimate details and verify chain again"
            >
              <RotateCcw size={13} />
              <span>Restore Chain Integrity</span>
            </button>
          </div>

          <button
            onClick={fetchLedger}
            className="btn btn-paper btn-sm"
            style={{ fontSize: 11 }}
          >
            <RefreshCw size={12} />
            <span>Refresh from DB</span>
          </button>
        </div>

        {/* Verification Status Alert */}
        {verificationResult && (
          <div style={{
            margin: '14px 24px 0',
            padding: '12px 16px',
            borderRadius: 'var(--radius-sm)',
            background: verificationResult.valid ? '#ecfdf5' : '#fef2f2',
            border: verificationResult.valid ? '1.5px solid #a7f3d0' : '1.5px solid #fca5a5',
            color: verificationResult.valid ? '#047857' : '#b91c1c',
            fontSize: 12,
            display: 'flex',
            alignItems: 'flex-start',
            gap: 10
          }}>
            {verificationResult.valid ? <CheckCircle2 size={16} style={{ flexShrink: 0, marginTop: 2 }} /> : <AlertTriangle size={16} style={{ flexShrink: 0, marginTop: 2 }} />}
            <div>
              <div style={{ fontWeight: 700 }}>
                {verificationResult.valid ? "Cryptographic Chain Fully Intact (100% Mathematically Valid)" : "Cryptographic Tampering Detected!"}
              </div>
              <div style={{ marginTop: 2, color: verificationResult.valid ? '#065f46' : '#7f1d1d' }}>
                {verificationResult.valid 
                  ? `Recomputed SHA-256 hashes across all ${verificationResult.total_blocks} blocks. Previous hash pointers match exactly.`
                  : verificationResult.error}
              </div>
            </div>
          </div>
        )}

        {/* Blocks Scroll View */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px 24px', display: 'flex', flexDirection: 'column', gap: 14 }}>
          {isLoading ? (
            <div style={{ textAlign: 'center', padding: '30px', color: 'var(--ink-muted)' }}>
              Loading cryptographic ledger from SQLite...
            </div>
          ) : blocks.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '30px', color: 'var(--ink-muted)' }}>
              No audit records currently found.
            </div>
          ) : (
            blocks.map((block) => (
              <div 
                key={block.blockIndex}
                className="paper-card"
                style={{
                  padding: 16,
                  borderLeft: '4px solid var(--ink-primary)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 10
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span className="mono" style={{ fontWeight: 700, fontSize: 12, background: 'var(--bg-muted)', padding: '2px 8px', borderRadius: 3 }}>
                      Block #{block.blockIndex}
                    </span>
                    <span className="badge-clean badge-warning" style={{ fontSize: 10, fontWeight: 700 }}>
                      {block.action}
                    </span>
                    {block.fdrId && (
                      <span className="mono" style={{ fontSize: 11, color: 'var(--ink-muted)' }}>
                        {block.fdrId}
                      </span>
                    )}
                  </div>
                  <span className="mono" style={{ fontSize: 11, color: 'var(--ink-muted)' }}>
                    {block.timestamp}
                  </span>
                </div>

                <div style={{ fontSize: 12.5, color: 'var(--ink-secondary)' }}>
                  <span style={{ color: 'var(--ink-muted)', fontSize: 11 }}>Actor:</span> <strong>{block.actor}</strong>
                  <div style={{ marginTop: 4, color: 'var(--ink-primary)', lineHeight: 1.4 }}>
                    {block.details}
                  </div>
                </div>

                {/* SHA-256 Hashes Strip */}
                <div style={{
                  padding: '8px 12px',
                  background: 'var(--bg-subtle)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-xs)',
                  fontSize: 10.5,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 4
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ color: 'var(--ink-muted)' }}>Prev Hash:</span>
                    <span className="mono" style={{ color: 'var(--ink-muted)' }}>{block.previousHash}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontWeight: 600, color: 'var(--ink-primary)' }}>Block Hash (SHA-256):</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span className="mono" style={{ fontWeight: 700, color: '#047857' }}>{block.blockHash}</span>
                      <button
                        type="button"
                        onClick={() => handleCopy(block.blockHash)}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                        title="Copy SHA-256 hash"
                      >
                        <Copy size={11} color="var(--ink-muted)" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div style={{
          padding: '14px 24px',
          borderTop: '1px solid var(--border-medium)',
          background: 'var(--bg-muted)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <span style={{ fontSize: 11.5, color: 'var(--ink-secondary)' }}>
            Cryptographic Engine: <strong>hashlib.sha256</strong> • Table: <code className="mono">audit_ledger</code> in SQLite
          </span>
          <button onClick={onClose} className="btn btn-ink-primary btn-sm">
            Close Ledger Explorer
          </button>
        </div>
      </div>
    </div>
  );
}

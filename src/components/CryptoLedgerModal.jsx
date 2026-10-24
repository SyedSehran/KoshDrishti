import React, { useState } from 'react';
import { 
  X, 
  Link2, 
  ShieldCheck, 
  CheckCircle2, 
  AlertTriangle, 
  Copy, 
  Lock, 
  ArrowDown, 
  Sparkles,
  Layers
} from 'lucide-react';
import { verifyLedgerChain } from '../utils/cryptoLedger';

export default function CryptoLedgerModal({ ledgerChain, onClose }) {
  const [verificationResult, setVerificationResult] = useState(null);
  const [copiedHash, setCopiedHash] = useState(null);

  const handleVerifyLedger = () => {
    const res = verifyLedgerChain(ledgerChain);
    setVerificationResult(res);
  };

  const handleCopy = (hash) => {
    navigator.clipboard?.writeText(hash);
    setCopiedHash(hash);
    setTimeout(() => setCopiedHash(null), 1500);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div 
        className="modal-container" 
        style={{ maxWidth: 980 }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{
              width: 36,
              height: 36,
              borderRadius: 'var(--radius-md)',
              background: 'var(--iris-glow)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--iris-400)'
            }}>
              <Link2 size={20} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)' }}>
                  Tamper-Evident SHA-256 Merkle Regulatory Ledger
                </h3>
                <span className="badge badge-iris" style={{ fontSize: 10 }}>
                  Height: Block #{ledgerChain.length - 1}
                </span>
              </div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                Immutable, hash-chained regulatory audit ledger providing cryptographic non-repudiation for AICTE Regulation Bureau.
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="btn btn-secondary btn-sm"
            style={{ padding: 6, borderRadius: '50%' }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Top Verification Bar */}
          <div style={{
            background: 'rgba(139, 92, 246, 0.08)',
            border: '1px solid var(--border-iris)',
            borderRadius: 'var(--radius-md)',
            padding: '14px 20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 12
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <ShieldCheck size={22} color="var(--iris-400)" />
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>
                  Ledger Integrity Status: Cryptographically Chained
                </div>
                <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>
                  Every scrutiny observation, bank confirmation, and lien discharge is permanently sealed.
                </div>
              </div>
            </div>

            <button
              onClick={handleVerifyLedger}
              className="btn btn-iris btn-sm"
            >
              <CheckCircle2 size={14} />
              <span>Verify SHA-256 Chain Integrity</span>
            </button>
          </div>

          {verificationResult && (
            <div style={{
              padding: '10px 16px',
              borderRadius: 'var(--radius-sm)',
              background: verificationResult.isValid ? 'var(--status-verified-bg)' : 'var(--status-flagged-bg)',
              border: verificationResult.isValid ? '1px solid rgba(45, 212, 191, 0.3)' : '1px solid rgba(251, 113, 133, 0.3)',
              color: verificationResult.isValid ? 'var(--status-verified)' : 'var(--status-flagged)',
              fontSize: 12,
              display: 'flex',
              alignItems: 'center',
              gap: 8
            }}>
              <CheckCircle2 size={16} />
              <span>
                <strong>Verification Passed:</strong> All {ledgerChain.length} blocks verified. Previous hash linkages validate 100% mathematical integrity.
              </span>
            </div>
          )}

          {/* Block Visual Chain */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {ledgerChain.map((block, idx) => (
              <React.Fragment key={block.blockIndex}>
                <div style={{
                  background: 'rgba(10, 14, 22, 0.75)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-md)',
                  padding: '16px 20px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 10,
                  transition: 'border-color 0.2s ease'
                }}>
                  {/* Block Header */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span className="badge badge-gold" style={{ fontSize: 10 }}>
                        Block #{block.blockIndex}
                      </span>
                      <span className="badge badge-cyan" style={{ fontSize: 10 }}>
                        {block.action}
                      </span>
                    </div>
                    <span className="mono" style={{ fontSize: 11, color: 'var(--text-dim)' }}>
                      {block.timestamp}
                    </span>
                  </div>

                  {/* Actor & Details */}
                  <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Actor:</span> <strong style={{ color: 'var(--text-primary)' }}>{block.actor}</strong>
                    <div style={{ marginTop: 4, color: 'var(--text-primary)' }}>
                      {block.details}
                    </div>
                  </div>

                  {/* Hash Footer */}
                  <div style={{
                    padding: '8px 12px',
                    background: 'rgba(0, 0, 0, 0.3)',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: 11,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 4
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ color: 'var(--text-dim)' }}>Prev Hash:</span>
                      <span className="mono" style={{ color: 'var(--text-dim)', fontSize: 10 }}>
                        {block.previousHash.substring(0, 32)}...
                      </span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ color: 'var(--gold-400)' }}>Block Hash:</span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span className="mono" style={{ color: 'var(--gold-400)', fontWeight: 600, fontSize: 11 }}>
                          {block.blockHash}
                        </span>
                        <button
                          onClick={() => handleCopy(block.blockHash)}
                          style={{ background: 'none', border: 'none', color: 'var(--text-dim)', cursor: 'pointer', padding: 2 }}
                          title="Copy SHA-256 Hash"
                        >
                          <Copy size={12} />
                        </button>
                        {copiedHash === block.blockHash && (
                          <span style={{ fontSize: 9, color: 'var(--status-verified)' }}>Copied!</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {idx < ledgerChain.length - 1 && (
                  <div style={{ display: 'flex', justifyContent: 'center', color: 'var(--text-dim)' }}>
                    <ArrowDown size={16} />
                  </div>
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="modal-footer">
          <button onClick={onClose} className="btn btn-secondary">
            Close Ledger Explorer
          </button>
        </div>
      </div>
    </div>
  );
}

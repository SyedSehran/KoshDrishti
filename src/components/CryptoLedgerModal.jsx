import React, { useState, useEffect } from 'react';
import { 
  X, 
  Link2, 
  ShieldCheck, 
  CheckCircle2, 
  AlertTriangle, 
  Copy, 
  Lock, 
  RefreshCw,
  Bug,
  RotateCcw,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Search,
  Filter,
  FileText,
  Key
} from 'lucide-react';

export default function CryptoLedgerModal({ onClose, onSelectInstrument }) {
  const [blocks, setBlocks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [verificationResult, setVerificationResult] = useState(null);
  const [copiedHash, setCopiedHash] = useState(null);
  const [actionNotice, setActionNotice] = useState(null);
  const [expandedBlockIndex, setExpandedBlockIndex] = useState(null);
  const [searchFilter, setSearchFilter] = useState('');
  const [actionFilter, setActionFilter] = useState('ALL');

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
      if (data.valid) {
        setActionNotice("Cryptographic verification successful: All SHA-256 block hashes and previous-hash pointers match 100%.");
      } else {
        setActionNotice(`Cryptographic violation flagged: ${data.error}`);
      }
    } catch (err) {
      setVerificationResult({ valid: false, error: "Failed to connect to backend verification API" });
    }
  };

  const handleTamperDemo = async () => {
    try {
      const token = localStorage.getItem('kosh_jwt_token') || '';
      const headers = { 'Content-Type': 'application/json' };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      const res = await fetch('http://127.0.0.1:8000/api/v1/ledger/tamper', { 
        method: 'POST',
        headers
      });
      const data = await res.json();
      if (res.ok) {
        setActionNotice(data.message || "Block #1 tampered successfully in database.");
        await fetchLedger();
        // Automatically run verification to visually demonstrate detection
        const vRes = await fetch('http://127.0.0.1:8000/api/v1/ledger/verify');
        const vData = await vRes.json();
        setVerificationResult(vData);
        setExpandedBlockIndex(1); // Auto-expand tampered block
      } else {
        setActionNotice(`Tamper simulation failed: ${data.error || 'Unauthorized'}`);
      }
    } catch (err) {
      console.error(err);
      setActionNotice("Connection error executing tamper demo");
    }
  };

  const handleRepairDemo = async () => {
    try {
      const token = localStorage.getItem('kosh_jwt_token') || '';
      const headers = { 'Content-Type': 'application/json' };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      const res = await fetch('http://127.0.0.1:8000/api/v1/ledger/repair', { 
        method: 'POST',
        headers
      });
      const data = await res.json();
      if (res.ok) {
        setActionNotice(data.message || "Block #1 restored. Cryptographic chain integrity repaired.");
        await fetchLedger();
        const vRes = await fetch('http://127.0.0.1:8000/api/v1/ledger/verify');
        const vData = await vRes.json();
        setVerificationResult(vData);
      } else {
        setActionNotice(`Repair simulation failed: ${data.error || 'Unauthorized'}`);
      }
    } catch (err) {
      console.error(err);
      setActionNotice("Connection error executing repair demo");
    }
  };

  const handleCopy = (e, text, label = 'hash') => {
    e.stopPropagation();
    navigator.clipboard?.writeText(text);
    setCopiedHash(label);
    setTimeout(() => setCopiedHash(null), 1600);
  };

  const handleDrilldownFdr = (e, fdrId) => {
    e.stopPropagation();
    if (onSelectInstrument) {
      onSelectInstrument(fdrId);
    }
  };

  // Filter blocks
  const filteredBlocks = blocks.filter(b => {
    const q = searchFilter.toLowerCase().trim();
    const matchesSearch = !q || 
      String(b.blockIndex).includes(q) ||
      (b.fdrId && b.fdrId.toLowerCase().includes(q)) ||
      (b.actor && b.actor.toLowerCase().includes(q)) ||
      (b.action && b.action.toLowerCase().includes(q)) ||
      (b.details && b.details.toLowerCase().includes(q));

    const matchesAction = actionFilter === 'ALL' || b.action === actionFilter;
    return matchesSearch && matchesAction;
  });

  const uniqueActions = ['ALL', ...new Set(blocks.map(b => b.action).filter(Boolean))];

  return (
    <div className="modal-backdrop" onClick={onClose} style={{ zIndex: 1100 }}>
      <div 
        className="modal-dialog" 
        style={{ maxWidth: 1040, maxHeight: '92vh', display: 'flex', flexDirection: 'column' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{
          padding: '18px 24px',
          borderBottom: '1px solid var(--border-medium)',
          background: 'var(--bg-muted)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexShrink: 0
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{
              width: 40,
              height: 40,
              borderRadius: 8,
              background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
            }}>
              <Link2 size={20} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                <h3 className="serif-heading" style={{ fontSize: 17, color: 'var(--ink-primary)', margin: 0 }}>
                  Cryptographic SHA-256 Merkle Regulatory Ledger
                </h3>
                <span className="mono" style={{
                  fontSize: 11,
                  background: 'var(--ink-primary)',
                  color: '#ffffff',
                  padding: '2px 8px',
                  borderRadius: 4,
                  fontWeight: 600
                }}>
                  Height: Block #{blocks.length > 0 ? blocks[blocks.length - 1].blockIndex : 0} ({blocks.length} Total)
                </span>
              </div>
              <div style={{ fontSize: 11.5, color: 'var(--ink-secondary)', marginTop: 2 }}>
                Real SHA-256 hash-chained regulatory ledger persisted in SQLite. Click any block or FDR badge to inspect forensic details.
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="btn btn-secondary btn-sm"
            style={{ width: 32, height: 32, borderRadius: '50%', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            title="Close Audit Log"
          >
            <X size={16} />
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
          gap: 10,
          flexShrink: 0
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            <button
              onClick={handleVerifyLedger}
              className="btn btn-ink-primary btn-sm"
              style={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6 }}
              title="Recomputes cryptographic SHA-256 hashes across all blocks to verify mathematical chain integrity"
            >
              <CheckCircle2 size={14} />
              <span>Verify Cryptographic Chain</span>
            </button>

            <button
              onClick={handleTamperDemo}
              className="btn btn-sm"
              style={{ background: '#fef2f2', border: '1px solid #fca5a5', color: '#b91c1c', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}
              title="Intentionally mutate block #1 in SQLite without hash update to test detection"
            >
              <Bug size={14} />
              <span>Tamper Row #1 (Judge Demo)</span>
            </button>

            <button
              onClick={handleRepairDemo}
              className="btn btn-sm"
              style={{ background: '#ecfdf5', border: '1px solid #a7f3d0', color: '#047857', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}
              title="Restore legitimate details and verify chain again"
            >
              <RotateCcw size={14} />
              <span>Restore Chain Integrity</span>
            </button>
          </div>

          <button
            onClick={fetchLedger}
            className="btn btn-paper btn-sm"
            style={{ fontSize: 11.5, display: 'flex', alignItems: 'center', gap: 6 }}
            title="Refresh latest blocks from SQLite database"
          >
            <RefreshCw size={13} />
            <span>Refresh from DB</span>
          </button>
        </div>

        {/* Action Notice Toast Banner */}
        {actionNotice && (
          <div style={{
            margin: '12px 24px 0',
            padding: '10px 14px',
            borderRadius: 'var(--radius-sm)',
            background: actionNotice.includes('violation') || actionNotice.includes('failed') ? '#fff1f2' : '#f0fdf4',
            border: actionNotice.includes('violation') || actionNotice.includes('failed') ? '1px solid #fda4af' : '1px solid #bbf7d0',
            color: actionNotice.includes('violation') || actionNotice.includes('failed') ? '#be123c' : '#15803d',
            fontSize: 12,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 10
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              {actionNotice.includes('violation') || actionNotice.includes('failed') ? (
                <AlertTriangle size={15} style={{ flexShrink: 0 }} />
              ) : (
                <CheckCircle2 size={15} style={{ flexShrink: 0 }} />
              )}
              <span>{actionNotice}</span>
            </div>
            <button
              onClick={() => setActionNotice(null)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit', padding: 0, opacity: 0.7 }}
            >
              <X size={13} />
            </button>
          </div>
        )}

        {/* Verification Status Alert */}
        {verificationResult && (
          <div style={{
            margin: '12px 24px 0',
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
            {verificationResult.valid ? <CheckCircle2 size={18} style={{ flexShrink: 0, marginTop: 1 }} /> : <AlertTriangle size={18} style={{ flexShrink: 0, marginTop: 1 }} />}
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, fontSize: 13 }}>
                {verificationResult.valid ? "Cryptographic Chain Fully Intact (100% Mathematically Valid)" : "Cryptographic Tampering Detected!"}
              </div>
              <div style={{ marginTop: 2, color: verificationResult.valid ? '#065f46' : '#7f1d1d', lineHeight: 1.4 }}>
                {verificationResult.valid 
                  ? `Recomputed SHA-256 hashes across all ${verificationResult.total_blocks} blocks. Previous-hash pointers and checkpoint head hash match exactly.`
                  : verificationResult.error}
              </div>
            </div>
          </div>
        )}

        {/* Filter and Search Bar */}
        <div style={{
          padding: '10px 24px',
          background: 'var(--bg-subtle)',
          borderBottom: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          flexWrap: 'wrap'
        }}>
          <div style={{ position: 'relative', flex: 1, minWidth: 220 }}>
            <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--ink-muted)' }} />
            <input
              type="text"
              placeholder="Search by Block #, FDR ID, Actor, or Action..."
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              style={{
                width: '100%',
                padding: '6px 10px 6px 32px',
                fontSize: 12,
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border-medium)',
                background: '#ffffff',
                boxSizing: 'border-box'
              }}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Filter size={13} color="var(--ink-muted)" />
            <span style={{ fontSize: 11.5, color: 'var(--ink-muted)', fontWeight: 600 }}>Action:</span>
            <select
              value={actionFilter}
              onChange={(e) => setActionFilter(e.target.value)}
              style={{
                padding: '5px 8px',
                fontSize: 11.5,
                borderRadius: 'var(--radius-xs)',
                border: '1px solid var(--border-medium)',
                background: '#ffffff',
                cursor: 'pointer'
              }}
            >
              {uniqueActions.map(act => (
                <option key={act} value={act}>{act}</option>
              ))}
            </select>
          </div>

          <span style={{ fontSize: 11.5, color: 'var(--ink-muted)', marginLeft: 'auto' }}>
            Showing <strong>{filteredBlocks.length}</strong> of {blocks.length} blocks
          </span>
        </div>

        {/* Blocks Scroll View */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px 24px', display: 'flex', flexDirection: 'column', gap: 12 }}>
          {isLoading ? (
            <div style={{ textAlign: 'center', padding: '40px', color: 'var(--ink-muted)' }}>
              Loading cryptographic ledger from SQLite...
            </div>
          ) : filteredBlocks.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px', color: 'var(--ink-muted)' }}>
              No audit records matching criteria.
            </div>
          ) : (
            filteredBlocks.map((block) => {
              const isExpanded = expandedBlockIndex === block.blockIndex;
              const isTamperedBlock = verificationResult && !verificationResult.valid && verificationResult.tampered_block_index === block.blockIndex;
              const rawString = `${block.blockIndex}:${block.previousHash}:${block.timestamp}:${block.action}:${block.actor}:${block.fdrId}:${block.details}`;

              return (
                <div 
                  key={block.blockIndex}
                  className="paper-card"
                  onClick={() => setExpandedBlockIndex(isExpanded ? null : block.blockIndex)}
                  style={{
                    padding: 16,
                    borderLeft: isTamperedBlock ? '5px solid #dc2626' : '4px solid var(--ink-primary)',
                    background: isTamperedBlock ? '#fef2f2' : isExpanded ? '#fbfaf7' : '#ffffff',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 10,
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                    boxShadow: isExpanded ? '0 4px 14px rgba(0,0,0,0.08)' : 'var(--shadow-card)',
                    border: isTamperedBlock ? '1.5px solid #fca5a5' : undefined
                  }}
                >
                  {/* Block Header Strip */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                      <span className="mono" style={{ fontWeight: 700, fontSize: 12, background: 'var(--bg-muted)', padding: '3px 8px', borderRadius: 4 }}>
                        Block #{block.blockIndex}
                      </span>

                      <span className="badge-clean badge-warning" style={{ fontSize: 10.5, fontWeight: 700 }}>
                        {block.action}
                      </span>

                      {/* Clickable FDR Badge with Drill-down Hook */}
                      {block.fdrId && (
                        <button
                          type="button"
                          onClick={(e) => handleDrilldownFdr(e, block.fdrId)}
                          style={{
                            background: '#e0f2fe',
                            border: '1px solid #7dd3fc',
                            color: '#0369a1',
                            padding: '2px 8px',
                            borderRadius: 4,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 4,
                            fontSize: 11,
                            fontWeight: 600
                          }}
                          title={`Click to open 360° Case File for ${block.fdrId}`}
                        >
                          <FileText size={11} />
                          <span className="mono">{block.fdrId}</span>
                          <ExternalLink size={10} />
                        </button>
                      )}

                      {isTamperedBlock && (
                        <span style={{
                          background: '#dc2626',
                          color: '#ffffff',
                          padding: '2px 8px',
                          borderRadius: 3,
                          fontSize: 10,
                          fontWeight: 700,
                          letterSpacing: '0.04em'
                        }}>
                          TAMPERED ROW
                        </span>
                      )}
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <span className="mono" style={{ fontSize: 11, color: 'var(--ink-muted)' }}>
                        {block.timestamp}
                      </span>
                      {isExpanded ? <ChevronUp size={15} color="var(--ink-muted)" /> : <ChevronDown size={15} color="var(--ink-muted)" />}
                    </div>
                  </div>

                  {/* Block Body */}
                  <div style={{ fontSize: 12.5, color: 'var(--ink-secondary)' }}>
                    <span style={{ color: 'var(--ink-muted)', fontSize: 11 }}>Actor:</span> <strong>{block.actor}</strong>
                    <div style={{ marginTop: 4, color: isTamperedBlock ? '#991b1b' : 'var(--ink-primary)', lineHeight: 1.45, fontWeight: isTamperedBlock ? 600 : 400 }}>
                      {block.details}
                    </div>
                  </div>

                  {/* Compact Hash Strip */}
                  <div style={{
                    padding: '8px 12px',
                    background: isTamperedBlock ? '#fee2e2' : 'var(--bg-subtle)',
                    border: isTamperedBlock ? '1px solid #f87171' : '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-xs)',
                    fontSize: 10.5,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 4
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ color: 'var(--ink-muted)' }}>Prev Hash:</span>
                      <span className="mono" style={{ color: 'var(--ink-muted)', maxWidth: '80%', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {block.previousHash}
                      </span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontWeight: 600, color: 'var(--ink-primary)' }}>Block Hash (SHA-256):</span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span className="mono" style={{ fontWeight: 700, color: isTamperedBlock ? '#dc2626' : '#047857' }}>
                          {block.blockHash}
                        </span>
                        <button
                          type="button"
                          onClick={(e) => handleCopy(e, block.blockHash, `hash-${block.blockIndex}`)}
                          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 2, display: 'flex', alignItems: 'center' }}
                          title="Copy SHA-256 hash"
                        >
                          {copiedHash === `hash-${block.blockIndex}` ? (
                            <span style={{ color: '#047857', fontSize: 10, fontWeight: 700 }}>Copied!</span>
                          ) : (
                            <Copy size={11} color="var(--ink-muted)" />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Deep Forensic Inspection Panel (Expandable) */}
                  {isExpanded && (
                    <div style={{
                      marginTop: 8,
                      padding: 14,
                      background: '#ffffff',
                      border: '1px solid var(--border-medium)',
                      borderRadius: 'var(--radius-sm)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 10
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span style={{ fontSize: 11.5, fontWeight: 700, color: 'var(--ink-primary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                          Forensic Merkle Proof & Pre-Image
                        </span>
                        <div style={{ display: 'flex', gap: 8 }}>
                          {block.fdrId && (
                            <button
                              type="button"
                              onClick={(e) => handleDrilldownFdr(e, block.fdrId)}
                              className="btn btn-ink-primary btn-sm"
                              style={{ fontSize: 11, padding: '3px 8px' }}
                            >
                              <span>Open {block.fdrId} Dossier</span>
                              <ExternalLink size={11} />
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={(e) => handleCopy(e, rawString, `raw-${block.blockIndex}`)}
                            className="btn btn-paper btn-sm"
                            style={{ fontSize: 11, padding: '3px 8px' }}
                          >
                            {copiedHash === `raw-${block.blockIndex}` ? "Copied String!" : "Copy Raw Pre-Image"}
                          </button>
                        </div>
                      </div>

                      <div style={{ fontSize: 11, color: 'var(--ink-secondary)', background: '#f8fafc', padding: 10, borderRadius: 4, border: '1px solid #e2e8f0' }}>
                        <div style={{ fontWeight: 600, color: 'var(--ink-primary)', marginBottom: 4 }}>
                          Mathematical Pre-Image Formula:
                        </div>
                        <code className="mono" style={{ fontSize: 10.5, color: '#334155', wordBreak: 'break-all' }}>
                          SHA256( {rawString} )
                        </code>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 8, fontSize: 11 }}>
                        <div style={{ padding: '6px 10px', background: 'var(--bg-subtle)', borderRadius: 4 }}>
                          <span style={{ color: 'var(--ink-muted)' }}>Index: </span>
                          <strong>Block #{block.blockIndex}</strong>
                        </div>
                        <div style={{ padding: '6px 10px', background: 'var(--bg-subtle)', borderRadius: 4 }}>
                          <span style={{ color: 'var(--ink-muted)' }}>Linkage Status: </span>
                          <strong style={{ color: block.blockIndex === 0 ? '#0284c7' : '#047857' }}>
                            {block.blockIndex === 0 ? 'Root Genesis Node' : `Chained to Block #${block.blockIndex - 1}`}
                          </strong>
                        </div>
                        <div style={{ padding: '6px 10px', background: 'var(--bg-subtle)', borderRadius: 4 }}>
                          <span style={{ color: 'var(--ink-muted)' }}>Action Type: </span>
                          <strong>{block.action}</strong>
                        </div>
                        <div style={{ padding: '6px 10px', background: 'var(--bg-subtle)', borderRadius: 4 }}>
                          <span style={{ color: 'var(--ink-muted)' }}>Recorded At: </span>
                          <span className="mono">{block.timestamp}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div style={{
          padding: '14px 24px',
          borderTop: '1px solid var(--border-medium)',
          background: 'var(--bg-muted)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 10,
          flexShrink: 0
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

import React, { useState, useEffect } from 'react';
import { X, RefreshCw, CheckCircle, AlertCircle, GitBranch, Loader } from 'lucide-react';

const API = 'http://127.0.0.1:8000';
const BANKS = [
  'State Bank of India', 'Punjab National Bank', 'Canara Bank',
  'Bank of Baroda', 'HDFC Bank', 'ICICI Bank'
];
const RENEWAL_TYPES = ['Rollover Renewal', 'Replacement FDR', 'e-Bank Guarantee Replacement'];

export default function RenewalModal({ fdrRecord, authToken, onClose, onSuccess }) {
  const [renewalType, setRenewalType] = useState('Rollover Renewal');
  const [fdrNumber, setFdrNumber] = useState('');
  const [amount, setAmount] = useState(fdrRecord?.amount || 3500000);
  const [issuingBank, setIssuingBank] = useState(fdrRecord?.issuingBank || 'State Bank of India');
  const [ifsc, setIfsc] = useState(fdrRecord?.ifsc || '');
  const [tenorYears, setTenorYears] = useState(10);
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState(null); // { type, message }
  const [lineage, setLineage] = useState([]);

  useEffect(() => {
    if (!fdrRecord?.id) return;
    fetch(`${API}/api/v1/instruments/${fdrRecord.id}/lineage`)
      .then(r => r.json())
      .then(d => setLineage(d.lineage || []))
      .catch(() => setLineage([]));
  }, [fdrRecord?.id]);

  if (!fdrRecord) return null;

  const handleSubmit = async () => {
    if (!fdrNumber.trim()) {
      setStatus({ type: 'error', message: 'New FDR Number is required.' });
      return;
    }
    setIsSubmitting(true);
    setStatus(null);
    try {
      const token = authToken || localStorage.getItem('kosh_jwt_token') || '';
      const res = await fetch(`${API}/api/v1/instruments/${fdrRecord.id}/renew`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          renewalType,
          fdrNumber: fdrNumber.trim(),
          amount: parseFloat(amount),
          issuingBank,
          ifsc: ifsc.trim(),
          tenorYears: parseInt(tenorYears),
          notes: notes.trim()
        })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setStatus({ type: 'success', message: `${renewalType} submitted. New FDR ID: ${data.newInstrumentId}` });
        if (onSuccess) onSuccess(data);
      } else {
        setStatus({ type: 'error', message: data.error || 'Submission failed.' });
      }
    } catch {
      setStatus({ type: 'error', message: 'Network error. Please check backend connection.' });
    }
    setIsSubmitting(false);
  };

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(15, 23, 42, 0.75)',
        backdropFilter: 'blur(5px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 110000,
        padding: 16
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: '#fff', borderRadius: 12, padding: 0,
          width: '100%', maxWidth: 640, maxHeight: '90vh', overflowY: 'auto',
          boxShadow: '0 20px 60px rgba(0,0,0,0.2)'
        }}
      >
        {/* Header */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '16px 24px', borderBottom: '1px solid #e5e7eb',
          background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <RefreshCw size={18} color="#FF6B35" />
            <div>
              <div style={{ color: '#fff', fontWeight: 700, fontSize: 15 }}>Submit FDR Renewal / Replacement</div>
              <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: 12, marginTop: 2 }}>
                For: {fdrRecord.institutionName} &bull; {fdrRecord.fdrNumber}
              </div>
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.7)' }}>
            <X size={20} />
          </button>
        </div>

        <div style={{ padding: 24 }}>
          {/* Existing Lineage */}
          {lineage.length > 0 && (
            <div style={{ marginBottom: 20, padding: 12, background: '#f0f4ff', borderRadius: 8, border: '1px solid #c7d2fe' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 700, color: '#3730a3', marginBottom: 8 }}>
                <GitBranch size={14} /> Existing Renewal Chain ({lineage.length} record{lineage.length !== 1 ? 's' : ''})
              </div>
              {lineage.map(l => (
                <div key={l.id} style={{ fontSize: 12, color: '#4338ca', padding: '4px 0', borderTop: '1px solid #c7d2fe' }}>
                  <strong>{l.renewalType}</strong> &rarr; {l.newFdrNumber} &bull; ₹{(l.newAmount || 0).toLocaleString('en-IN')} &bull; {l.renewalDate} &bull; {l.newStatus}
                </div>
              ))}
            </div>
          )}

          {/* Renewal Type */}
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>
              Renewal / Replacement Type *
            </label>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {RENEWAL_TYPES.map(t => (
                <button
                  key={t}
                  onClick={() => setRenewalType(t)}
                  style={{
                    padding: '6px 14px', borderRadius: 20, border: '1.5px solid',
                    borderColor: renewalType === t ? '#FF6B35' : '#d1d5db',
                    background: renewalType === t ? '#FFF0EB' : '#fff',
                    color: renewalType === t ? '#FF6B35' : '#6b7280',
                    cursor: 'pointer', fontSize: 13, fontWeight: 600
                  }}
                >{t}</button>
              ))}
            </div>
          </div>

          {/* New FDR Number */}
          <div style={{ marginBottom: 14 }}>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>
              New FDR / Instrument Number *
            </label>
            <input
              value={fdrNumber}
              onChange={e => setFdrNumber(e.target.value)}
              placeholder="e.g. FDR/SBI/2026-RENEW/00423"
              style={{
                width: '100%', padding: '8px 12px', borderRadius: 6, fontSize: 14,
                border: '1.5px solid #d1d5db', outline: 'none', boxSizing: 'border-box'
              }}
            />
          </div>

          {/* Amount + Bank in grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>
                Deposit Amount (₹)
              </label>
              <input
                type="number"
                value={amount}
                onChange={e => setAmount(e.target.value)}
                style={{ width: '100%', padding: '8px 12px', borderRadius: 6, fontSize: 14, border: '1.5px solid #d1d5db', boxSizing: 'border-box' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>
                Tenor (Years)
              </label>
              <select
                value={tenorYears}
                onChange={e => setTenorYears(e.target.value)}
                style={{ width: '100%', padding: '8px 12px', borderRadius: 6, fontSize: 14, border: '1.5px solid #d1d5db', background: '#fff', boxSizing: 'border-box' }}
              >
                {[5, 7, 10, 12, 15].map(y => <option key={y} value={y}>{y} Years</option>)}
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>
                Issuing Bank
              </label>
              <select
                value={issuingBank}
                onChange={e => setIssuingBank(e.target.value)}
                style={{ width: '100%', padding: '8px 12px', borderRadius: 6, fontSize: 14, border: '1.5px solid #d1d5db', background: '#fff', boxSizing: 'border-box' }}
              >
                {BANKS.map(b => <option key={b} value={b}>{b}</option>)}
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>
                IFSC Code
              </label>
              <input
                value={ifsc}
                onChange={e => setIfsc(e.target.value)}
                placeholder="e.g. SBIN0006240"
                style={{ width: '100%', padding: '8px 12px', borderRadius: 6, fontSize: 14, border: '1.5px solid #d1d5db', boxSizing: 'border-box' }}
              />
            </div>
          </div>

          {/* Notes */}
          <div style={{ marginBottom: 20 }}>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>
              Remarks / Notes
            </label>
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              rows={3}
              placeholder="Reason for renewal, reference to previous FDR, etc."
              style={{
                width: '100%', padding: '8px 12px', borderRadius: 6, fontSize: 13,
                border: '1.5px solid #d1d5db', resize: 'vertical', boxSizing: 'border-box', fontFamily: 'inherit'
              }}
            />
          </div>

          {/* Status feedback */}
          {status && (
            <div style={{
              display: 'flex', alignItems: 'flex-start', gap: 8, padding: '10px 14px',
              borderRadius: 7, marginBottom: 16, fontSize: 13,
              background: status.type === 'success' ? '#e8f5e9' : '#fdecea',
              color: status.type === 'success' ? '#1b5e20' : '#b71c1c'
            }}>
              {status.type === 'success' ? <CheckCircle size={15} style={{ flexShrink: 0, marginTop: 1 }} /> : <AlertCircle size={15} style={{ flexShrink: 0, marginTop: 1 }} />}
              {status.message}
            </div>
          )}

          {/* Actions */}
          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
            <button
              onClick={onClose}
              style={{
                padding: '9px 20px', borderRadius: 6, border: '1px solid #d1d5db',
                background: '#fff', cursor: 'pointer', fontSize: 14, color: '#374151', fontWeight: 600
              }}
            >Cancel</button>
            <button
              onClick={handleSubmit}
              disabled={isSubmitting || status?.type === 'success'}
              style={{
                padding: '9px 24px', borderRadius: 6, border: 'none',
                background: status?.type === 'success' ? '#4caf50' : '#FF6B35',
                color: '#fff', cursor: isSubmitting ? 'not-allowed' : 'pointer',
                fontSize: 14, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8, opacity: isSubmitting ? 0.7 : 1
              }}
            >
              {isSubmitting ? <><Loader size={14} style={{ animation: 'spin 1s linear infinite' }} /> Submitting...</> : status?.type === 'success' ? <><CheckCircle size={14} /> Submitted</> : <><RefreshCw size={14} /> Submit Renewal</>}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

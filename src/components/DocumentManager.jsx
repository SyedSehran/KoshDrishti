import React, { useState, useEffect, useRef } from 'react';
import { Upload, FileText, Download, Trash2, CheckCircle, AlertCircle, Loader } from 'lucide-react';

const API = 'http://127.0.0.1:8000';

export default function DocumentManager({ instrumentId, authToken, readOnly = false }) {
  const [documents, setDocuments] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState(null); // { type: 'success'|'error', message }
  const fileInputRef = useRef(null);

  const fetchDocuments = () => {
    if (!instrumentId) return;
    setIsLoading(true);
    fetch(`${API}/api/v1/documents?instrument_id=${encodeURIComponent(instrumentId)}`)
      .then(r => r.json())
      .then(data => setDocuments(data.documents || []))
      .catch(() => setDocuments([]))
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    fetchDocuments();
  }, [instrumentId]);

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const maxSize = 5 * 1024 * 1024; // 5 MB
    if (file.size > maxSize) {
      setUploadStatus({ type: 'error', message: 'File too large. Maximum size is 5 MB.' });
      return;
    }

    setIsUploading(true);
    setUploadStatus(null);

    try {
      const reader = new FileReader();
      reader.onload = async (ev) => {
        const base64 = ev.target.result.split(',')[1];
        const token = authToken || localStorage.getItem('kosh_jwt_token') || '';
        const res = await fetch(`${API}/api/v1/documents`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {})
          },
          body: JSON.stringify({
            instrumentId,
            filename: file.name,
            contentType: file.type || 'application/octet-stream',
            fileData: base64
          })
        });

        const data = await res.json();
        if (res.ok && data.success) {
          setUploadStatus({ type: 'success', message: `"${file.name}" stored successfully (${(file.size / 1024).toFixed(1)} KB)` });
          fetchDocuments();
        } else {
          setUploadStatus({ type: 'error', message: data.error || 'Upload failed. Please try again.' });
        }
        setIsUploading(false);
      };
      reader.readAsDataURL(file);
    } catch {
      setUploadStatus({ type: 'error', message: 'Network error during upload.' });
      setIsUploading(false);
    }

    // Reset file input
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleDownload = (doc) => {
    const link = document.createElement('a');
    link.href = `${API}/api/v1/documents/${doc.id}`;
    link.setAttribute('download', doc.filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const formatSize = (bytes) => {
    if (!bytes) return '—';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  const formatDate = (iso) => {
    if (!iso) return '—';
    return new Date(iso).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div style={{ border: '1px solid var(--border-medium, #ddd)', borderRadius: 8, padding: 16, background: 'var(--bg-muted, #f8f9fa)' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <h4 style={{ margin: 0, fontSize: 14, fontWeight: 700, color: 'var(--text-primary, #1a1a2e)' }}>
          Stored Documents ({documents.length})
        </h4>
        {!readOnly && (
          <label style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            background: 'var(--accent-saffron, #FF6B35)', color: '#fff',
            padding: '6px 14px', borderRadius: 6, cursor: 'pointer',
            fontSize: 13, fontWeight: 600
          }}>
            {isUploading
              ? <><Loader size={14} style={{ animation: 'spin 1s linear infinite' }} /> Uploading...</>
              : <><Upload size={14} /> Upload FDR Document</>}
            <input
              type="file"
              accept=".pdf,.jpg,.jpeg,.png,.txt"
              style={{ display: 'none' }}
              ref={fileInputRef}
              onChange={handleFileUpload}
              disabled={isUploading}
            />
          </label>
        )}
      </div>

      {uploadStatus && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px',
          borderRadius: 6, marginBottom: 10, fontSize: 13,
          background: uploadStatus.type === 'success' ? '#e8f5e9' : '#fdecea',
          color: uploadStatus.type === 'success' ? '#2e7d32' : '#c62828'
        }}>
          {uploadStatus.type === 'success'
            ? <CheckCircle size={14} />
            : <AlertCircle size={14} />}
          {uploadStatus.message}
        </div>
      )}

      {isLoading ? (
        <div style={{ textAlign: 'center', padding: '20px', color: 'var(--text-muted, #666)' }}>
          <Loader size={20} style={{ animation: 'spin 1s linear infinite' }} />
          <p style={{ marginTop: 8, fontSize: 13 }}>Loading documents...</p>
        </div>
      ) : documents.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '20px 0', color: 'var(--text-muted, #888)', fontSize: 13 }}>
          <FileText size={28} strokeWidth={1.5} style={{ marginBottom: 6, opacity: 0.5 }} />
          <p style={{ margin: 0 }}>No documents stored yet for this instrument.</p>
          {!readOnly && <p style={{ margin: '4px 0 0', fontSize: 12 }}>Upload FDR PDFs or scanned copies using the button above.</p>}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {documents.map(doc => (
            <div key={doc.id} style={{
              display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px',
              background: '#fff', borderRadius: 6, border: '1px solid var(--border-light, #e5e7eb)'
            }}>
              <FileText size={18} color="#FF6B35" strokeWidth={1.5} style={{ flexShrink: 0 }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary, #1a1a2e)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {doc.filename}
                </div>
                <div style={{ fontSize: 11, color: 'var(--text-muted, #888)', marginTop: 2 }}>
                  {formatSize(doc.fileSize)} &bull; Uploaded by {doc.uploadedBy} &bull; {formatDate(doc.uploadedAt)}
                </div>
              </div>
              <button
                onClick={() => handleDownload(doc)}
                title="Download document"
                style={{
                  background: 'transparent', border: '1px solid var(--border-medium, #ccc)',
                  borderRadius: 5, padding: '4px 8px', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', gap: 4,
                  color: 'var(--text-secondary, #555)', fontSize: 12
                }}
              >
                <Download size={13} /> Download
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

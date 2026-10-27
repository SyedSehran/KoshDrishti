import React, { StrictMode, Component } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("KoshDrishti UI Error Boundary Caught:", error, errorInfo);
    this.setState({ errorInfo });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          padding: 32,
          margin: 32,
          fontFamily: 'system-ui, sans-serif',
          background: '#fff',
          borderRadius: 12,
          border: '1px solid #fee2e2',
          boxShadow: '0 10px 25px rgba(0,0,0,0.08)'
        }}>
          <h2 style={{ color: '#dc2626', margin: '0 0 12px' }}>⚠️ Portal Rendering Error Encountered</h2>
          <p style={{ color: '#4b5563', fontSize: 14 }}>
            An unexpected error occurred while mounting the component tree:
          </p>
          <pre style={{
            background: '#fef2f2',
            color: '#991b1b',
            padding: 16,
            borderRadius: 8,
            overflowX: 'auto',
            fontSize: 13,
            lineHeight: 1.5
          }}>
            {this.state.error?.toString()}
            {'\n\n'}
            {this.state.errorInfo?.componentStack}
          </pre>
          <button
            onClick={() => window.location.reload()}
            style={{
              marginTop: 16,
              padding: '8px 16px',
              background: '#0284c7',
              color: '#fff',
              border: 'none',
              borderRadius: 6,
              cursor: 'pointer',
              fontWeight: 600
            }}
          >
            Reload Page
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
)

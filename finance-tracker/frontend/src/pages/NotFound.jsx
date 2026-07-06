import React from 'react';
import { Link } from 'react-router-dom';
import { AlertCircle, Home } from 'lucide-react';

export default function NotFound() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '80vh', textAlign: 'center', gap: '20px' }}>
      <AlertCircle size={64} style={{ color: 'var(--danger)' }} />
      <h1 style={{ fontSize: '3rem', margin: 0 }}>404</h1>
      <h2>Page Not Found</h2>
      <p style={{ color: 'var(--text-secondary)', maxWidth: '400px' }}>
        The page you are looking for doesn't exist or has been moved.
      </p>
      <Link to="/" className="btn btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', marginTop: '10px' }}>
        <Home size={18} />
        <span>Back to Dashboard</span>
      </Link>
    </div>
  );
}

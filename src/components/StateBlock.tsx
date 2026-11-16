import type { ReactNode } from 'react';

export function Loading({ label = 'Caricamento… (Loading…)' }: { label?: string }) {
  return (
    <div style={{ padding: '3rem 1rem', textAlign: 'center', color: 'var(--muted)' }}>
      <div className="spinner" />
      <p style={{ marginTop: '0.75rem', fontSize: '0.95rem' }}>{label}</p>
    </div>
  );
}

export function Empty({ label = 'Nessun elemento trovato. (No items found.)', action }: { label?: string; action?: ReactNode }) {
  return (
    <div style={{ padding: '3rem 1.5rem', textAlign: 'center', background: 'var(--card-bg)', borderRadius: '12px', border: '1px dashed var(--border)' }}>
      <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>📖</div>
      <p style={{ color: 'var(--muted)', margin: 0, fontSize: '0.95rem' }}>{label}</p>
      {action && <div style={{ marginTop: '1rem' }}>{action}</div>}
    </div>
  );
}

export function ErrorBox({ message }: { message: string }) {
  return (
    <div style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#991b1b', padding: '12px 16px', borderRadius: '8px', marginBottom: '1rem', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
      <span>⚠️</span>
      <span>{message}</span>
    </div>
  );
}

export function SuccessBox({ message }: { message: string }) {
  return (
    <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', color: '#166534', padding: '12px 16px', borderRadius: '8px', marginBottom: '1rem', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
      <span>✅</span>
      <span>{message}</span>
    </div>
  );
}

export function StateBlock({
  type,
  title,
  message,
  action,
}: {
  type: 'loading' | 'empty' | 'error' | 'success';
  title?: string;
  message?: string;
  action?: ReactNode;
}) {
  if (type === 'loading') {
    return <Loading label={message || title || 'Caricamento…'} />;
  }
  if (type === 'empty') {
    return (
      <Empty
        label={message ? `${title ? `${title} — ` : ''}${message}` : title || 'No items found'}
        action={action}
      />
    );
  }
  if (type === 'error') {
    return <ErrorBox message={message || title || 'An error occurred'} />;
  }
  return <SuccessBox message={message || title || 'Operation successful'} />;
}

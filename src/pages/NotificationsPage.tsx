import { useAsync } from '../hooks/useAsync';
import { notificationsApi } from '../services/api';
import { Empty, ErrorState, Loading } from '../components/ui';
import './pages.css';

const TYPE_EMOJI: Record<string, string> = {
  ClassReminder: '🎥',
  ClassStarted: '🔴',
  Announcement: '📢',
  Assignment: '📝',
  System: '⚙️',
};

export function NotificationsPage() {
  const { data, error, loading, reload, setData } = useAsync(() => notificationsApi.list());

  if (loading && !data) return <Loading label="Loading notifications…" />;
  if (error || !data) return <ErrorState message={error ?? 'Could not load notifications.'} onRetry={reload} />;

  const items = [...data].sort((a, b) => +new Date(b.createdAtUtc) - +new Date(a.createdAtUtc));
  const unread = items.filter((n) => !n.isRead);

  async function markRead(id: string) {
    setData((prev) => prev?.map((n) => (n.id === id ? { ...n, isRead: true } : n)) ?? prev);
    try {
      await notificationsApi.markRead(id);
    } catch {
      /* not critical */
    }
  }

  async function markAll() {
    await Promise.all(unread.map((n) => markRead(n.id)));
  }

  return (
    <div className="page">
      <div className="page-head">
        <div>
          <h1>Notifications</h1>
          <p>Class reminders and news from your teachers.</p>
        </div>
        {unread.length > 0 && <button className="btn btn-sm" onClick={() => void markAll()}>Mark all as read</button>}
      </div>

      <div className="card" style={{ overflow: 'hidden' }}>
        {items.length === 0 ? (
          <Empty icon="🔔" title="You're all caught up">No notifications yet.</Empty>
        ) : (
          items.map((n, i) => (
            <div key={n.id} className={`note ${n.isRead ? '' : 'unread'}`} style={{ borderTop: i ? '1px solid var(--line)' : undefined }}
              onClick={() => !n.isRead && void markRead(n.id)} role={n.isRead ? undefined : 'button'} tabIndex={n.isRead ? undefined : 0}>
              <span className={`note-dot ${n.isRead ? 'read' : ''}`} />
              <span style={{ fontSize: 24 }}>{TYPE_EMOJI[n.type] ?? '🔔'}</span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <strong>{n.title}</strong>
                <p className="muted small">{n.message}</p>
                <span className="small muted">{new Date(n.createdAtUtc).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

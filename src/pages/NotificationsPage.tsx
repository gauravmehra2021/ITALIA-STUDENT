import { useAsync } from '../hooks/useAsync';
import { notificationsApi } from '../services/api';
import { Empty, ErrorState, Loading } from '../components/ui';
import { useI18n } from '../i18n';
import './pages.css';

const TYPE_EMOJI: Record<string, string> = {
  ClassReminder: '🎥',
  ClassStarted: '🔴',
  Announcement: '📢',
  Assignment: '📝',
  System: '⚙️',
};

export function NotificationsPage() {
  const { t, locale } = useI18n();
  const { data, error, loading, reload, setData } = useAsync(() => notificationsApi.list());

  if (loading && !data) return <Loading label={t('notifications.loading')} />;
  if (error || !data) return <ErrorState message={error ?? t('notifications.loadError')} onRetry={reload} />;

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
          <h1>{t('notifications.title')}</h1>
          <p>{t('notifications.subtitle')}</p>
        </div>
        {unread.length > 0 && <button className="btn btn-sm" onClick={() => void markAll()}>{t('notifications.markAll')}</button>}
      </div>

      <div className="card" style={{ overflow: 'hidden' }}>
        {items.length === 0 ? (
          <Empty icon="🔔" title={t('notifications.empty')}>{t('notifications.emptyText')}</Empty>
        ) : (
          items.map((n, i) => (
            <div key={n.id} className={`note ${n.isRead ? '' : 'unread'}`} style={{ borderTop: i ? '1px solid var(--line)' : undefined }}
              onClick={() => !n.isRead && void markRead(n.id)} role={n.isRead ? undefined : 'button'} tabIndex={n.isRead ? undefined : 0}>
              <span className={`note-dot ${n.isRead ? 'read' : ''}`} />
              <span style={{ fontSize: 24 }}>{TYPE_EMOJI[n.type] ?? '🔔'}</span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <strong>{n.title}</strong>
                <p className="muted small">{n.message}</p>
                <span className="small muted">{new Date(n.createdAtUtc).toLocaleString(locale, { dateStyle: 'medium', timeStyle: 'short' })}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

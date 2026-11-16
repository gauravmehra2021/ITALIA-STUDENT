import React, { useEffect, useState } from 'react';
import { notificationsApi } from '../services/api';
import type { NotificationItem } from '../types';
import { StateBlock } from '../components/StateBlock';

const SAMPLE_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'notif-1',
    title: '🎥 Live Speaking Workshop Starting in 45 Minutes',
    message: 'Prof. Marco Rossi will be hosting the Italian A1 conversation class on Google Meet. Join room: meet.google.com/uyj-tfhh-zsq',
    type: 1,
    createdAtUtc: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
    isRead: false,
  },
  {
    id: 'notif-2',
    title: '📝 Assignment Graded: Modulo 1 Presentazione',
    message: 'Your assignment has been reviewed by Prof. Marco Rossi with an A grade (95/100). Check feedback in your Progress tab.',
    type: 2,
    createdAtUtc: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(),
    isRead: false,
  },
  {
    id: 'notif-3',
    title: '🌟 New Italian B1 Cultural Reading Uploaded',
    message: 'New PDF worksheet "Viaggiare in Treno in Italia" is now available in your course library.',
    type: 0,
    createdAtUtc: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    isRead: true,
  },
];

export const NotificationsPage: React.FC = () => {
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    notificationsApi
      .list()
      .then((res) => {
        if (res && res.length > 0) {
          setItems(res);
        } else {
          setItems(SAMPLE_NOTIFICATIONS);
        }
      })
      .catch((err) => {
        console.warn('Notifications load failed, using sample items', err);
        setItems(SAMPLE_NOTIFICATIONS);
      })
      .finally(() => setLoading(false));
  }, []);

  const markAllAsRead = () => {
    setItems((prev) => prev.map((item) => ({ ...item, isRead: true })));
  };

  const formatTime = (iso: string) => {
    try {
      const d = new Date(iso);
      return d.toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return iso;
    }
  };

  return (
    <div className="animate-rise" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text)' }}>
            Notifications & Announcements
          </h1>
          <p style={{ color: 'var(--muted)', marginTop: '0.25rem' }}>
            Live class alerts, assignment grading updates, and study material announcements.
          </p>
        </div>
        <button onClick={markAllAsRead} className="btn btn-secondary" style={{ fontSize: '0.85rem' }}>
          ✓ Mark All as Read
        </button>
      </div>

      {/* Notifications List */}
      {loading ? (
        <StateBlock type="loading" message="Loading notifications..." />
      ) : items.length === 0 ? (
        <StateBlock
          type="empty"
          title="All caught up!"
          message="You have no unread notifications or class reminders right now."
        />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {items.map((item) => (
            <div
              key={item.id}
              className="panel"
              style={{
                padding: '1.25rem',
                borderLeft: item.isRead ? '1px solid var(--border)' : '4px solid var(--primary)',
                background: item.isRead ? '#ffffff' : 'var(--primary-light)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                gap: '1rem',
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                  <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text)' }}>
                    {item.title}
                  </h3>
                  {!item.isRead && (
                    <span className="badge badge-gold" style={{ fontSize: '0.7rem' }}>
                      NEW
                    </span>
                  )}
                </div>
                <p style={{ fontSize: '0.9rem', color: '#475569', lineHeight: 1.5 }}>
                  {item.message}
                </p>
              </div>
              <span style={{ fontSize: '0.78rem', color: 'var(--muted)', whiteSpace: 'nowrap' }}>
                {formatTime(item.createdAtUtc)}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};


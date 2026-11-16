import React, { useEffect, useState } from 'react';
import { classesApi } from '../services/api';
import type { ClassSession } from '../types';
import { StateBlock } from '../components/StateBlock';

const GOOGLE_MEET_DEFAULT_URL = 'https://meet.google.com/uyj-tfhh-zsq';

const SAMPLE_CLASSES: ClassSession[] = [
  {
    id: 'class-today',
    courseId: 'ita-a1-mastery',
    courseTitle: 'Italian A1: Live Speaking & Pronunciation Workshop',
    mentorId: 'mentor-1',
    mentorName: 'Prof. Marco Rossi',
    scheduledAtUtc: new Date(Date.now() + 1000 * 60 * 45).toISOString(), // 45 mins from now
    durationMinutes: 60,
    status: 0,
    meetingUrl: GOOGLE_MEET_DEFAULT_URL,
    summaryNotes: 'Today we will practice restaurant conversations, food ordering, and polite requests in Italian.',
  },
  {
    id: 'class-tomorrow',
    courseId: 'ita-a2-fluency',
    courseTitle: 'Italian A2: Passato Prossimo vs Imperfetto Q&A',
    mentorId: 'mentor-2',
    mentorName: 'Prof. Giulia Bianchi',
    scheduledAtUtc: new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString(), // tomorrow
    durationMinutes: 45,
    status: 0,
    meetingUrl: GOOGLE_MEET_DEFAULT_URL,
    summaryNotes: 'Bring your questions about irregular past participles and Essere vs Avere auxiliary verb selection.',
  },
  {
    id: 'class-weekend',
    courseId: 'ita-culture',
    courseTitle: 'Italian Culture & Visa/Study in Italy Information Session',
    mentorId: 'mentor-3',
    mentorName: 'Dr. Elena Moretti',
    scheduledAtUtc: new Date(Date.now() + 1000 * 60 * 60 * 72).toISOString(),
    durationMinutes: 90,
    status: 0,
    meetingUrl: GOOGLE_MEET_DEFAULT_URL,
    summaryNotes: 'Special guest session covering Italian student visa guidelines, housing in Milan & Rome, and scholarship opportunities.',
  },
];

export const LiveClassesPage: React.FC = () => {
  const [classes, setClasses] = useState<ClassSession[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    classesApi
      .list()
      .then((res) => {
        if (res && res.length > 0) {
          setClasses(res);
        } else {
          setClasses(SAMPLE_CLASSES);
        }
      })
      .catch((err) => {
        console.warn('Backend live classes load failed, using sample classes', err);
        setClasses(SAMPLE_CLASSES);
      })
      .finally(() => setLoading(false));
  }, []);

  const formatDateTime = (iso: string) => {
    try {
      const d = new Date(iso);
      return d.toLocaleDateString(undefined, {
        weekday: 'short',
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
      {/* Header Banner */}
      <div
        className="panel"
        style={{
          background: 'linear-gradient(135deg, #0D5C75 0%, #0077b6 100%)',
          color: '#ffffff',
          padding: '2rem',
        }}
      >
        <div style={{ maxWidth: '650px' }}>
          <span
            style={{
              background: 'rgba(255, 255, 255, 0.2)',
              padding: '4px 12px',
              borderRadius: '9999px',
              fontSize: '0.8rem',
              fontWeight: 700,
              display: 'inline-block',
              marginBottom: '0.75rem',
            }}
          >
            🔴 LIVE INTERACTIVE SESSIONS
          </span>
          <h1 style={{ fontSize: '1.85rem', fontWeight: 800, marginBottom: '0.5rem' }}>
            Live Google Meet Italian Classes
          </h1>
          <p style={{ opacity: 0.9, fontSize: '0.95rem', lineHeight: 1.6, marginBottom: '1.25rem' }}>
            Join live conversational rooms with certified native Italian instructors. Ask questions, practice pronunciation with peers, and get immediate feedback.
          </p>
          <a
            href={GOOGLE_MEET_DEFAULT_URL}
            target="_blank"
            rel="noreferrer"
            className="btn"
            style={{
              background: '#22c55e',
              color: '#ffffff',
              padding: '12px 24px',
              fontSize: '1rem',
              fontWeight: 700,
              boxShadow: '0 4px 12px rgba(34, 197, 94, 0.35)',
            }}
          >
            📹 Open Official Meet Room Now ({GOOGLE_MEET_DEFAULT_URL.replace('https://', '')})
          </a>
        </div>
      </div>

      {/* Classroom Schedule */}
      <div>
        <h2 style={{ fontSize: '1.3rem', fontWeight: 700, color: 'var(--text)', marginBottom: '1rem' }}>
          Upcoming Scheduled Classes
        </h2>

        {loading ? (
          <StateBlock type="loading" message="Loading live classes schedule..." />
        ) : classes.length === 0 ? (
          <StateBlock
            type="empty"
            title="No upcoming live classes right now"
            message="Check back soon! New sessions are scheduled every week."
          />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {classes.map((cls) => {
              const meetLink = cls.meetingUrl || GOOGLE_MEET_DEFAULT_URL;
              return (
                <div
                  key={cls.id}
                  className="panel"
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: '1.25rem',
                    borderLeft: '4px solid #22c55e',
                  }}
                >
                  <div style={{ flex: '1 1 350px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                      <span className="badge badge-primary">📅 {formatDateTime(cls.scheduledAtUtc)}</span>
                      <span className="badge badge-gold">⏱ {cls.durationMinutes} Minutes</span>
                      <span className="badge badge-success">Google Meet</span>
                    </div>

                    <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text)', marginBottom: '4px' }}>
                      {cls.courseTitle}
                    </h3>

                    <p style={{ fontSize: '0.88rem', color: 'var(--muted)', marginBottom: '8px' }}>
                      👨‍🏫 Instructor: <strong>{cls.mentorName || 'SS Europa Instructor'}</strong>
                    </p>

                    {cls.summaryNotes && (
                      <p style={{ fontSize: '0.85rem', color: '#475569', background: '#f8fafc', padding: '8px 12px', borderRadius: '6px' }}>
                        📌 <strong>Prep notes:</strong> {cls.summaryNotes}
                      </p>
                    )}
                  </div>

                  <div>
                    <a
                      href={meetLink}
                      target="_blank"
                      rel="noreferrer"
                      className="btn btn-primary"
                      style={{ padding: '12px 22px', fontSize: '0.95rem' }}
                    >
                      🎥 Join Google Meet
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Classroom Guidelines */}
      <div className="panel" style={{ background: '#f8fafc' }}>
        <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text)', marginBottom: '0.75rem' }}>
          💡 Live Class Guidelines & Best Practices
        </h3>
        <ul style={{ paddingLeft: '1.25rem', color: 'var(--muted)', fontSize: '0.9rem', lineHeight: 1.8 }}>
          <li>Please join with headphones/earphones for the best native pronunciation listening experience.</li>
          <li>Keep your microphone muted when the instructor is explaining concepts; unmute when asked to speak.</li>
          <li>All live class recordings are archived and uploaded into your Course Curriculum within 24 hours.</li>
          <li>If you face connection issues with Google Meet, contact our student support team on WhatsApp.</li>
        </ul>
      </div>
    </div>
  );
};


import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ErrorBox, Loading } from '../components/StateBlock';
import { useAuth } from '../hooks/useAuth';
import { classesApi, coursesApi } from '../services/api';
import { levelLabel, type ClassSession, type Course } from '../types';

export function DashboardPage() {
  const { user } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [upcomingClasses, setUpcomingClasses] = useState<ClassSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadDashboard() {
      setLoading(true);
      setError(null);
      try {
        const [cRes, clRes] = await Promise.allSettled([
          coursesApi.list({ pageSize: 6 }),
          classesApi.list(),
        ]);

        if (cRes.status === 'fulfilled') {
          setCourses(cRes.value.items);
        }
        if (clRes.status === 'fulfilled') {
          setUpcomingClasses(clRes.value.slice(0, 3));
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    }

    void loadDashboard();
  }, []);

  const studentName = user?.fullName || user?.firstName || 'Student';

  if (loading) return <Loading label="Caricamento del tuo cruscotto… (Loading your dashboard…)" />;

  return (
    <div className="animate-rise">
      {error && <ErrorBox message={error} />}

      {/* Hero Welcome Banner */}
      <div
        style={{
          background: 'linear-gradient(135deg, #0D5C75 0%, #083c4d 100%)',
          color: '#ffffff',
          borderRadius: '16px',
          padding: '2rem',
          marginBottom: '2rem',
          boxShadow: 'var(--shadow-lg)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1.5rem',
        }}
      >
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(255, 255, 255, 0.15)', padding: '4px 12px', borderRadius: '9999px', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.75rem' }}>
            <span>🇮🇹</span>
            <span>Benvenuto all'Accademia Italiana</span>
          </div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 800, margin: '0 0 0.5rem', letterSpacing: '-0.5px' }}>
            Ciao, {studentName}! 👋
          </h1>
          <p style={{ color: '#dbeafe', margin: 0, fontSize: '0.95rem', maxWidth: '580px' }}>
            Your Single All-Access Pass is active. You have full access to all video lessons, pronunciation audio labs, live Google Meet sessions, and the Google Gemini AI tutor.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <Link to="/courses" className="btn btn-accent" style={{ color: '#000000', fontWeight: 700 }}>
            📖 Resume Learning
          </Link>
          <Link to="/ai" className="btn" style={{ background: 'rgba(255, 255, 255, 0.2)', color: '#ffffff' }}>
            🤖 AI Practice
          </Link>
        </div>
      </div>

      {/* 4 Stat Cards */}
      <div className="grid-4" style={{ marginBottom: '2rem' }}>
        <div className="panel" style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{ fontSize: '2rem', background: '#e0f2fe', width: '48px', height: '48px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>📚</div>
          <div>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--primary)' }}>{courses.length}</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--muted)', fontWeight: 600 }}>Included Courses</div>
          </div>
        </div>

        <div className="panel" style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{ fontSize: '2rem', background: '#dcfce7', width: '48px', height: '48px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>🎥</div>
          <div>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#15803d' }}>{upcomingClasses.length}</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--muted)', fontWeight: 600 }}>Scheduled Meet Classes</div>
          </div>
        </div>

        <div className="panel" style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{ fontSize: '2rem', background: '#fef3c7', width: '48px', height: '48px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>🤖</div>
          <div>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#b45309' }}>24/7</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--muted)', fontWeight: 600 }}>Gemini AI Tutor</div>
          </div>
        </div>

        <div className="panel" style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{ fontSize: '2rem', background: '#ede9fe', width: '48px', height: '48px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>💎</div>
          <div>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#6d28d9' }}>Active</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--muted)', fontWeight: 600 }}>Full App Membership</div>
          </div>
        </div>
      </div>

      {/* Main Two-Column Layout */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.75rem', alignItems: 'start' }}>
        
        {/* Left Column: Courses Catalogue / Enrolled Courses */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0 }}>Curriculum & Video Courses</h2>
            <Link to="/courses" style={{ fontSize: '0.88rem', fontWeight: 600 }}>View All Courses →</Link>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {courses.slice(0, 4).map((c) => (
              <div key={c.id} className="panel" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <span className="badge badge-primary">{levelLabel(c.level)}</span>
                    <span className="badge badge-success">✓ Unlocked</span>
                  </div>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: '4px 0' }}>{c.title}</h3>
                  <p style={{ color: 'var(--muted)', fontSize: '0.85rem', margin: 0, maxWidth: '500px' }}>
                    {c.description || 'Structured Italian course with video lectures, native audio guides, and worksheets.'}
                  </p>
                </div>

                <Link to={`/courses/${c.id}`} className="btn btn-primary" style={{ padding: '8px 16px', fontSize: '0.88rem' }}>
                  Study Course →
                </Link>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Google Meet Classes & AI Prompt Widget */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {/* Live Classes Card */}
          <div className="panel" style={{ borderLeft: '4px solid #10b981' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '0.75rem' }}>
              <span style={{ fontSize: '1.25rem' }}>🎥</span>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, margin: 0 }}>Live Google Meet Classes</h3>
            </div>
            <p style={{ color: 'var(--muted)', fontSize: '0.85rem', marginBottom: '1rem' }}>
              Join interactive conversational sessions with native mentors directly via Google Meet.
            </p>

            {upcomingClasses.length === 0 ? (
              <div style={{ padding: '12px', background: '#f8fafc', borderRadius: '8px', fontSize: '0.85rem', color: 'var(--muted)', textAlign: 'center' }}>
                No classes scheduled for today. Check timetable below.
              </div>
            ) : (
              upcomingClasses.map((cl) => (
                <div key={cl.id} style={{ padding: '10px 12px', background: '#f8fafc', borderRadius: '8px', marginBottom: '8px' }}>
                  <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{cl.courseTitle}</div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--muted)' }}>Instructor: {cl.mentorName}</div>
                </div>
              ))
            )}

            <Link
              to="/classes"
              className="btn btn-primary"
              style={{ width: '100%', marginTop: '0.75rem', fontSize: '0.88rem', background: '#059669', borderColor: '#059669' }}
            >
              Open Live Classes (Google Meet)
            </Link>
          </div>

          {/* AI Tutor Card */}
          <div className="panel" style={{ borderLeft: '4px solid var(--azure)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '0.75rem' }}>
              <span style={{ fontSize: '1.25rem' }}>🤖</span>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, margin: 0 }}>Google Gemini AI Tutor</h3>
            </div>
            <p style={{ color: 'var(--muted)', fontSize: '0.85rem', marginBottom: '1rem' }}>
              Have questions about Italian grammar, verb conjugations, or pronunciation? Ask Gemini anytime!
            </p>
            <Link to="/ai" className="btn btn-secondary" style={{ width: '100%', fontSize: '0.88rem' }}>
              Launch AI Practice Session →
            </Link>
          </div>

        </div>

      </div>
    </div>
  );
}


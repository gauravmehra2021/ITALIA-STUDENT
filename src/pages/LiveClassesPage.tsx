import { useState } from 'react';
import { useAsync } from '../hooks/useAsync';
import { classesApi, learnApi } from '../services/api';
import { Empty, ErrorState, Loading } from '../components/ui';
import { Icon } from '../components/Icons';
import type { ClassSession } from '../types';
import './pages.css';

export function LiveClassesPage() {
  const { data, error, loading, reload } = useAsync(async () => {
    const [classes, courses] = await Promise.all([classesApi.list(), learnApi.courses()]);
    const enrolled = new Set(courses.filter((c) => c.isEnrolled).map((c) => c.course.id));
    return { classes: classes.filter((c) => enrolled.has(c.courseId)), hasCourses: enrolled.size > 0 };
  });

  if (loading && !data) return <Loading label="Loading your live classes…" />;
  if (error || !data) return <ErrorState message={error ?? 'Could not load classes.'} onRetry={reload} />;

  const now = Date.now();
  const endOf = (c: ClassSession) => new Date(c.scheduledAtUtc).getTime() + c.durationMinutes * 60000;
  const upcoming = data.classes.filter((c) => endOf(c) > now && c.status !== 'Cancelled' && c.status !== 'Completed')
    .sort((a, b) => +new Date(a.scheduledAtUtc) - +new Date(b.scheduledAtUtc));
  const past = data.classes.filter((c) => !upcoming.includes(c)).sort((a, b) => +new Date(b.scheduledAtUtc) - +new Date(a.scheduledAtUtc));

  return (
    <div className="page">
      <div className="page-head">
        <div>
          <h1>Live classes</h1>
          <p>Each week you practise speaking with your teacher and classmates. Prepare the unit's homework before the class.</p>
        </div>
      </div>

      <div className="alert alert-info">
        🎧 Use headphones, find a quiet place and join 5 minutes early. Have your homework ready — the live class is for speaking!
      </div>

      <section>
        <div className="section-title"><h2>Upcoming</h2></div>
        {upcoming.length === 0 ? (
          <div className="card">
            <Empty icon="🗓️" title="No classes scheduled yet">
              <span>{data.hasCourses ? 'Your teacher will schedule the next class soon — you\'ll get a notification.' : 'Enroll in a course to join its live classes.'}</span>
            </Empty>
          </div>
        ) : (
          <div className="stack" style={{ gap: 12 }}>{upcoming.map((c) => <ClassRow key={c.id} session={c} />)}</div>
        )}
      </section>

      {past.length > 0 && (
        <section>
          <div className="section-title"><h2>Past classes</h2></div>
          <div className="stack" style={{ gap: 12 }}>{past.slice(0, 10).map((c) => <ClassRow key={c.id} session={c} past />)}</div>
        </section>
      )}
    </div>
  );
}

function ClassRow({ session, past = false }: { session: ClassSession; past?: boolean }) {
  const [joining, setJoining] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const start = new Date(session.scheduledAtUtc);
  const startsSoon = !past && Date.now() >= start.getTime() - 15 * 60000;

  async function join() {
    setJoining(true);
    setError(null);
    try {
      const s = await classesApi.meeting(session.id);
      if (s.meetingUrl) window.open(s.meetingUrl, '_blank', 'noopener');
      else setError('The meeting link isn\'t available yet. Try again a few minutes before the class.');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not open the class.');
    } finally {
      setJoining(false);
    }
  }

  return (
    <article className="card class-row" style={{ opacity: past ? 0.75 : 1 }}>
      <div className="class-date">
        <span>{start.toLocaleDateString(undefined, { month: 'short' })}</span>
        <strong>{start.getDate()}</strong>
      </div>
      <div className="class-info">
        <strong>{session.title}</strong>
        <span className="muted small">{session.courseTitle} · {session.mentorName}</span>
        <span className="small" style={{ fontWeight: 700, color: 'var(--ink-2)' }}>
          {start.toLocaleDateString(undefined, { weekday: 'long' })}, {start.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })} · {session.durationMinutes} min
          {session.meetingProvider ? ` · ${session.meetingProvider}` : ''}
        </span>
        {error && <span className="small" style={{ color: 'var(--red-600)' }}>{error}</span>}
      </div>
      {!past && (
        <button className={`btn ${startsSoon ? 'btn-danger' : 'btn-primary'}`} onClick={join} disabled={joining}>
          <Icon.Video size={18} /> {joining ? 'Opening…' : startsSoon ? 'Join now' : 'Join'}
        </button>
      )}
      {past && <span className="badge badge-gray">{session.status === 'Cancelled' ? 'Cancelled' : 'Finished'}</span>}
    </article>
  );
}

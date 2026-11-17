import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useAsync } from '../hooks/useAsync';
import { announcementsApi, classesApi, learnApi } from '../services/api';
import { ErrorState, Illustration, Loading, ProgressBar, ProgressRing } from '../components/ui';
import { Icon } from '../components/Icons';
import type { Announcement, ClassSession, LearnerSummary } from '../types';
import './pages.css';

function greeting() {
  const h = new Date().getHours();
  if (h < 13) return { it: 'Buongiorno', en: 'Good morning' };
  if (h < 18) return { it: 'Buon pomeriggio', en: 'Good afternoon' };
  return { it: 'Buonasera', en: 'Good evening' };
}

export function HomePage() {
  const { user } = useAuth();
  const { data, error, loading, reload } = useAsync(async () => {
    const [summary, classes, notes] = await Promise.all([
      learnApi.me(),
      classesApi.list().catch(() => [] as ClassSession[]),
      announcementsApi.list().catch(() => [] as Announcement[]),
    ]);
    return { summary, classes, notes };
  });

  if (loading && !data) return <Loading label="Loading your dashboard…" />;
  if (error || !data) return <ErrorState message={error ?? 'Could not load your dashboard.'} onRetry={reload} />;

  const { summary, classes, notes } = data;
  const g = greeting();
  const enrolledIds = new Set(summary.myCourses.map((c) => c.course.id));
  const nextClass = classes
    .filter((c) => enrolledIds.has(c.courseId) && new Date(c.scheduledAtUtc).getTime() > Date.now() - c.durationMinutes * 60000 && c.status !== 'Cancelled')
    .sort((a, b) => +new Date(a.scheduledAtUtc) - +new Date(b.scheduledAtUtc))[0];

  return (
    <div className="page">
      <div className="hello">
        <div>
          <p className="hello-it">{g.it}, {user?.firstName || 'studente'}! 👋</p>
          <h1>{summary.myCourses.length === 0 ? 'Let\'s start learning Italian' : 'Ready for today\'s lesson?'}</h1>
        </div>
      </div>

      <Stats summary={summary} />

      <div className="home-grid">
        <div className="stack">
          {summary.continueCourse ? (
            <ContinueCard summary={summary} />
          ) : (
            <div className="card card-pad start-card">
              <div className="start-card-art">🇮🇹</div>
              <div className="stack" style={{ gap: 10 }}>
                <h2>Choose your first course</h2>
                <p className="muted">Start with <strong>Italian A1 — Foundations</strong>: 10 weekly units with words, dialogues, grammar and live classes. The first lesson is free to try.</p>
                <div><Link to="/courses" className="btn btn-primary">Browse courses <Icon.ArrowRight size={18} /></Link></div>
              </div>
            </div>
          )}

          {summary.myCourses.length > 1 && (
            <section>
              <div className="section-title"><h2>My courses</h2><Link to="/courses">All courses</Link></div>
              <div className="grid course-mini-grid">
                {summary.myCourses.map((c) => (
                  <Link key={c.course.id} to={`/courses/${c.course.id}`} className="card card-pad card-hover course-mini">
                    <Illustration src={c.course.thumbnailUrl} size={48} />
                    <div style={{ minWidth: 0, flex: 1 }}>
                      <strong className="ellipsis">{c.course.title}</strong>
                      <ProgressBar value={c.completionPercent} />
                      <span className="muted small">{c.completedLessons} of {c.totalLessons} lessons</span>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}

          <section>
            <div className="section-title"><h2>How you learn with SS Europa</h2></div>
            <div className="method-grid">
              {[
                { e: '📸', t: 'Words', d: 'New words with pictures and audio' },
                { e: '💬', t: 'Dialogue', d: 'Real situations in Italy' },
                { e: '📘', t: 'Grammar', d: 'One clear rule at a time' },
                { e: '🎥', t: 'Live class', d: 'Speak with your teacher each week' },
              ].map((m) => (
                <div key={m.t} className="method">
                  <span>{m.e}</span>
                  <strong>{m.t}</strong>
                  <small>{m.d}</small>
                </div>
              ))}
            </div>
          </section>
        </div>

        <div className="stack">
          <NextClassCard session={nextClass} />

          <Link to="/tutor" className="card card-pad card-hover tutor-card">
            <img src="/images/ui/chikoo-card.png" alt="" width={64} height={64} />
            <div>
              <strong>Ask Chikoo, your AI tutor</strong>
              <p className="muted small">Translate a sentence, check your grammar or practise a conversation.</p>
            </div>
            <Icon.ArrowRight size={18} />
          </Link>

          <section className="card card-pad">
            <div className="section-title"><h2>📢 News</h2></div>
            {notes.length === 0 ? (
              <p className="muted small">No announcements right now.</p>
            ) : (
              <div className="stack" style={{ gap: 12 }}>
                {notes.slice(0, 3).map((n) => (
                  <div key={n.id} className="news">
                    <strong>{n.title}</strong>
                    <p className="muted small">{n.body}</p>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}

function Stats({ summary }: { summary: LearnerSummary }) {
  const items = [
    { icon: <Icon.Flame size={22} />, value: summary.streakDays, label: 'Day streak', cls: 'orange' },
    { icon: <Icon.Bolt size={22} />, value: summary.totalXp, label: 'Total XP', cls: 'blue' },
    { icon: <Icon.Check size={22} />, value: summary.lessonsCompleted, label: 'Lessons done', cls: 'green' },
    { icon: <Icon.Words size={22} />, value: summary.wordsLearned, label: 'Words learned', cls: 'purple' },
  ];
  return (
    <div className="stat-grid">
      {items.map((s) => (
        <div key={s.label} className={`stat-tile ${s.cls}`}>
          <span className="stat-icon">{s.icon}</span>
          <div>
            <strong>{s.value}</strong>
            <span>{s.label}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

function ContinueCard({ summary }: { summary: LearnerSummary }) {
  const c = summary.continueCourse!;
  const done = c.completionPercent >= 100;
  return (
    <div className="continue-card">
      <div className="continue-body">
        <span className="badge badge-gold">{c.course.cefrLevel} · Continue learning</span>
        <h2>{c.course.title}</h2>
        {done ? (
          <p>🎉 You completed this course! Review any lesson to improve your stars.</p>
        ) : (
          <p>Next lesson: <strong>{c.nextLessonTitle}</strong></p>
        )}
        <div className="continue-progress">
          <ProgressBar value={c.completionPercent} />
          <span>{c.completedLessons} / {c.totalLessons} lessons</span>
        </div>
        <div className="row wrap">
          {c.nextLessonId && !done ? (
            <Link to={`/lesson/${c.nextLessonId}`} className="btn btn-success btn-lg"><Icon.Play size={18} /> Start lesson</Link>
          ) : null}
          <Link to={`/courses/${c.course.id}`} className="btn btn-lg continue-secondary">View course</Link>
        </div>
      </div>
      <div className="continue-art">
        <ProgressRing value={c.completionPercent} size={120} stroke={11} />
      </div>
    </div>
  );
}

function NextClassCard({ session }: { session?: ClassSession }) {
  if (!session) {
    return (
      <div className="card card-pad next-class">
        <div className="row"><span className="next-class-icon"><Icon.Video size={20} /></span><strong>Live classes</strong></div>
        <p className="muted small">Your next live speaking class will appear here as soon as your teacher schedules it.</p>
        <Link to="/live-classes" className="btn btn-sm">See schedule</Link>
      </div>
    );
  }
  const when = new Date(session.scheduledAtUtc);
  const live = Date.now() >= when.getTime() - 10 * 60000;
  return (
    <div className="card card-pad next-class">
      <div className="row"><span className="next-class-icon"><Icon.Video size={20} /></span><strong>Next live class</strong>{live && <span className="badge badge-red">● Live soon</span>}</div>
      <div>
        <strong style={{ fontSize: '1.05rem' }}>{session.title}</strong>
        <p className="muted small">{session.courseTitle} · with {session.mentorName}</p>
      </div>
      <div className="row next-class-time">
        <Icon.Calendar size={18} />
        <span>{when.toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'long' })}</span>
        <Icon.Clock size={18} />
        <span>{when.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}</span>
      </div>
      <Link to="/live-classes" className={`btn ${live ? 'btn-danger' : 'btn-primary'} btn-block`}>{live ? 'Join the class' : 'View details'}</Link>
    </div>
  );
}

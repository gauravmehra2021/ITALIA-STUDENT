import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useAsync } from '../hooks/useAsync';
import { announcementsApi, classesApi, learnApi } from '../services/api';
import { ErrorState, Illustration, Loading, ProgressBar, ProgressRing } from '../components/ui';
import { Icon } from '../components/Icons';
import { useI18n } from '../i18n';
import { AI_TUTOR_ENABLED } from '../lib/features';
import { LanguageCard } from '../i18n/LanguagePicker';
import { Tr } from '../i18n/content';
import type { Announcement, ClassSession, LearnerSummary } from '../types';
import './pages.css';

function greeting() {
  const h = new Date().getHours();
  if (h < 13) return 'Buongiorno';
  if (h < 18) return 'Buon pomeriggio';
  return 'Buonasera';
}

const METHODS = [
  { e: '📸', k: 'Words' },
  { e: '💬', k: 'Dialogue' },
  { e: '📘', k: 'Grammar' },
  { e: '🎥', k: 'Live' },
];

export function HomePage() {
  const { user } = useAuth();
  const { t } = useI18n();
  const { data, error, loading, reload } = useAsync(async () => {
    const [summary, classes, notes, available] = await Promise.all([
      learnApi.me(),
      classesApi.list().catch(() => [] as ClassSession[]),
      announcementsApi.list().catch(() => [] as Announcement[]),
      // Courses this student may open (their batch's courses). Empty = not placed in a batch yet.
      learnApi.courses().then((c) => c.length).catch(() => 1),
    ]);
    return { summary, classes, notes, available };
  });

  if (loading && !data) return <Loading label={t('home.loading')} />;
  if (error || !data) return <ErrorState message={error ?? t('home.loadError')} onRetry={reload} />;

  const { summary, classes, notes, available } = data;
  const nextClass = classes
    .filter((c) => new Date(c.scheduledAtUtc).getTime() > Date.now() - c.durationMinutes * 60000 && c.status !== 'Cancelled')
    .sort((a, b) => +new Date(a.scheduledAtUtc) - +new Date(b.scheduledAtUtc))[0];

  return (
    <div className="page">
      <div className="hello">
        <div>
          <p className="hello-it">{greeting()}, {user?.firstName || t('home.defaultName')}! 👋</p>
          <h1>{summary.myCourses.length === 0 ? t('home.titleNew') : t('home.titleReturning')}</h1>
        </div>
      </div>

      <Stats summary={summary} />

      <div className="home-grid">
        <div className="stack">
          {summary.continueCourse ? (
            <ContinueCard summary={summary} />
          ) : available === 0 ? (
            <div className="card card-pad start-card">
              <div className="start-card-art">🧑‍🏫</div>
              <div className="stack" style={{ gap: 10 }}>
                <h2>{t('courses.waitTitle')}</h2>
                <p className="muted">{t('courses.waitText')}</p>
              </div>
            </div>
          ) : (
            <div className="card card-pad start-card">
              <div className="start-card-art">🇮🇹</div>
              <div className="stack" style={{ gap: 10 }}>
                <h2>{t('home.chooseFirst')}</h2>
                <p className="muted">{t('home.chooseFirstText')}</p>
                <div><Link to="/courses" className="btn btn-primary">{t('home.browse')} <Icon.ArrowRight size={18} /></Link></div>
              </div>
            </div>
          )}

          {summary.myCourses.length > 1 && (
            <section>
              <div className="section-title"><h2>{t('home.myCourses')}</h2><Link to="/courses">{t('home.allCourses')}</Link></div>
              <div className="grid course-mini-grid">
                {summary.myCourses.map((c) => (
                  <Link key={c.course.id} to={`/courses/${c.course.id}`} className="card card-pad card-hover course-mini">
                    <Illustration src={c.course.thumbnailUrl} size={48} />
                    <div style={{ minWidth: 0, flex: 1 }}>
                      <strong className="ellipsis">{c.course.title}</strong>
                      <Tr text={c.course.title} />
                      <ProgressBar value={c.completionPercent} />
                      <span className="muted small">{t('home.lessonsOf', { done: c.completedLessons, total: c.totalLessons })}</span>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}

          <section>
            <div className="section-title"><h2>{t('home.howYouLearn')}</h2></div>
            <div className="method-grid">
              {METHODS.map((m) => (
                <div key={m.k} className="method">
                  <span>{m.e}</span>
                  <strong>{t(`home.method${m.k}`)}</strong>
                  <small>{t(`home.method${m.k}Text`)}</small>
                </div>
              ))}
            </div>
          </section>
        </div>

        <div className="stack">
          <LanguageCard />

          <NextClassCard session={nextClass} />

          {AI_TUTOR_ENABLED && (
          <Link to="/tutor" className="card card-pad card-hover tutor-card">
            <img src="/images/ui/chikoo-card.png" alt="" width={64} height={64} />
            <div>
              <strong>{t('home.tutorTitle')}</strong>
              <p className="muted small">{t('home.tutorText')}</p>
            </div>
            <Icon.ArrowRight size={18} />
          </Link>
          )}

          <section className="card card-pad">
            <div className="section-title"><h2>📢 {t('home.news')}</h2></div>
            {notes.length === 0 ? (
              <p className="muted small">{t('home.noNews')}</p>
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
  const { t } = useI18n();
  const items = [
    { icon: <Icon.Flame size={22} />, value: summary.streakDays, label: t('home.statStreak'), cls: 'orange' },
    { icon: <Icon.Bolt size={22} />, value: summary.totalXp, label: t('home.statXp'), cls: 'blue' },
    { icon: <Icon.Check size={22} />, value: summary.lessonsCompleted, label: t('home.statLessons'), cls: 'green' },
    { icon: <Icon.Words size={22} />, value: summary.wordsLearned, label: t('home.statWords'), cls: 'purple' },
  ];
  return (
    <div className="stat-grid">
      {items.map((s) => (
        <div key={s.cls} className={`stat-tile ${s.cls}`}>
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
  const { t } = useI18n();
  const c = summary.continueCourse!;
  const done = c.completionPercent >= 100;
  return (
    <div className="continue-card">
      <div className="continue-body">
        <span className="badge badge-gold">{c.course.cefrLevel} · {t('home.continueLearning')}</span>
        <h2>{c.course.title}</h2>
        <Tr text={c.course.title} />
        {done ? (
          <p>🎉 {t('home.courseDone')}</p>
        ) : (
          <p>{t('home.nextLesson')} <strong>{c.nextLessonTitle}</strong><Tr text={c.nextLessonTitle} /></p>
        )}
        <div className="continue-progress">
          <ProgressBar value={c.completionPercent} />
          <span>{t('home.lessonsShort', { done: c.completedLessons, total: c.totalLessons })}</span>
        </div>
        <div className="row wrap">
          {c.nextLessonId && !done ? (
            <Link to={`/lesson/${c.nextLessonId}`} className="btn btn-success btn-lg"><Icon.Play size={18} /> {t('home.startLesson')}</Link>
          ) : null}
          <Link to={`/courses/${c.course.id}`} className="btn btn-lg continue-secondary">{t('home.viewCourse')}</Link>
        </div>
      </div>
      <div className="continue-art">
        <ProgressRing value={c.completionPercent} size={120} stroke={11} />
      </div>
    </div>
  );
}

function NextClassCard({ session }: { session?: ClassSession }) {
  const { t, locale } = useI18n();
  if (!session) {
    return (
      <div className="card card-pad next-class">
        <div className="row"><span className="next-class-icon"><Icon.Video size={20} /></span><strong>{t('home.liveClasses')}</strong></div>
        <p className="muted small">{t('home.noClass')}</p>
        <Link to="/live-classes" className="btn btn-sm">{t('home.seeSchedule')}</Link>
      </div>
    );
  }
  const when = new Date(session.scheduledAtUtc);
  const live = Date.now() >= when.getTime() - 10 * 60000;
  return (
    <div className="card card-pad next-class">
      <div className="row"><span className="next-class-icon"><Icon.Video size={20} /></span><strong>{t('home.nextClass')}</strong>{live && <span className="badge badge-red">{t('home.liveSoon')}</span>}</div>
      <div>
        <strong style={{ fontSize: '1.05rem' }}>{session.title}</strong>
        <p className="muted small">{[session.batchName, session.courseTitle].filter(Boolean).join(' · ')}{session.batchName || session.courseTitle ? ' · ' : ''}{t('home.withTeacher', { name: session.mentorName ?? '' })}</p>
      </div>
      <div className="row next-class-time">
        <Icon.Calendar size={18} />
        <span>{when.toLocaleDateString(locale, { weekday: 'long', day: 'numeric', month: 'long' })}</span>
        <Icon.Clock size={18} />
        <span>{when.toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' })}</span>
      </div>
      <Link to="/live-classes" className={`btn ${live ? 'btn-danger' : 'btn-primary'} btn-block`}>{live ? t('home.joinClass') : t('home.viewDetails')}</Link>
    </div>
  );
}

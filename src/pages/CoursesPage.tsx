import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAsync } from '../hooks/useAsync';
import { useLearner } from '../hooks/useLearner';
import { learnApi } from '../services/api';
import { mediaUrl } from '../lib/media';
import { Empty, ErrorState, Loading, ProgressBar } from '../components/ui';
import { Icon } from '../components/Icons';
import { useI18n } from '../i18n';
import { Tr } from '../i18n/content';
import type { CourseCard } from '../types';
import './pages.css';

const FILTERS: { id: string; key: string; emoji: string }[] = [
  { id: 'All', key: 'filterAll', emoji: '📚' },
  { id: 'Core', key: 'filterCore', emoji: '🎓' },
  { id: 'Work', key: 'filterWork', emoji: '💼' },
  { id: 'Study', key: 'filterStudy', emoji: '🏛️' },
  { id: 'Visit', key: 'filterVisit', emoji: '✈️' },
];

const CATEGORY_KEY: Record<string, string> = {
  Core: 'courses.catCore',
  Work: 'courses.catWork',
  Study: 'courses.catStudy',
  Visit: 'courses.catVisit',
};

export function CoursesPage() {
  const { t } = useI18n();
  const { data, error, loading, reload } = useAsync(() => learnApi.courses());
  const [filter, setFilter] = useState('All');

  if (loading && !data) return <Loading label={t('courses.loading')} />;
  if (error || !data) return <ErrorState message={error ?? t('courses.loadError')} onRetry={reload} />;

  const countOf = (id: string) => (id === 'All' ? data.length : data.filter((c) => c.course.category === id).length);
  const shown = data.filter((c) => filter === 'All' || c.course.category === filter);
  const mine = shown.filter((c) => c.isEnrolled);
  const others = shown.filter((c) => !c.isEnrolled);
  const active = FILTERS.find((f) => f.id === filter) ?? FILTERS[0];

  return (
    <div className="page">
      <div className="page-head">
        <div>
          <h1>{t('courses.title')}</h1>
          <p>{t('courses.subtitle')}</p>
        </div>
      </div>

      <div className="cat-filter" role="tablist" aria-label={t('courses.courseType')}>
        {FILTERS.filter((f) => countOf(f.id) > 0).map((f) => (
          <button key={f.id} type="button" role="tab" aria-selected={filter === f.id} className={`cat-chip ${filter === f.id ? 'active' : ''}`} onClick={() => setFilter(f.id)}>
            <span aria-hidden>{f.emoji}</span> {t(`courses.${f.key}`)} <span className="cat-count">{countOf(f.id)}</span>
          </button>
        ))}
      </div>
      {filter !== 'All' && <p className="muted" style={{ marginTop: -8 }}>{t(`courses.${active.key}Help`)}</p>}

      {data.length === 0 && <Empty icon="📚" title={t('courses.noCourses')}>{t('courses.comingSoon')}</Empty>}

      {mine.length > 0 && (
        <section>
          <div className="section-title"><h2>{t('courses.myCourses')}</h2></div>
          <div className="catalogue">{mine.map((c) => <CourseTile key={c.course.id} card={c} />)}</div>
        </section>
      )}

      {others.length > 0 && (
        <section>
          <div className="section-title"><h2>{mine.length > 0 ? t('courses.moreCourses') : t('courses.available')}</h2></div>
          <div className="catalogue">{others.map((c) => <CourseTile key={c.course.id} card={c} />)}</div>
        </section>
      )}
    </div>
  );
}

function CourseTile({ card }: { card: CourseCard }) {
  const { course } = card;
  const { t } = useI18n();
  const navigate = useNavigate();
  const { refresh } = useLearner();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const cover = mediaUrl(course.thumbnailUrl);

  async function enroll() {
    setBusy(true);
    setError(null);
    try {
      await learnApi.enroll(course.id);
      await refresh();
      navigate(`/courses/${course.id}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : t('courses.enrollError'));
      setBusy(false);
    }
  }

  return (
    <article className="card card-hover course-card">
      <Link to={`/courses/${course.id}`} className={`course-cover cat-${course.category}`} aria-label={course.title}>
        <span className="badge">{course.cefrLevel} · {CATEGORY_KEY[course.category] ? t(CATEGORY_KEY[course.category]) : course.category}</span>
        {cover ? <img src={cover} alt="" /> : <span style={{ fontSize: 64 }}>🇮🇹</span>}
      </Link>
      <div className="course-card-body">
        <h3>{course.title}</h3>
        <Tr text={course.title} />
        <p className="muted small">{course.shortDescription || course.description}<Tr text={course.shortDescription || course.description} /></p>
        <div className="course-meta">
          <span><Icon.Book size={15} /> {t('courses.units', { n: course.modulesCount })}</span>
          <span><Icon.Target size={15} /> {t('courses.lessons', { n: card.totalLessons })}</span>
          {course.durationWeeks > 0 && <span><Icon.Calendar size={15} /> {t('courses.weeks', { n: course.durationWeeks })}</span>}
        </div>
        <div className="course-card-foot">
          {card.isEnrolled ? (
            <>
              <div className="row-between small"><strong>{t('courses.complete', { n: card.completionPercent })}</strong><span className="muted">{card.completedLessons}/{card.totalLessons}</span></div>
              <ProgressBar value={card.completionPercent} />
              <Link to={card.nextLessonId ? `/lesson/${card.nextLessonId}` : `/courses/${course.id}`} className="btn btn-success btn-block">
                {card.completedLessons === 0 ? t('courses.startLearning') : card.nextLessonId ? t('courses.continue') : t('courses.review')} <Icon.ArrowRight size={18} />
              </Link>
            </>
          ) : (
            <>
              {error && <div className="alert alert-error">{error}</div>}
              <div className="row">
                <Link to={`/courses/${course.id}`} className="btn" style={{ flex: 1 }}>{t('courses.seeSyllabus')}</Link>
                <button className="btn btn-primary" style={{ flex: 1 }} onClick={enroll} disabled={busy}>{busy ? t('courses.enrolling') : t('courses.enrollFree')}</button>
              </div>
            </>
          )}
        </div>
      </div>
    </article>
  );
}

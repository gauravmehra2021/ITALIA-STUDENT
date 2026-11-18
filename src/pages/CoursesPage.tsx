import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAsync } from '../hooks/useAsync';
import { useLearner } from '../hooks/useLearner';
import { learnApi } from '../services/api';
import { mediaUrl } from '../lib/media';
import { Empty, ErrorState, Loading, ProgressBar } from '../components/ui';
import { Icon } from '../components/Icons';
import type { CourseCard } from '../types';
import './pages.css';

const FILTERS: { id: string; label: string; emoji: string; help: string }[] = [
  { id: 'All', label: 'All courses', emoji: '📚', help: 'Every SS Europa course.' },
  { id: 'Core', label: 'Italian levels', emoji: '🎓', help: 'Step by step from A1 to A2 and the CILS exam.' },
  { id: 'Work', label: 'For work', emoji: '💼', help: 'Restaurants, hotels, care work, shops, warehouses, farms, building sites and delivery.' },
  { id: 'Study', label: 'For students', emoji: '🏛️', help: 'Documents, university, finding a room, exams and student life.' },
  { id: 'Visit', label: 'For visitors', emoji: '✈️', help: 'Airport, hotel, restaurants, shopping and emergencies on a trip.' },
];

const CATEGORY_LABEL: Record<string, string> = {
  Core: 'Core course',
  Work: 'Italian for work',
  Study: 'Italian for students',
  Visit: 'Italian for visitors',
};

export function CoursesPage() {
  const { data, error, loading, reload } = useAsync(() => learnApi.courses());
  const [filter, setFilter] = useState('All');

  if (loading && !data) return <Loading label="Loading courses…" />;
  if (error || !data) return <ErrorState message={error ?? 'Could not load courses.'} onRetry={reload} />;

  const countOf = (id: string) => (id === 'All' ? data.length : data.filter((c) => c.course.category === id).length);
  const shown = data.filter((c) => filter === 'All' || c.course.category === filter);
  const mine = shown.filter((c) => c.isEnrolled);
  const others = shown.filter((c) => !c.isEnrolled);
  const active = FILTERS.find((f) => f.id === filter) ?? FILTERS[0];

  return (
    <div className="page">
      <div className="page-head">
        <div>
          <h1>Courses</h1>
          <p>Structured courses from your first word to the CILS exam, with a live class every week.</p>
        </div>
      </div>

      <div className="cat-filter" role="tablist" aria-label="Course type">
        {FILTERS.filter((f) => countOf(f.id) > 0).map((f) => (
          <button key={f.id} type="button" role="tab" aria-selected={filter === f.id} className={`cat-chip ${filter === f.id ? 'active' : ''}`} onClick={() => setFilter(f.id)}>
            <span aria-hidden>{f.emoji}</span> {f.label} <span className="cat-count">{countOf(f.id)}</span>
          </button>
        ))}
      </div>
      {filter !== 'All' && <p className="muted" style={{ marginTop: -8 }}>{active.help}</p>}

      {data.length === 0 && <Empty icon="📚" title="No courses yet">New courses are coming soon.</Empty>}

      {mine.length > 0 && (
        <section>
          <div className="section-title"><h2>My courses</h2></div>
          <div className="catalogue">{mine.map((c) => <CourseTile key={c.course.id} card={c} />)}</div>
        </section>
      )}

      {others.length > 0 && (
        <section>
          <div className="section-title"><h2>{mine.length > 0 ? 'More courses' : 'Available courses'}</h2></div>
          <div className="catalogue">{others.map((c) => <CourseTile key={c.course.id} card={c} />)}</div>
        </section>
      )}
    </div>
  );
}

function CourseTile({ card }: { card: CourseCard }) {
  const { course } = card;
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
      setError(e instanceof Error ? e.message : 'Could not enroll.');
      setBusy(false);
    }
  }

  return (
    <article className="card card-hover course-card">
      <Link to={`/courses/${course.id}`} className={`course-cover cat-${course.category}`} aria-label={course.title}>
        <span className="badge">{course.cefrLevel} · {CATEGORY_LABEL[course.category] ?? course.category}</span>
        {cover ? <img src={cover} alt="" /> : <span style={{ fontSize: 64 }}>🇮🇹</span>}
      </Link>
      <div className="course-card-body">
        <h3>{course.title}</h3>
        <p className="muted small">{course.shortDescription || course.description}</p>
        <div className="course-meta">
          <span><Icon.Book size={15} /> {course.modulesCount} units</span>
          <span><Icon.Target size={15} /> {card.totalLessons} lessons</span>
          {course.durationWeeks > 0 && <span><Icon.Calendar size={15} /> {course.durationWeeks} weeks</span>}
        </div>
        <div className="course-card-foot">
          {card.isEnrolled ? (
            <>
              <div className="row-between small"><strong>{card.completionPercent}% complete</strong><span className="muted">{card.completedLessons}/{card.totalLessons}</span></div>
              <ProgressBar value={card.completionPercent} />
              <Link to={card.nextLessonId ? `/lesson/${card.nextLessonId}` : `/courses/${course.id}`} className="btn btn-success btn-block">
                {card.completedLessons === 0 ? 'Start learning' : card.nextLessonId ? 'Continue' : 'Review course'} <Icon.ArrowRight size={18} />
              </Link>
            </>
          ) : (
            <>
              {error && <div className="alert alert-error">{error}</div>}
              <div className="row">
                <Link to={`/courses/${course.id}`} className="btn" style={{ flex: 1 }}>See syllabus</Link>
                <button className="btn btn-primary" style={{ flex: 1 }} onClick={enroll} disabled={busy}>{busy ? 'Enrolling…' : 'Enroll free'}</button>
              </div>
            </>
          )}
        </div>
      </div>
    </article>
  );
}

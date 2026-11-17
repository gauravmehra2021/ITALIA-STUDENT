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

const CATEGORY_LABEL: Record<string, string> = {
  Core: 'Core course',
  Work: 'Italian for work',
  Study: 'Italian for students',
  Visit: 'Italian for visitors',
};

export function CoursesPage() {
  const { data, error, loading, reload } = useAsync(() => learnApi.courses());

  if (loading && !data) return <Loading label="Loading courses…" />;
  if (error || !data) return <ErrorState message={error ?? 'Could not load courses.'} onRetry={reload} />;

  const mine = data.filter((c) => c.isEnrolled);
  const others = data.filter((c) => !c.isEnrolled);

  return (
    <div className="page">
      <div className="page-head">
        <div>
          <h1>Courses</h1>
          <p>Structured courses from your first word to the CILS exam, with a live class every week.</p>
        </div>
      </div>

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

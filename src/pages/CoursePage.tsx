import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useAsync } from '../hooks/useAsync';
import { useLearner } from '../hooks/useLearner';
import { learnApi } from '../services/api';
import { mediaUrl } from '../lib/media';
import { ErrorState, Illustration, KIND_META, Loading, ProgressBar, ProgressRing, Stars } from '../components/ui';
import { Icon } from '../components/Icons';
import type { CourseOutline, LessonSummary, Unit } from '../types';
import './pages.css';

export function CoursePage() {
  const { id = '' } = useParams();
  const navigate = useNavigate();
  const { refresh } = useLearner();
  const { data, error, loading, reload, setData } = useAsync(() => learnApi.course(id), [id]);
  const [open, setOpen] = useState<Set<string>>(new Set());
  const [enrolling, setEnrolling] = useState(false);
  const [enrollError, setEnrollError] = useState<string | null>(null);

  // Open the unit that contains the next lesson.
  useEffect(() => {
    if (!data) return;
    const current = data.units.find((u) => u.lessons.some((l) => l.id === data.nextLessonId)) ?? data.units[0];
    if (current) setOpen(new Set([current.id]));
  }, [data?.course.id]); // eslint-disable-line react-hooks/exhaustive-deps

  if (loading && !data) return <Loading label="Loading course…" />;
  if (error || !data) return <ErrorState message={error ?? 'Could not load this course.'} onRetry={reload} />;

  const { course } = data;

  async function enroll() {
    setEnrolling(true);
    setEnrollError(null);
    try {
      setData(await learnApi.enroll(course.id));
      await refresh();
    } catch (e) {
      setEnrollError(e instanceof Error ? e.message : 'Could not enroll.');
    } finally {
      setEnrolling(false);
    }
  }

  const toggle = (unitId: string) =>
    setOpen((prev) => {
      const next = new Set(prev);
      if (next.has(unitId)) next.delete(unitId);
      else next.add(unitId);
      return next;
    });

  const objectives = (course.objectives || '').split('\n').map((s) => s.trim()).filter(Boolean);

  return (
    <div className="page">
      <Link to="/courses" className="back-link"><Icon.ArrowLeft size={18} /> All courses</Link>

      <section className="course-hero">
        <div className="stack" style={{ gap: 12 }}>
          <div className="row wrap" style={{ gap: 8 }}>
            <span className="badge badge-gold">Level {course.cefrLevel}</span>
            {data.isEnrolled && <span className="badge badge-green">Enrolled</span>}
          </div>
          <h1>{course.title}</h1>
          <p>{course.shortDescription || course.description}</p>
          <div className="course-meta">
            <span><Icon.Book size={15} /> {data.units.length} units</span>
            <span><Icon.Target size={15} /> {data.totalLessons} lessons</span>
            {course.durationWeeks > 0 && <span><Icon.Calendar size={15} /> {course.durationWeeks} weeks</span>}
            <span><Icon.Video size={15} /> Weekly live class</span>
          </div>
          {data.isEnrolled && data.nextLessonId && (
            <div>
              <button className="btn btn-success btn-lg" onClick={() => navigate(`/lesson/${data.nextLessonId}`)}>
                <Icon.Play size={18} /> {data.completedLessons === 0 ? 'Start the first lesson' : 'Continue learning'}
              </button>
            </div>
          )}
        </div>
        <div className="course-hero-side">
          <ProgressRing value={data.completionPercent} size={112} stroke={10} />
          <Stars value={Math.round((data.stars / Math.max(1, data.maxStars)) * 3)} size={22} />
          <span className="small" style={{ color: 'rgba(255,255,255,0.8)' }}>{data.stars} / {data.maxStars} stars · {data.xpEarned} XP</span>
        </div>
      </section>

      {!data.isEnrolled && (
        <div className="enroll-bar">
          <div>
            <strong>Enroll to unlock every lesson and track your progress.</strong>
            <p className="muted small">It's free. The first lesson is open as a preview.</p>
            {enrollError && <div className="alert alert-error" style={{ marginTop: 8 }}>{enrollError}</div>}
          </div>
          <button className="btn btn-primary btn-lg" onClick={enroll} disabled={enrolling}>{enrolling ? 'Enrolling…' : 'Enroll for free'}</button>
        </div>
      )}

      {objectives.length > 0 && (
        <section className="card card-pad">
          <div className="section-title"><h2>What you will learn</h2></div>
          <ul className="objectives">
            {objectives.map((o) => (<li key={o}><Icon.Check size={18} /> {o}</li>))}
          </ul>
        </section>
      )}

      <section className="stack" style={{ gap: 14 }}>
        <div className="section-title" style={{ marginBottom: 0 }}><h2>Syllabus</h2><span className="muted small">{data.completedLessons} of {data.totalLessons} lessons completed</span></div>
        {data.units.map((u) => (
          <UnitCard key={u.id} unit={u} outline={data} open={open.has(u.id)} onToggle={() => toggle(u.id)} />
        ))}
      </section>
    </div>
  );
}

function UnitCard({ unit, outline, open, onToggle }: { unit: Unit; outline: CourseOutline; open: boolean; onToggle: () => void }) {
  const percent = unit.lessons.length ? Math.round((unit.completedLessons / unit.lessons.length) * 100) : 0;
  const pdf = mediaUrl(unit.pdfUrl);
  return (
    <article className={`card unit ${open ? 'open' : ''}`}>
      <button className="unit-head" onClick={onToggle} aria-expanded={open}>
        <Illustration src={unit.imageUrl} size={56} />
        <div className="unit-title">
          <span className="unit-num">Unit {unit.order}</span>
          <strong>{unit.title}</strong>
          <span className="it small">{unit.titleIt}</span>
        </div>
        <div className="unit-side">
          {percent === 100 ? <span className="badge badge-green"><Icon.Check size={14} /> Done</span> : <span className="badge badge-gray">{unit.completedLessons}/{unit.lessons.length}</span>}
          <Stars value={Math.round((unit.stars / Math.max(1, unit.lessons.length * 3)) * 3)} />
        </div>
        <Icon.ArrowRight size={20} className="unit-chevron" />
      </button>

      {open && (
        <div className="unit-body">
          <div className="stack" style={{ gap: 12 }}>
            {unit.description && <p className="muted">{unit.description}</p>}
            <ProgressBar value={percent} />
            <div className="lesson-list">
              {unit.lessons.map((l) => (
                <LessonRow key={l.id} lesson={l} isNext={outline.isEnrolled && l.id === outline.nextLessonId} />
              ))}
            </div>
          </div>
          <aside className="unit-aside">
            {unit.canDo.length > 0 && (
              <div className="aside-box">
                <h4>🎯 You will be able to</h4>
                <ul>{unit.canDo.map((c) => <li key={c}>{c}</li>)}</ul>
              </div>
            )}
            {unit.liveClassFocus && (
              <div className="aside-box">
                <h4>🎥 Live class this week</h4>
                <p>{unit.liveClassFocus}</p>
                <Link to="/live-classes" className="small">See schedule →</Link>
              </div>
            )}
            {pdf && outline.isEnrolled && (
              <a className="btn btn-block" href={pdf} target="_blank" rel="noreferrer"><Icon.Download size={18} /> Study sheet (PDF)</a>
            )}
          </aside>
        </div>
      )}
    </article>
  );
}

function LessonRow({ lesson, isNext }: { lesson: LessonSummary; isNext: boolean }) {
  const meta = KIND_META[lesson.kind];
  const content = (
    <>
      <span className="lesson-icon" style={{ background: meta.bg, color: meta.color }}>
        {lesson.locked ? <Icon.Lock size={20} /> : meta.emoji}
        {lesson.completed && <span className="done-tick"><Icon.Check size={12} /></span>}
      </span>
      <span className="lesson-text">
        <strong>{lesson.title}</strong>
        <span>{meta.label} · {lesson.estimatedMinutes} min{lesson.vocabularyCount ? ` · ${lesson.vocabularyCount} words` : ''}{lesson.isFreePreview && lesson.locked === false && !lesson.completed ? ' · Free preview' : ''}</span>
      </span>
      <span className="lesson-end">
        {lesson.completed ? <Stars value={lesson.stars ?? 0} /> : isNext ? <span className="badge badge-green">Next</span> : <span className="badge badge-gray">+{lesson.xpReward} XP</span>}
      </span>
    </>
  );
  if (lesson.locked) {
    return <div className="lesson-row locked" title="Finish the previous lesson to unlock this one">{content}</div>;
  }
  return <Link to={`/lesson/${lesson.id}`} className={`lesson-row ${isNext ? 'next' : ''}`}>{content}</Link>;
}

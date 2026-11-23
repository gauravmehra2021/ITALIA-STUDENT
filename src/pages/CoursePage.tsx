import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useAsync } from '../hooks/useAsync';
import { useLearner } from '../hooks/useLearner';
import { learnApi } from '../services/api';
import { mediaUrl } from '../lib/media';
import { ErrorState, Illustration, KIND_META, Loading, ProgressBar, ProgressRing, Stars } from '../components/ui';
import { Icon } from '../components/Icons';
import { useI18n } from '../i18n';
import { Tr } from '../i18n/content';
import type { CourseOutline, LessonSummary, Unit } from '../types';
import './pages.css';

export function CoursePage() {
  const { id = '' } = useParams();
  const navigate = useNavigate();
  const { t } = useI18n();
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

  if (loading && !data) return <Loading label={t('course.loading')} />;
  if (error || !data) return <ErrorState message={error ?? t('course.loadError')} onRetry={reload} />;

  const { course } = data;

  async function enroll() {
    setEnrolling(true);
    setEnrollError(null);
    try {
      setData(await learnApi.enroll(course.id));
      await refresh();
    } catch (e) {
      setEnrollError(e instanceof Error ? e.message : t('courses.enrollError'));
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
      <Link to="/courses" className="back-link"><Icon.ArrowLeft size={18} /> {t('course.allCourses')}</Link>

      <section className="course-hero">
        <div className="stack" style={{ gap: 12 }}>
          <div className="row wrap" style={{ gap: 8 }}>
            <span className="badge badge-gold">{t('course.level', { level: course.cefrLevel })}</span>
            {data.isEnrolled && <span className="badge badge-green">{t('course.enrolled')}</span>}
          </div>
          <h1>{course.title}</h1>
          <Tr text={course.title} className="tr-title" />
          <p>{course.shortDescription || course.description}<Tr text={course.shortDescription || course.description} /></p>
          <div className="course-meta">
            <span><Icon.Book size={15} /> {t('courses.units', { n: data.units.length })}</span>
            <span><Icon.Target size={15} /> {t('courses.lessons', { n: data.totalLessons })}</span>
            {course.durationWeeks > 0 && <span><Icon.Calendar size={15} /> {t('courses.weeks', { n: course.durationWeeks })}</span>}
            <span><Icon.Video size={15} /> {t('course.weeklyLive')}</span>
          </div>
          {data.isEnrolled && data.nextLessonId && (
            <div>
              <button className="btn btn-success btn-lg" onClick={() => navigate(`/lesson/${data.nextLessonId}`)}>
                <Icon.Play size={18} /> {data.completedLessons === 0 ? t('course.startFirst') : t('course.continueLearning')}
              </button>
            </div>
          )}
        </div>
        <div className="course-hero-side">
          <ProgressRing value={data.completionPercent} size={112} stroke={10} />
          <Stars value={Math.round((data.stars / Math.max(1, data.maxStars)) * 3)} size={22} />
          <span className="small" style={{ color: 'rgba(255,255,255,0.8)' }}>{t('course.starsXp', { stars: data.stars, max: data.maxStars, xp: data.xpEarned })}</span>
        </div>
      </section>

      {!data.isEnrolled && (
        <div className="enroll-bar">
          <div>
            <strong>{t('course.enrollTitle')}</strong>
            <p className="muted small">{t('course.enrollText')}</p>
            {enrollError && <div className="alert alert-error" style={{ marginTop: 8 }}>{enrollError}</div>}
          </div>
          <button className="btn btn-primary btn-lg" onClick={enroll} disabled={enrolling}>{enrolling ? t('courses.enrolling') : t('course.enrollForFree')}</button>
        </div>
      )}

      {objectives.length > 0 && (
        <section className="card card-pad">
          <div className="section-title"><h2>{t('course.whatYouLearn')}</h2></div>
          <ul className="objectives">
            {objectives.map((o) => (<li key={o}><Icon.Check size={18} /> <span>{o}<Tr text={o} /></span></li>))}
          </ul>
        </section>
      )}

      <section className="stack" style={{ gap: 14 }}>
        <div className="section-title" style={{ marginBottom: 0 }}><h2>{t('course.syllabus')}</h2><span className="muted small">{t('course.completedOf', { done: data.completedLessons, total: data.totalLessons })}</span></div>
        {data.units.map((u) => (
          <UnitCard key={u.id} unit={u} outline={data} open={open.has(u.id)} onToggle={() => toggle(u.id)} />
        ))}
      </section>
    </div>
  );
}

function UnitCard({ unit, outline, open, onToggle }: { unit: Unit; outline: CourseOutline; open: boolean; onToggle: () => void }) {
  const { t } = useI18n();
  const percent = unit.lessons.length ? Math.round((unit.completedLessons / unit.lessons.length) * 100) : 0;
  const pdf = mediaUrl(unit.pdfUrl);
  return (
    <article className={`card unit ${open ? 'open' : ''}`}>
      <button className="unit-head" onClick={onToggle} aria-expanded={open}>
        <Illustration src={unit.imageUrl} size={56} />
        <div className="unit-title">
          <span className="unit-num">{t('course.unit', { n: unit.order })}</span>
          <strong>{unit.title}</strong>
          <Tr text={unit.title} />
          <span className="it small">{unit.titleIt}</span>
        </div>
        <div className="unit-side">
          {percent === 100 ? <span className="badge badge-green"><Icon.Check size={14} /> {t('course.done')}</span> : <span className="badge badge-gray">{unit.completedLessons}/{unit.lessons.length}</span>}
          <Stars value={Math.round((unit.stars / Math.max(1, unit.lessons.length * 3)) * 3)} />
        </div>
        <Icon.ArrowRight size={20} className="unit-chevron" />
      </button>

      {open && (
        <div className="unit-body">
          <div className="stack" style={{ gap: 12 }}>
            {unit.description && <p className="muted">{unit.description}<Tr text={unit.description} /></p>}
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
                <h4>🎯 {t('course.youWillBeAble')}</h4>
                <ul>{unit.canDo.map((c) => <li key={c}>{c}<Tr text={c} /></li>)}</ul>
              </div>
            )}
            {unit.liveClassFocus && (
              <div className="aside-box">
                <h4>🎥 {t('course.liveThisWeek')}</h4>
                <p>{unit.liveClassFocus}<Tr text={unit.liveClassFocus} /></p>
                <Link to="/live-classes" className="small">{t('course.seeSchedule')}</Link>
              </div>
            )}
            {pdf && outline.isEnrolled && (
              <a className="btn btn-block" href={pdf} target="_blank" rel="noreferrer"><Icon.Download size={18} /> {t('course.studySheet')}</a>
            )}
          </aside>
        </div>
      )}
    </article>
  );
}

function LessonRow({ lesson, isNext }: { lesson: LessonSummary; isNext: boolean }) {
  const { t } = useI18n();
  const meta = KIND_META[lesson.kind];
  const details = [
    t(`kinds.${lesson.kind}`),
    t('course.min', { n: lesson.estimatedMinutes }),
    lesson.vocabularyCount ? t('course.words', { n: lesson.vocabularyCount }) : null,
    lesson.isFreePreview && lesson.locked === false && !lesson.completed ? t('course.freePreview') : null,
  ].filter(Boolean).join(' · ');
  const content = (
    <>
      <span className="lesson-icon" style={{ background: meta.bg, color: meta.color }}>
        {lesson.locked ? <Icon.Lock size={20} /> : meta.emoji}
        {lesson.completed && <span className="done-tick"><Icon.Check size={12} /></span>}
      </span>
      <span className="lesson-text">
        <strong>{lesson.title}</strong>
        <Tr text={lesson.title} />
        <span>{details}</span>
      </span>
      <span className="lesson-end">
        {lesson.completed ? <Stars value={lesson.stars ?? 0} /> : isNext ? <span className="badge badge-green">{t('course.next')}</span> : <span className="badge badge-gray">+{lesson.xpReward} XP</span>}
      </span>
    </>
  );
  if (lesson.locked) {
    return <div className="lesson-row locked" title={t('course.lockedHint')}>{content}</div>;
  }
  return <Link to={`/lesson/${lesson.id}`} className={`lesson-row ${isNext ? 'next' : ''}`}>{content}</Link>;
}

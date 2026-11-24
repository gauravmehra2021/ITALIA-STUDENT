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
import type { CourseOutline, LessonSummary, Module, Unit } from '../types';
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
  const countable = unit.lessons.filter((l) => !l.videoPending).length;
  const percent = countable ? Math.round((unit.completedLessons / countable) * 100) : 0;
  const pdf = mediaUrl(unit.pdfUrl);
  const modules = unit.modules ?? [];
  // The module shown under the cards: the one with the next lesson, else the first open one.
  const defaultModule = modules.find((m) => m.lessons.some((l) => l.id === outline.nextLessonId))
    ?? modules.find((m) => !m.locked) ?? modules[0];
  const [selected, setSelected] = useState<string | undefined>(defaultModule?.id);
  const current = modules.find((m) => m.id === selected) ?? defaultModule;
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
          {modules.length > 0 && <span className="badge badge-blue">{t('course.modules', { n: modules.length })}</span>}
          {percent === 100 ? <span className="badge badge-green"><Icon.Check size={14} /> {t('course.done')}</span> : <span className="badge badge-gray">{unit.completedLessons}/{countable}</span>}
          <Stars value={Math.round((unit.stars / Math.max(1, countable * 3)) * 3)} />
        </div>
        <Icon.ArrowRight size={20} className="unit-chevron" />
      </button>

      {open && (
        <div className="unit-body">
          <div className="stack" style={{ gap: 12 }}>
            {unit.description && <p className="muted">{unit.description}<Tr text={unit.description} /></p>}
            <ProgressBar value={percent} />
            {modules.length > 0 ? (
              <>
                <div className="module-grid" role="list">
                  {modules.map((m) => (
                    <ModuleCard key={m.id} module={m} outline={outline} active={current?.id === m.id} onSelect={() => setSelected(m.id)} />
                  ))}
                </div>
                {current && !current.locked && (
                  <div className="module-lessons">
                    <div className="module-lessons-head">
                      <strong>{t('course.module', { n: current.order })} · {current.title}</strong>
                      <Tr text={current.title} />
                      <span className="muted small">{t('course.lessonsInModule')}</span>
                    </div>
                    <div className="lesson-list">
                      {current.lessons.map((l) => (
                        <LessonRow key={l.id} lesson={l} isNext={outline.isEnrolled && l.id === outline.nextLessonId} />
                      ))}
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="lesson-list">
                {unit.lessons.map((l) => (
                  <LessonRow key={l.id} lesson={l} isNext={outline.isEnrolled && l.id === outline.nextLessonId} />
                ))}
              </div>
            )}
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

const MODULE_EMOJI = ['🎬', '🗣️', '📖', '✍️', '🎧', '🧩', '🏅'];

function ModuleCard({ module, outline, active, onSelect }: { module: Module; outline: CourseOutline; active: boolean; onSelect: () => void }) {
  const { t } = useI18n();
  const navigate = useNavigate();
  const locked = !!module.locked;
  const done = !!module.completed;
  const percent = module.totalLessons ? Math.round((module.completedLessons / module.totalLessons) * 100) : 0;
  const isExam = module.isTest || module.lessons.some((l) => l.kind === 'Exam');
  // Where "Start / Continue" goes: the first open lesson not done yet (skipping videos not recorded yet).
  const target = module.lessons.find((l) => !l.locked && !l.completed && !l.videoPending)
    ?? module.lessons.find((l) => !l.locked && !l.videoPending);
  const status = locked ? 'locked' : done ? 'done' : module.lessons.some((l) => l.id === outline.nextLessonId) ? 'current' : 'open';

  return (
    <article
      role="listitem"
      className={`module-card is-${status} ${active ? 'active' : ''}`}
      onClick={() => !locked && onSelect()}
      title={locked ? (outline.isEnrolled ? t('course.moduleLocked') : t('course.moduleJoin')) : undefined}
    >
      <div className="module-card-top">
        <span className="module-art" aria-hidden>
          {module.imageUrl ? <img src={mediaUrl(module.imageUrl) ?? undefined} alt="" /> : isExam ? '📝' : MODULE_EMOJI[(module.order - 1) % MODULE_EMOJI.length]}
          {locked && <span className="module-lock"><Icon.Lock size={16} /></span>}
          {done && <span className="module-tick"><Icon.Check size={14} /></span>}
        </span>
        <span className="module-num">{t('course.module', { n: module.order })}</span>
      </div>
      <h3>{module.title}</h3>
      <Tr text={module.title} />
      {module.description && <p className="module-desc">{module.description}<Tr text={module.description} /></p>}
      <div className="module-meta">
        {module.isTest
          ? <span className="badge badge-blue">📝 {t('course.testModule')}</span>
          : <span className={`badge ${module.videoReady ? 'badge-blue' : 'badge-gold'}`}>🎬 {module.videoReady ? t('course.videoFirst') : t('course.videoSoon')}</span>}
      </div>
      <div className="module-progress">
        <ProgressBar value={percent} />
        <span className="muted small">{t('course.lessonsDone', { done: module.completedLessons, total: module.totalLessons })}</span>
      </div>
      <div className="module-foot">
        {locked ? (
          <span className="module-locked-text"><Icon.Lock size={15} /> {outline.isEnrolled ? t('course.moduleLocked') : t('course.moduleJoin')}</span>
        ) : (
          <>
            {done ? <span className="badge badge-green"><Icon.Check size={14} /> {t('course.moduleDone')}</span> : <Stars value={Math.round((module.stars / Math.max(1, module.totalLessons * 3)) * 3)} />}
            {target && (
              <button
                type="button"
                className={`btn btn-sm ${done ? '' : 'btn-success'}`}
                onClick={(e) => { e.stopPropagation(); navigate(`/lesson/${target.id}`); }}
              >
                {done ? t('course.moduleReview') : module.completedLessons === 0 ? t('course.moduleStart') : t('course.moduleContinue')} <Icon.ArrowRight size={16} />
              </button>
            )}
          </>
        )}
      </div>
    </article>
  );
}

function LessonRow({ lesson, isNext }: { lesson: LessonSummary; isNext: boolean }) {
  const { t } = useI18n();
  const meta = KIND_META[lesson.kind];
  const details = [
    lesson.videoPending ? t('course.videoSoon') : t(`kinds.${lesson.kind}`),
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
        {lesson.videoPending ? <span className="badge badge-gold">🎬 {t('course.videoSoon')}</span> : lesson.completed ? <Stars value={lesson.stars ?? 0} /> : isNext ? <span className="badge badge-green">{t('course.next')}</span> : <span className="badge badge-gray">+{lesson.xpReward} XP</span>}
      </span>
    </>
  );
  if (lesson.locked) {
    return <div className="lesson-row locked" title={t('course.lockedHint')}>{content}</div>;
  }
  return <Link to={`/lesson/${lesson.id}`} className={`lesson-row ${isNext ? 'next' : ''}`}>{content}</Link>;
}

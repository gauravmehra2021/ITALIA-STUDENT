import { Link } from 'react-router-dom';
import { useAsync } from '../hooks/useAsync';
import { learnApi } from '../services/api';
import { Empty, ErrorState, Illustration, Loading, ProgressBar, ProgressRing, Stars } from '../components/ui';
import { Icon } from '../components/Icons';
import { useI18n } from '../i18n';
import { Tr } from '../i18n/content';
import './pages.css';

export function ProgressPage() {
  const { t } = useI18n();
  const { data, error, loading, reload } = useAsync(async () => {
    const summary = await learnApi.me();
    const outlines = await Promise.all(summary.myCourses.map((c) => learnApi.course(c.course.id)));
    return { summary, outlines };
  });

  if (loading && !data) return <Loading label={t('progress.loading')} />;
  if (error || !data) return <ErrorState message={error ?? t('progress.loadError')} onRetry={reload} />;

  const { summary, outlines } = data;

  return (
    <div className="page">
      <div className="page-head">
        <div>
          <h1>{t('progress.title')}</h1>
          <p>{t('progress.subtitle')}</p>
        </div>
      </div>

      <div className="stat-grid">
        <div className="stat-tile orange"><span className="stat-icon"><Icon.Flame size={22} /></span><div><strong>{summary.streakDays}</strong><span>{t('progress.streak')}</span></div></div>
        <div className="stat-tile blue"><span className="stat-icon"><Icon.Bolt size={22} /></span><div><strong>{summary.totalXp}</strong><span>{t('progress.xp')}</span></div></div>
        <div className="stat-tile green"><span className="stat-icon"><Icon.Star size={22} /></span><div><strong>{summary.starsEarned}</strong><span>{t('progress.stars')}</span></div></div>
        <div className="stat-tile purple"><span className="stat-icon"><Icon.Words size={22} /></span><div><strong>{summary.wordsLearned}</strong><span>{t('progress.words')}</span></div></div>
      </div>

      {outlines.length === 0 && (
        <div className="card">
          <Empty icon="🌱" title={t('progress.empty')}>
            <Link to="/courses" className="btn btn-primary">{t('progress.choose')}</Link>
          </Empty>
        </div>
      )}

      {outlines.map((o) => (
        <section key={o.course.id} className="card card-pad stack">
          <div className="row-between wrap">
            <div className="row">
              <ProgressRing value={o.completionPercent} size={72} />
              <div>
                <h2>{o.course.title}</h2>
                <Tr text={o.course.title} />
                <p className="muted small">{t('progress.summary', { done: o.completedLessons, total: o.totalLessons, stars: o.stars, max: o.maxStars, xp: o.xpEarned })}</p>
              </div>
            </div>
            <Link to={`/courses/${o.course.id}`} className="btn btn-sm">{t('progress.open')} <Icon.ArrowRight size={16} /></Link>
          </div>
          <div>
            {o.units.map((u) => {
              const pct = u.lessons.length ? Math.round((u.completedLessons / u.lessons.length) * 100) : 0;
              return (
                <div key={u.id} className="unit-progress-row">
                  <Illustration src={u.imageUrl} size={32} />
                  <div style={{ minWidth: 0 }}>
                    <strong className="ellipsis">{t('progress.unitRow', { n: u.order, title: u.title })}</strong>
                    <span className="muted small">{t('progress.lessons', { done: u.completedLessons, total: u.lessons.length })}</span>
                  </div>
                  <ProgressBar value={pct} />
                  <Stars value={Math.round((u.stars / Math.max(1, u.lessons.length * 3)) * 3)} size={14} />
                </div>
              );
            })}
          </div>
        </section>
      ))}
    </div>
  );
}

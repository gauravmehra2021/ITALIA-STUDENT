import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useAsync } from '../hooks/useAsync';
import { useLearner } from '../hooks/useLearner';
import { learnApi } from '../services/api';
import { stopSpeaking } from '../lib/speech';
import { RichText } from '../lib/RichText';
import { LessonBlockView } from '../components/LessonBlocks';
import { ExerciseView } from '../components/Exercises';
import { ErrorState, KIND_META, Loading, ProgressBar, Stars } from '../components/ui';
import { Icon } from '../components/Icons';
import type { Lesson, LessonResult } from '../types';
import './lesson.css';

type Phase = 'learn' | 'practice' | 'result';

export function LessonPage() {
  const { id = '' } = useParams();
  const { data: lesson, error, loading, reload } = useAsync(() => learnApi.lesson(id), [id]);

  useEffect(() => () => stopSpeaking(), [id]);

  if (loading && !lesson) return <div className="player"><Loading label="Opening lesson…" /></div>;
  if (error || !lesson) {
    return (
      <div className="player">
        <ErrorState message={error ?? 'Could not open this lesson.'} onRetry={reload} />
        <div style={{ textAlign: 'center' }}><Link to="/courses" className="btn">Back to courses</Link></div>
      </div>
    );
  }
  return <Player key={lesson.id} lesson={lesson} />;
}

function Player({ lesson }: { lesson: Lesson }) {
  const navigate = useNavigate();
  const { refresh } = useLearner();
  const [phase, setPhase] = useState<Phase>('learn');
  const [index, setIndex] = useState(0);
  const [answered, setAnswered] = useState<{ correct: boolean; answer: string } | null>(null);
  const [correctCount, setCorrectCount] = useState(0);
  const [result, setResult] = useState<LessonResult | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const meta = KIND_META[lesson.kind];
  const total = lesson.exercises.length;
  const exercise = lesson.exercises[index];
  const progress = phase === 'learn' ? 0 : phase === 'result' ? 100 : Math.round(((index + (answered ? 1 : 0)) / Math.max(1, total)) * 100);

  const backToCourse = () => navigate(`/courses/${lesson.courseId}`);

  async function finish(score: number, correct: number) {
    setPhase('result');
    setSaving(true);
    setSaveError(null);
    try {
      setResult(await learnApi.complete(lesson.id, score, correct, total));
      void refresh();
    } catch (e) {
      setSaveError(e instanceof Error ? e.message : 'Could not save your result.');
    } finally {
      setSaving(false);
    }
  }

  function next() {
    stopSpeaking();
    const correct = correctCount;
    if (index + 1 >= total) {
      void finish(Math.round((correct / Math.max(1, total)) * 100), correct);
      return;
    }
    setIndex(index + 1);
    setAnswered(null);
  }

  // Enter = continue
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Enter' && phase === 'practice' && answered) next();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  return (
    <div className="player">
      <header className="player-top">
        <button className="icon-btn" onClick={backToCourse} aria-label="Close lesson" title="Back to the course"><Icon.X size={20} /></button>
        <div className="player-progress">
          <ProgressBar value={progress} />
        </div>
        <span className="player-step">{phase === 'practice' ? `${index + 1} / ${total}` : phase === 'learn' ? 'Learn' : 'Done'}</span>
      </header>

      {phase === 'learn' && (
        <div className="player-body">
          <div className="lesson-intro">
            <span className="lesson-kind" style={{ background: meta.bg, color: meta.color }}>{meta.emoji} {meta.label}</span>
            <span className="muted small">{lesson.unitTitle}</span>
            <h1>{lesson.title}</h1>
            {lesson.titleIt && <p className="it lesson-it">{lesson.titleIt}</p>}
            {lesson.summary && <p className="muted">{lesson.summary}</p>}
            <div className="row wrap lesson-facts">
              <span><Icon.Clock size={16} /> {lesson.estimatedMinutes} min</span>
              <span><Icon.Target size={16} /> {total} exercises</span>
              <span><Icon.Bolt size={16} /> {lesson.xpReward} XP</span>
              {lesson.stars ? <Stars value={lesson.stars} /> : null}
            </div>
          </div>

          <div className="blocks">
            {lesson.blocks.map((b) => <LessonBlockView key={b.id} block={b} />)}
          </div>

          {lesson.homework && (
            <section className="homework">
              <h3>📝 Homework for the live class</h3>
              <RichText text={lesson.homework} />
            </section>
          )}
        </div>
      )}

      {phase === 'practice' && exercise && (
        <div className="player-body practice">
          <ExerciseView
            key={exercise.id}
            exercise={exercise}
            answered={answered !== null}
            onAnswered={(ok, answer) => {
              setAnswered({ correct: ok, answer });
              if (ok) setCorrectCount((c) => c + 1);
            }}
          />
        </div>
      )}

      {phase === 'result' && (
        <div className="player-body">
          <ResultView lesson={lesson} result={result} saving={saving} error={saveError} total={total} correct={correctCount}
            onRetry={() => { setPhase('practice'); setIndex(0); setCorrectCount(0); setAnswered(null); setResult(null); }}
            onNext={() => (result?.nextLessonId ?? lesson.nextLessonId) ? navigate(`/lesson/${result?.nextLessonId ?? lesson.nextLessonId}`) : backToCourse()}
            onCourse={backToCourse} />
        </div>
      )}

      {/* Bottom action bar */}
      {phase === 'learn' && (
        <footer className="player-foot">
          <div className="player-foot-inner">
            <span className="muted small">{total > 0 ? 'Studied everything? Practise to earn your stars.' : 'Finished? Mark the lesson as complete.'}</span>
            {total > 0 ? (
              <button className="btn btn-success btn-lg" onClick={() => { stopSpeaking(); window.scrollTo({ top: 0 }); setPhase('practice'); }}>
                Start practice <Icon.ArrowRight size={18} />
              </button>
            ) : (
              <button className="btn btn-success btn-lg" onClick={() => void finish(100, 0)}>Complete lesson <Icon.Check size={18} /></button>
            )}
          </div>
        </footer>
      )}

      {phase === 'practice' && answered && (
        <footer className={`player-foot feedback ${answered.correct ? 'ok' : 'bad'}`}>
          <div className="player-foot-inner">
            <div className="feedback-text">
              <span className="feedback-icon">{answered.correct ? <Icon.Check size={22} /> : <Icon.X size={22} />}</span>
              <div>
                <strong>{answered.correct ? pickPraise(index) : 'Not quite'}</strong>
                {!answered.correct && answered.answer && <span>Correct answer: <b>{answered.answer}</b></span>}
                {exercise?.explanation && <span>{exercise.explanation}</span>}
              </div>
            </div>
            <button className={`btn btn-lg ${answered.correct ? 'btn-success' : 'btn-danger'}`} onClick={next} autoFocus>
              {index + 1 >= total ? 'See results' : 'Continue'}
            </button>
          </div>
        </footer>
      )}
    </div>
  );
}

const PRAISE = ['Bravo!', 'Perfetto!', 'Ottimo!', 'Esatto!', 'Benissimo!', 'Giusto!'];
const pickPraise = (i: number) => PRAISE[i % PRAISE.length];

function ResultView({ lesson, result, saving, error, total, correct, onRetry, onNext, onCourse }: {
  lesson: Lesson; result: LessonResult | null; saving: boolean; error: string | null; total: number; correct: number;
  onRetry: () => void; onNext: () => void; onCourse: () => void;
}) {
  if (saving) return <Loading label="Saving your result…" />;
  if (error) {
    return (
      <div className="result">
        <ErrorState message={error} />
        <button className="btn" onClick={onCourse}>Back to the course</button>
      </div>
    );
  }
  if (!result) return null;

  const passed = result.stars > 0;
  const isTest = lesson.kind === 'Exam';
  const passMark = isTest ? 60 : 50;
  const title = result.courseCompleted ? 'Course completed! 🎓' : result.unitCompleted ? 'Unit completed! 🏆'
    : passed ? (isTest ? 'Test passed! 🎉' : result.stars === 3 ? 'Perfetto!' : 'Ben fatto!')
    : isTest ? 'Not passed yet' : 'Keep practising';
  return (
    <div className="result">
      <div className="result-stars">
        {[0, 1, 2].map((i) => (
          <span key={i} className={`big-star ${i < result.stars ? 'on' : ''}`} style={{ animationDelay: `${i * 0.18}s` }}>
            <Icon.Star size={i === 1 ? 84 : 64} />
          </span>
        ))}
      </div>
      <h1>{title}</h1>
      <p className="muted">
        {total > 0 ? <>You answered <strong>{correct} of {total}</strong> correctly ({result.scorePercent}%).</> : 'Lesson completed.'}
        {!passed && ` You need at least ${passMark}% to ${isTest ? 'pass the test' : 'complete the lesson'}. Try again!`}
      </p>
      <div className="result-tiles">
        <div className="result-tile xp"><Icon.Bolt size={22} /><strong>+{result.xpGained}</strong><span>XP</span></div>
        <div className="result-tile streak"><Icon.Flame size={22} /><strong>{result.streakDays}</strong><span>day streak</span></div>
        <div className="result-tile course"><Icon.Chart size={22} /><strong>{result.courseCompletionPercent}%</strong><span>of the course</span></div>
      </div>
      {lesson.homework && passed && (
        <div className="homework" style={{ textAlign: 'left' }}>
          <h3>📝 {isTest ? 'With your teacher' : 'Homework for the live class'}</h3>
          <RichText text={lesson.homework} />
        </div>
      )}
      <div className="row wrap result-actions">
        {total > 0 && <button className="btn btn-lg" onClick={onRetry}><Icon.Refresh size={18} /> Practise again</button>}
        {passed && (result.nextLessonId || lesson.nextLessonId) ? (
          <button className="btn btn-success btn-lg" onClick={onNext}>Next lesson <Icon.ArrowRight size={18} /></button>
        ) : (
          <button className="btn btn-primary btn-lg" onClick={onCourse}>Back to the course</button>
        )}
      </div>
    </div>
  );
}

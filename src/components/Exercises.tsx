import { useEffect, useMemo, useState } from 'react';
import { mediaUrl } from '../lib/media';
import { speak } from '../lib/speech';
import { AudioButton } from './ui';
import { Icon } from './Icons';
import type { Exercise } from '../types';

/** Called once per exercise: whether it was answered correctly on the first try. */
export type OnAnswered = (correct: boolean, correctAnswer: string) => void;

export function ExerciseView({ exercise, onAnswered, answered }: { exercise: Exercise; onAnswered: OnAnswered; answered: boolean }) {
  switch (exercise.type) {
    case 'MatchPairs':
      return <MatchPairs exercise={exercise} onAnswered={onAnswered} />;
    case 'WordOrder':
      return <WordOrder exercise={exercise} onAnswered={onAnswered} answered={answered} />;
    default:
      return <Choice exercise={exercise} onAnswered={onAnswered} answered={answered} />;
  }
}

// ── Multiple choice (listen & pick, picture → word, translation, fill the gap, true/false) ──

function Choice({ exercise, onAnswered, answered }: { exercise: Exercise; onAnswered: OnAnswered; answered: boolean }) {
  const [picked, setPicked] = useState<number | null>(null);
  const isListen = exercise.type === 'ListenPick';
  const imageOptions = exercise.options.some((o) => o.imageUrl);
  const correctText = exercise.options[exercise.correctIndex]?.text ?? '';

  useEffect(() => {
    setPicked(null);
    if (isListen && exercise.italian) {
      const t = setTimeout(() => void speak(exercise.italian!), 350);
      return () => clearTimeout(t);
    }
  }, [exercise.id]); // eslint-disable-line react-hooks/exhaustive-deps

  function choose(i: number) {
    if (answered || picked !== null) return;
    setPicked(i);
    const ok = i === exercise.correctIndex;
    if (ok && !isListen && exercise.type !== 'FillBlank') {
      // Reinforce the Italian word when the option itself is Italian.
      if (exercise.type === 'PickWord') void speak(correctText);
    }
    if (exercise.type === 'FillBlank' && exercise.italian) void speak(exercise.italian.replace('___', correctText));
    onAnswered(ok, exercise.type === 'FillBlank' && exercise.italian ? exercise.italian.replace('___', correctText) : correctText);
  }

  // Keyboard: 1–4 to answer.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const n = Number(e.key);
      if (n >= 1 && n <= exercise.options.length) choose(n - 1);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  const stateOf = (i: number) => {
    if (picked === null) return '';
    if (i === exercise.correctIndex) return 'correct';
    if (i === picked) return 'wrong';
    return 'dim';
  };

  return (
    <div className="ex">
      <h2 className="ex-prompt">{exercise.prompt}</h2>

      {isListen && (
        <div className="ex-listen">
          <AudioButton text={exercise.italian ?? ''} size="lg" label="Play the word again" />
          <button className="btn btn-sm btn-ghost" onClick={() => void speak(exercise.italian ?? '', { slow: true })}><Icon.Turtle size={18} /> Slower</button>
        </div>
      )}

      {exercise.type === 'PickWord' && exercise.imageUrl && (
        <div className="ex-picture"><img src={mediaUrl(exercise.imageUrl) ?? undefined} alt="" /></div>
      )}

      {!isListen && exercise.italian && exercise.type !== 'FillBlank' && (
        <div className="ex-italian">
          <AudioButton text={exercise.italian} size="md" />
          <span>{exercise.italian}</span>
        </div>
      )}

      {exercise.type === 'FillBlank' && exercise.italian && (
        <div className="ex-sentence">
          {exercise.italian.split('___').map((part, i, arr) => (
            <span key={i}>
              {part}
              {i < arr.length - 1 && (
                <span className={`gap ${picked !== null ? (picked === exercise.correctIndex ? 'gap-ok' : 'gap-bad') : ''}`}>
                  {picked !== null ? exercise.options[picked].text : '     '}
                </span>
              )}
            </span>
          ))}
        </div>
      )}

      <div className={`ex-options ${imageOptions ? 'ex-options-images' : ''} ${exercise.type === 'TrueFalse' ? 'ex-options-tf' : ''}`}>
        {exercise.options.map((o, i) => (
          <button key={i} type="button" className={`opt ${stateOf(i)}`} onClick={() => choose(i)} disabled={picked !== null || answered}>
            {imageOptions ? (
              <>
                {o.imageUrl && <img src={mediaUrl(o.imageUrl) ?? undefined} alt="" />}
                {/* Listening: hide the word until answered so the student must listen. */}
                <span className="opt-label">{picked !== null || !isListen ? o.text : ' '}</span>
              </>
            ) : (
              <>
                <span className="opt-key">{i + 1}</span>
                <span className="opt-text">{o.text}</span>
              </>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}

// ── Match pairs ───────────────────────────────────────────────────────────

function shuffled<T>(list: T[], seed: string): T[] {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) | 0;
  const a = [...list];
  for (let i = a.length - 1; i > 0; i--) {
    h = (h * 1103515245 + 12345) | 0;
    const j = Math.abs(h) % (i + 1);
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function MatchPairs({ exercise, onAnswered }: { exercise: Exercise; onAnswered: OnAnswered }) {
  const left = useMemo(() => shuffled(exercise.pairs.map((p) => p.left), exercise.id + 'L'), [exercise]);
  const right = useMemo(() => shuffled(exercise.pairs.map((p) => p.right), exercise.id + 'R'), [exercise]);
  const [selLeft, setSelLeft] = useState<string | null>(null);
  const [selRight, setSelRight] = useState<string | null>(null);
  const [matched, setMatched] = useState<Set<string>>(new Set());
  const [wrong, setWrong] = useState<string | null>(null);
  const [mistakes, setMistakes] = useState(0);

  useEffect(() => {
    if (selLeft === null || selRight === null) return;
    const pair = exercise.pairs.find((p) => p.left === selLeft);
    if (pair?.right === selRight) {
      const next = new Set(matched).add(selLeft);
      setMatched(next);
      if (next.size === exercise.pairs.length) onAnswered(mistakes === 0, '');
    } else {
      setMistakes((m) => m + 1);
      setWrong(selLeft + '|' + selRight);
      setTimeout(() => setWrong(null), 500);
    }
    setSelLeft(null);
    setSelRight(null);
  }, [selLeft, selRight]); // eslint-disable-line react-hooks/exhaustive-deps

  const rightMatched = (r: string) => exercise.pairs.some((p) => p.right === r && matched.has(p.left));

  return (
    <div className="ex">
      <h2 className="ex-prompt">{exercise.prompt}</h2>
      <div className="match">
        <div className="match-col">
          {left.map((l) => (
            <button
              key={l}
              type="button"
              className={`opt match-item ${matched.has(l) ? 'correct' : ''} ${selLeft === l ? 'selected' : ''} ${wrong?.startsWith(l + '|') ? 'wrong' : ''}`}
              disabled={matched.has(l)}
              onClick={() => {
                setSelLeft(l);
                void speak(l);
              }}
            >
              {l}
            </button>
          ))}
        </div>
        <div className="match-col">
          {right.map((r) => (
            <button
              key={r}
              type="button"
              className={`opt match-item ${rightMatched(r) ? 'correct' : ''} ${selRight === r ? 'selected' : ''} ${wrong?.endsWith('|' + r) ? 'wrong' : ''}`}
              disabled={rightMatched(r)}
              onClick={() => setSelRight(r)}
            >
              {r}
            </button>
          ))}
        </div>
      </div>
      <p className="muted small" style={{ textAlign: 'center' }}>Tap an Italian word, then its meaning.</p>
    </div>
  );
}

// ── Word order ────────────────────────────────────────────────────────────

const normalize = (s: string) => s.toLowerCase().replace(/[.,!?;:¿¡"«»]/g, '').replace(/\s+/g, ' ').trim();

function WordOrder({ exercise, onAnswered, answered }: { exercise: Exercise; onAnswered: OnAnswered; answered: boolean }) {
  const answer = exercise.answer ?? '';
  const tokens = useMemo(() => {
    const words = answer.split(/\s+/).filter(Boolean).map((w, i) => ({ id: i, w }));
    let s = shuffled(words, exercise.id);
    // Never show the sentence already in the right order.
    if (s.map((t) => t.w).join(' ') === answer && s.length > 1) s = [...s.slice(1), s[0]];
    return s;
  }, [exercise, answer]);
  const [chosen, setChosen] = useState<number[]>([]);
  const [result, setResult] = useState<'ok' | 'bad' | null>(null);

  const built = chosen.map((id) => tokens.find((t) => t.id === id)!.w).join(' ');

  function check() {
    const ok = normalize(built) === normalize(answer);
    setResult(ok ? 'ok' : 'bad');
    void speak(answer);
    onAnswered(ok, answer);
  }

  return (
    <div className="ex">
      <h2 className="ex-prompt">{exercise.prompt}</h2>
      <div className={`wo-answer ${result === 'ok' ? 'ok' : result === 'bad' ? 'bad' : ''}`}>
        {chosen.length === 0 && <span className="muted">Tap the words below…</span>}
        {chosen.map((id) => (
          <button key={id} type="button" className="wo-token" disabled={answered} onClick={() => setChosen((c) => c.filter((x) => x !== id))}>
            {tokens.find((t) => t.id === id)!.w}
          </button>
        ))}
      </div>
      <div className="wo-bank">
        {tokens.map((t) => (
          <button key={t.id} type="button" className={`wo-token ${chosen.includes(t.id) ? 'used' : ''}`} disabled={chosen.includes(t.id) || answered}
            onClick={() => setChosen((c) => [...c, t.id])}>
            {t.w}
          </button>
        ))}
      </div>
      {!answered && (
        <button className="btn btn-primary btn-lg ex-check" disabled={chosen.length !== tokens.length} onClick={check}>Check</button>
      )}
    </div>
  );
}

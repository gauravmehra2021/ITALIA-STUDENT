import { useEffect, useMemo, useRef, useState } from 'react';
import { speak, stopSpeaking } from '../lib/speech';
import { AudioButton } from './ui';
import { Icon } from './Icons';
import { useI18n } from '../i18n';
import { Tr } from '../i18n/content';
import type { LessonBlock } from '../types';

/* ────────────────────────────────────────────────────────────────────────────
 * Speaking practice: a chat-style role-play.
 * The partner's lines play with audio; on the learner's turns the learner taps
 * a suggested reply, says it into the microphone, or types it.
 * ──────────────────────────────────────────────────────────────────────────── */

type Reply = { italian: string; english: string };
type Msg = { from: 'partner' | 'you'; italian: string; english: string; heard?: string };

// Browser speech recognition (Chrome, Edge, Android, recent Safari).
type Recognition = {
  lang: string;
  interimResults: boolean;
  maxAlternatives: number;
  start: () => void;
  stop: () => void;
  onresult: ((e: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void) | null;
  onerror: ((e: { error: string }) => void) | null;
  onend: (() => void) | null;
};
const RecognitionCtor: (new () => Recognition) | undefined =
  typeof window !== 'undefined'
    ? ((window as unknown as Record<string, unknown>).SpeechRecognition as new () => Recognition) ||
      ((window as unknown as Record<string, unknown>).webkitSpeechRecognition as new () => Recognition)
    : undefined;

const normalize = (s: string) =>
  s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9\s]/g, ' ').replace(/\s+/g, ' ').trim();

/** Share of the reply's words that the learner said (0–1). Small slips are fine. */
function similarity(said: string, target: string) {
  const a = normalize(said).split(' ').filter(Boolean);
  const b = normalize(target).split(' ').filter(Boolean);
  if (b.length === 0) return 0;
  const pool = [...a];
  let hit = 0;
  for (const word of b) {
    const i = pool.findIndex((p) => p === word || (word.length > 3 && (p.startsWith(word.slice(0, -1)) || word.startsWith(p.slice(0, -1)))));
    if (i >= 0) {
      hit++;
      pool.splice(i, 1);
    }
  }
  return hit / b.length;
}

function bestMatch(said: string, replies: Reply[]) {
  let best: { reply: Reply; score: number } | null = null;
  for (const r of replies) {
    const score = similarity(said, r.italian);
    if (!best || score > best.score) best = { reply: r, score };
  }
  return best && best.score >= 0.6 ? best.reply : null;
}

export function RoleplayBlock({ block }: { block: LessonBlock }) {
  const { t } = useI18n();
  const lines = block.lines;
  const partner = block.caption || lines.find((l) => !l.isLearner)?.speaker || 'Partner';

  const [step, setStep] = useState(0); // index of the next line to handle
  const [messages, setMessages] = useState<Msg[]>([]);
  const [showEnglish, setShowEnglish] = useState(true);
  const [started, setStarted] = useState(false);
  const [listening, setListening] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [typed, setTyped] = useState('');
  const recRef = useRef<Recognition | null>(null);
  const endRef = useRef<HTMLDivElement>(null);
  const alive = useRef(true);

  const current = lines[step];
  const finished = started && step >= lines.length;
  const learnerTurn = started && current?.isLearner;

  // All acceptable answers for the current turn (model answer + alternatives), in a stable order.
  const replies: Reply[] = useMemo(() => {
    if (!current?.isLearner) return [];
    const all = [{ italian: current.italian, english: current.english }, ...(current.replies ?? [])];
    return step % 2 === 0 ? all : [...all].reverse();
  }, [current, step]);

  useEffect(() => {
    alive.current = true;
    return () => {
      alive.current = false;
      stopSpeaking();
      recRef.current?.stop();
    };
  }, []);

  // Partner lines play automatically, one after another, until it's the learner's turn.
  useEffect(() => {
    if (!started || !current || current.isLearner) return;
    let cancelled = false;
    setMessages((m) => [...m, { from: 'partner', italian: current.italian, english: current.english }]);
    // Some devices never report the end of speech: continue after a sensible time anyway.
    const maxWait = new Promise<void>((r) => setTimeout(r, 1200 + current.italian.split(' ').length * 550));
    void Promise.race([speak(current.italian, { audioUrl: current.audioUrl }), maxWait]).then(() => {
      if (!cancelled && alive.current) setStep((s) => s + 1);
    });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [started, step]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }, [messages, step]);

  function answer(reply: Reply, heard?: string) {
    stopSpeaking();
    recRef.current?.stop();
    setNotice(null);
    setTyped('');
    setMessages((m) => [...m, { from: 'you', italian: reply.italian, english: reply.english, heard }]);
    setStep((s) => s + 1);
  }

  function listen() {
    if (!RecognitionCtor) {
      setNotice(t('roleplay.noSpeech'));
      return;
    }
    stopSpeaking();
    const rec = new RecognitionCtor();
    rec.lang = 'it-IT';
    rec.interimResults = false;
    rec.maxAlternatives = 3;
    rec.onresult = (e) => {
      const alts = Array.from(e.results[0] ?? []).map((a) => a.transcript);
      for (const said of alts) {
        const hit = bestMatch(said, replies);
        if (hit) return answer(hit, said);
      }
      setNotice(t('roleplay.heard', { text: alts[0] ?? '…' }));
    };
    rec.onerror = (e) => {
      setNotice(e.error === 'not-allowed' ? t('roleplay.allowMic') : t('roleplay.heardNothing'));
    };
    rec.onend = () => setListening(false);
    recRef.current = rec;
    setNotice(null);
    setListening(true);
    rec.start();
  }

  function submitTyped() {
    if (!typed.trim()) return;
    const hit = bestMatch(typed, replies);
    if (hit) answer(hit, typed.trim());
    else setNotice(t('roleplay.notQuite'));
  }

  function restart() {
    stopSpeaking();
    setMessages([]);
    setStep(0);
    setNotice(null);
    setStarted(true);
  }

  return (
    <section className="lb rp">
      <div className="lb-head">
        <h3>🗣️ {block.title || t('roleplay.title')}</h3>
        <button className="btn btn-sm" onClick={() => setShowEnglish((v) => !v)}>{showEnglish ? t('roleplay.hideEnglish') : t('roleplay.showEnglish')}</button>
      </div>

      {!started ? (
        <div className="rp-start card card-pad">
          <div className="rp-start-avatars" aria-hidden>
            <span className="rp-avatar">{partner.slice(0, 1)}</span>
            <span className="rp-avatar you">{t('roleplay.you')}</span>
          </div>
          <div>
            <strong>{t('roleplay.talkWith', { name: partner })}</strong>
            <p className="muted small">{t('roleplay.intro', { name: partner })}</p>
          </div>
          <button className="btn btn-success" onClick={() => setStarted(true)}><Icon.Play size={16} /> {t('roleplay.start')}</button>
        </div>
      ) : (
        <div className="rp-chat card">
          <div className="rp-messages" aria-live="polite">
            {messages.map((m, i) => (
              <div key={i} className={`rp-msg ${m.from === 'you' ? 'rp-you' : ''}`}>
                {m.from === 'partner' && <span className="rp-avatar sm">{partner.slice(0, 1)}</span>}
                <div className="rp-bubble">
                  <div className="rp-line">
                    <strong>{m.italian}</strong>
                    <AudioButton text={m.italian} size="sm" />
                  </div>
                  {showEnglish && <span className="rp-en">{m.english}</span>}
                  {showEnglish && <Tr text={m.english} />}
                  {m.heard && normalize(m.heard) !== normalize(m.italian) && <span className="rp-heard">{t('roleplay.youSaid', { text: m.heard })}</span>}
                </div>
              </div>
            ))}
            {started && current && !current.isLearner && (
              <div className="rp-msg"><span className="rp-avatar sm">{partner.slice(0, 1)}</span><div className="rp-bubble rp-typing"><span /><span /><span /></div></div>
            )}
            <div ref={endRef} />
          </div>

          {learnerTurn && (
            <div className="rp-turn">
              <div className="rp-turn-label">{t('roleplay.yourTurn')}</div>
              <div className="rp-replies">
                {replies.map((r) => (
                  <div key={r.italian} className="rp-reply">
                    <button type="button" className="rp-reply-main" onClick={() => answer(r)}>
                      <strong>{r.italian}</strong>
                      {showEnglish && <span>{r.english}</span>}
                      {showEnglish && <Tr text={r.english} />}
                    </button>
                    <AudioButton text={r.italian} size="sm" />
                  </div>
                ))}
              </div>
              {notice && <div className="alert alert-info small">{notice}</div>}
              <div className="rp-input">
                <input
                  className="input"
                  value={typed}
                  onChange={(e) => setTyped(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && submitTyped()}
                  placeholder={t('roleplay.typePlaceholder')}
                  aria-label={t('roleplay.typeLabel')}
                />
                <button type="button" className="btn" onClick={submitTyped} disabled={!typed.trim()}>{t('roleplay.send')}</button>
                <button
                  type="button"
                  className={`rp-mic ${listening ? 'on' : ''}`}
                  onClick={() => (listening ? recRef.current?.stop() : listen())}
                  aria-label={listening ? t('roleplay.stopListening') : t('roleplay.sayAnswer')}
                  title={listening ? t('roleplay.listening') : t('roleplay.sayAnswer')}
                >
                  <Icon.Mic size={22} />
                </button>
              </div>
            </div>
          )}

          {finished && (
            <div className="rp-done">
              <span className="rp-done-icon">🎉</span>
              <div>
                <strong>{t('roleplay.finished')}</strong>
                <p className="muted small">{t('roleplay.finishedText')}</p>
              </div>
              <button className="btn btn-sm" onClick={restart}><Icon.Refresh size={14} /> {t('roleplay.again')}</button>
            </div>
          )}
        </div>
      )}
    </section>
  );
}

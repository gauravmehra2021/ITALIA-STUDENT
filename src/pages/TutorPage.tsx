import { useEffect, useRef, useState, type FormEvent } from 'react';
import { aiApi } from '../services/api';
import { Icon } from '../components/Icons';
import { apiFromCode, useI18n } from '../i18n';
import './pages.css';

type Mode = 'tutor' | 'translator' | 'conversation' | 'practice';
type Message = { from: 'me' | 'bot'; text: string };

const MODES: { id: Mode; label: string; hint: string; suggestions: string[] }[] = [
  {
    id: 'tutor',
    label: 'tutor.ask',
    hint: 'tutor.askHint',
    suggestions: ['tutor.suggestAsk1', 'tutor.suggestAsk2', 'tutor.suggestAsk3'],
  },
  {
    id: 'translator',
    label: 'tutor.translate',
    hint: 'tutor.translateHint',
    suggestions: ['tutor.suggestTranslate1', 'tutor.suggestTranslate2', 'tutor.suggestTranslate3'],
  },
  {
    id: 'conversation',
    label: 'tutor.conversation',
    hint: 'tutor.conversationHint',
    suggestions: ['Ciao! Come stai?', 'Vorrei un caffè, per favore.', 'Mi chiamo… e sono di…'],
  },
];

export function TutorPage() {
  const { t, lang } = useI18n();
  const [mode, setMode] = useState<Mode>('tutor');
  const [messages, setMessages] = useState<Message[]>([{ from: 'bot', text: t('tutor.welcome') }]);
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const logRef = useRef<HTMLDivElement>(null);
  const current = MODES.find((m) => m.id === mode)!;

  // Show the welcome message in the language just chosen (only before the chat starts).
  useEffect(() => {
    setMessages((m) => (m.length === 1 && m[0].from === 'bot' ? [{ from: 'bot', text: t('tutor.welcome') }] : m));
  }, [t]);

  useEffect(() => {
    logRef.current?.scrollTo({ top: logRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages]);

  async function send(text: string) {
    const prompt = text.trim();
    if (!prompt || busy) return;
    setMessages((m) => [...m, { from: 'me', text: prompt }]);
    setInput('');
    setBusy(true);
    try {
      const res = await aiApi.ask(mode, prompt, lang === 'pa' ? 'Punjabi (Roman letters)' : apiFromCode(lang));
      setMessages((m) => [...m, { from: 'bot', text: res.response }]);
    } catch (e) {
      setMessages((m) => [...m, { from: 'bot', text: `${t('tutor.sorry')} ${e instanceof Error ? e.message : ''}` }]);
    } finally {
      setBusy(false);
    }
  }

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    void send(input);
  };

  return (
    <div className="page">
      <div className="page-head">
        <div className="row">
          <img src="/images/ui/chikoo-card.png" alt="" width={56} height={56} style={{ borderRadius: 16 }} />
          <div>
            <h1>{t('tutor.title')}</h1>
            <p>{t(current.hint)}</p>
          </div>
        </div>
        <div className="mode-tabs" role="tablist">
          {MODES.map((m) => (
            <button key={m.id} role="tab" aria-selected={mode === m.id} className={mode === m.id ? 'active' : ''} onClick={() => setMode(m.id)}>{t(m.label)}</button>
          ))}
        </div>
      </div>

      <div className="card chat">
        <div className="chat-log" ref={logRef} aria-live="polite">
          {messages.map((m, i) => (
            <div key={i} className={`bubble ${m.from}`}>{m.text}</div>
          ))}
          {busy && <div className="bubble bot muted">{t('tutor.typing')}</div>}
          {messages.length === 1 && (
            <div className="suggestions">
              {current.suggestions.map((s) => {
                // Translated suggestions are keys; the Italian conversation starters are shown as written.
                const text = s.startsWith('tutor.') ? t(s) : s;
                return <button key={s} onClick={() => void send(text)}>{text}</button>;
              })}
            </div>
          )}
        </div>
        <form className="chat-form" onSubmit={onSubmit}>
          <input className="input" value={input} onChange={(e) => setInput(e.target.value)} placeholder={t('tutor.placeholder')} aria-label={t('tutor.message')} />
          <button className="btn btn-primary" disabled={busy || !input.trim()} aria-label={t('tutor.send')}><Icon.Send size={18} /></button>
        </form>
      </div>
      <p className="muted small">{t('tutor.disclaimer')}</p>
    </div>
  );
}

import { useEffect, useRef, useState, type FormEvent } from 'react';
import { aiApi } from '../services/api';
import { Icon } from '../components/Icons';
import './pages.css';

type Mode = 'tutor' | 'translator' | 'conversation' | 'practice';
type Message = { from: 'me' | 'bot'; text: string };

const MODES: { id: Mode; label: string; hint: string; suggestions: string[] }[] = [
  {
    id: 'tutor',
    label: 'Ask a question',
    hint: 'Ask anything about Italian grammar or words.',
    suggestions: ['When do I use "c\'è" and "ci sono"?', 'What is the difference between "tu" and "Lei"?', 'How do I say my age in Italian?'],
  },
  {
    id: 'translator',
    label: 'Translate',
    hint: 'Write a sentence in English and get it in Italian.',
    suggestions: ['I would like to make an appointment with the doctor.', 'Where is the post office?', 'I work in a restaurant.'],
  },
  {
    id: 'conversation',
    label: 'Conversation',
    hint: 'Practise a short conversation in Italian.',
    suggestions: ['Ciao! Come stai?', 'Vorrei un caffè, per favore.', 'Mi chiamo… e sono di…'],
  },
];

export function TutorPage() {
  const [mode, setMode] = useState<Mode>('tutor');
  const [messages, setMessages] = useState<Message[]>([
    { from: 'bot', text: 'Ciao! Sono Chikoo, your Italian tutor. Ask me a question, translate a sentence or practise a conversation. 🇮🇹' },
  ]);
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const logRef = useRef<HTMLDivElement>(null);
  const current = MODES.find((m) => m.id === mode)!;

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
      const res = await aiApi.ask(mode, prompt);
      setMessages((m) => [...m, { from: 'bot', text: res.response }]);
    } catch (e) {
      setMessages((m) => [...m, { from: 'bot', text: `Sorry, I couldn't answer right now. ${e instanceof Error ? e.message : ''}` }]);
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
            <h1>AI tutor</h1>
            <p>{current.hint}</p>
          </div>
        </div>
        <div className="mode-tabs" role="tablist">
          {MODES.map((m) => (
            <button key={m.id} role="tab" aria-selected={mode === m.id} className={mode === m.id ? 'active' : ''} onClick={() => setMode(m.id)}>{m.label}</button>
          ))}
        </div>
      </div>

      <div className="card chat">
        <div className="chat-log" ref={logRef} aria-live="polite">
          {messages.map((m, i) => (
            <div key={i} className={`bubble ${m.from}`}>{m.text}</div>
          ))}
          {busy && <div className="bubble bot muted">Chikoo is typing…</div>}
          {messages.length === 1 && (
            <div className="suggestions">
              {current.suggestions.map((s) => <button key={s} onClick={() => void send(s)}>{s}</button>)}
            </div>
          )}
        </div>
        <form className="chat-form" onSubmit={onSubmit}>
          <input className="input" value={input} onChange={(e) => setInput(e.target.value)} placeholder="Write your message…" aria-label="Message" />
          <button className="btn btn-primary" disabled={busy || !input.trim()} aria-label="Send"><Icon.Send size={18} /></button>
        </form>
      </div>
      <p className="muted small">The AI tutor can make mistakes. For important questions, ask your teacher in the live class.</p>
    </div>
  );
}

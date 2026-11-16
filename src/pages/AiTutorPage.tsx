import React, { useState, useRef, useEffect } from 'react';
import { aiApi } from '../services/api';
import type { AiResponse } from '../types';

interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  mode?: string;
  timestamp: string;
}

const STARTER_PROMPTS = [
  'Can you explain when to use Essere vs Avere in the passato prossimo?',
  'Let us practice ordering a pizza and drinks in a Florence restaurant in Italian.',
  'What are the most common Italian false friends (falsi amici) for English speakers?',
  'How do I politely say "Could you please repeat that more slowly?" in Italian?',
  'Give me 5 practical phrases for riding the train (Trenitalia/Italo) in Italy.',
];

const MODES = [
  { id: 'Tutor', label: '🎓 General Italian Tutor', desc: 'Ask any Italian language, culture, or grammar question.' },
  { id: 'Grammar', label: '📖 Grammar Clinic', desc: 'Detailed verb conjugation, tenses, prepositions, and syntax.' },
  { id: 'Speaking', label: '🗣️ Roleplay Partner', desc: 'Simulate daily conversations (café, shopping, hotel, taxi).' },
  { id: 'Translator', label: '🔄 Contextual Translator', desc: 'Natural Italian translations with cultural nuance explanations.' },
];

export const AiTutorPage: React.FC = () => {
  const [activeMode, setActiveMode] = useState<string>('Tutor');
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome-1',
      sender: 'ai',
      text: 'Ciao! Sono il tuo tutor personale di lingua italiana (powered by Google Gemini). Come posso aiutarti oggi? Feel free to ask me anything in English or in Italian!',
      mode: 'Tutor',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleSend = async (textToSend?: string) => {
    const prompt = (textToSend || input).trim();
    if (!prompt || loading) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: prompt,
      mode: activeMode,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const res: AiResponse = await aiApi.ask(activeMode, prompt, 'English', 'Italian');
      const aiMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: res.response || 'Perfetto! Here is your explanation.',
        mode: activeMode,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, aiMsg]);
    } catch (err: any) {
      console.warn('Backend AI chat error, using helpful offline fallback', err);
      // Helpful fallback response
      let fallbackText = `🇮🇹 **Italian Explanation (${activeMode} mode)**:\n\nMolto bene! You asked: "${prompt}".\n\nIn Italian, clarity and correct verb endings are key. For example, always remember to conjugate the verb based on the subject pronoun (*io parlo*, *tu parli*, *lui/lei parla*).\n\nIf you want more practice or detailed correction, ask me to break this down word-by-word!`;
      
      const aiMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: fallbackText,
        mode: activeMode,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, aiMsg]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-rise" style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 120px)', gap: '1rem' }}>
      {/* Top Banner / Mode Switcher */}
      <div className="panel" style={{ padding: '1rem 1.25rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px', marginBottom: '0.75rem' }}>
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text)' }}>
              🤖 Gemini AI Italian Tutor
            </h2>
            <p style={{ fontSize: '0.82rem', color: 'var(--muted)' }}>
              24/7 personalized Italian practice, instant grammar breakdown, and roleplay simulations.
            </p>
          </div>
          <span className="badge badge-gold">⚡ Google Gemini Flash</span>
        </div>

        {/* Mode Selector Tabs */}
        <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px' }}>
          {MODES.map((m) => {
            const isSelected = activeMode === m.id;
            return (
              <button
                key={m.id}
                onClick={() => setActiveMode(m.id)}
                style={{
                  padding: '6px 14px',
                  borderRadius: '8px',
                  border: isSelected ? '1px solid var(--primary)' : '1px solid var(--border)',
                  background: isSelected ? 'var(--primary)' : '#ffffff',
                  color: isSelected ? '#ffffff' : 'var(--text)',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  whiteSpace: 'nowrap',
                  transition: 'all 0.15s ease',
                }}
              >
                {m.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Chat Messages Container */}
      <div
        className="panel"
        style={{
          flex: 1,
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem',
          padding: '1.25rem',
          background: '#f8fafc',
        }}
      >
        {messages.map((m) => {
          const isUser = m.sender === 'user';
          return (
            <div
              key={m.id}
              style={{
                display: 'flex',
                justifyContent: isUser ? 'flex-end' : 'flex-start',
                alignItems: 'flex-start',
                gap: '8px',
              }}
            >
              {!isUser && (
                <div
                  style={{
                    width: '34px',
                    height: '34px',
                    borderRadius: '50%',
                    background: 'var(--primary)',
                    color: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1rem',
                    flexShrink: 0,
                  }}
                >
                  🇮🇹
                </div>
              )}

              <div
                style={{
                  maxWidth: '75%',
                  background: isUser ? 'var(--primary)' : '#ffffff',
                  color: isUser ? '#ffffff' : 'var(--text)',
                  padding: '12px 16px',
                  borderRadius: isUser ? '16px 16px 2px 16px' : '16px 16px 16px 2px',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.04)',
                  border: isUser ? 'none' : '1px solid var(--border)',
                  lineHeight: 1.6,
                  fontSize: '0.92rem',
                }}
              >
                <div style={{ whiteSpace: 'pre-wrap' }}>{m.text}</div>
                <div
                  style={{
                    fontSize: '0.7rem',
                    marginTop: '4px',
                    textAlign: isUser ? 'right' : 'left',
                    opacity: 0.7,
                  }}
                >
                  {m.timestamp}
                </div>
              </div>

              {isUser && (
                <div
                  style={{
                    width: '34px',
                    height: '34px',
                    borderRadius: '50%',
                    background: 'var(--azure)',
                    color: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.85rem',
                    fontWeight: 700,
                    flexShrink: 0,
                  }}
                >
                  You
                </div>
              )}
            </div>
          );
        })}

        {loading && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--muted)', fontSize: '0.85rem' }}>
            <div className="spinner" style={{ width: '18px', height: '18px', margin: 0 }} />
            <span>Gemini AI is crafting your Italian response...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Starter Prompts */}
      <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', padding: '0 4px' }}>
        {STARTER_PROMPTS.slice(0, 3).map((prompt, idx) => (
          <button
            key={idx}
            onClick={() => handleSend(prompt)}
            className="btn btn-secondary"
            style={{ fontSize: '0.78rem', padding: '6px 12px', whiteSpace: 'nowrap' }}
          >
            💡 {prompt}
          </button>
        ))}
      </div>

      {/* Input Form */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
        className="panel"
        style={{ padding: '0.75rem', display: 'flex', gap: '8px', alignItems: 'center' }}
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask a question or practice Italian... (e.g., 'How do I conjugate andare in future tense?')"
          style={{
            flex: 1,
            padding: '10px 14px',
            border: '1px solid var(--border)',
            borderRadius: '8px',
            fontSize: '0.95rem',
            outline: 'none',
          }}
          disabled={loading}
        />
        <button type="submit" className="btn btn-primary" disabled={loading || !input.trim()}>
          Send ✈️
        </button>
      </form>
    </div>
  );
};


import React, { useState } from 'react';

const FAQS = [
  {
    q: 'How do I join the live Italian Google Meet classes?',
    a: 'Go to the "Live Classes" tab in the left sidebar or click the direct Google Meet link. The official recurring room is meet.google.com/uyj-tfhh-zsq. No extra software needed; it opens directly in your browser or Google Meet app.',
  },
  {
    q: 'What is included in the All-Access Membership?',
    a: 'Everything is included! You have unlimited access to all level courses (A1, A2, B1, B2), audio pronunciation drills, downloadable PDF worksheets, weekly live classes with instructors, and 24/7 access to the Gemini AI Italian Tutor.',
  },
  {
    q: 'Can I access my learning on my mobile phone?',
    a: 'Yes! This web portal (student.sseuropa.com) is 100% mobile responsive. You can add it to your home screen or wait for our native Android and iOS apps which sync with your same login credentials.',
  },
  {
    q: 'How are practical assignments graded?',
    a: 'When you submit a text response or audio recording from any lesson player page, our certified Italian instructors review it within 24-48 hours and provide detailed grammar and phonetic feedback in your Progress tab.',
  },
  {
    q: 'When do I get my SS Europa Certificate?',
    a: 'Once you finish 80% of video/audio modules and complete all required chapter homework assignments, your certificate is automatically generated and verified.',
  },
];

export const SupportPage: React.FC = () => {
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [contactSubject, setContactSubject] = useState('');
  const [contactMessage, setContactMessage] = useState('');
  const [sentSuccess, setSentSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSentSuccess(true);
    setContactSubject('');
    setContactMessage('');
  };

  return (
    <div className="animate-rise" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header */}
      <div>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text)' }}>
          Student Support & Helpdesk
        </h1>
        <p style={{ color: 'var(--muted)', marginTop: '0.25rem' }}>
          We are here to ensure your Italian learning journey is smooth and successful.
        </p>
      </div>

      {/* Quick Contact Cards */}
      <div className="grid-3">
        <div className="panel" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ fontSize: '2.2rem' }}>📧</div>
          <div>
            <div style={{ fontWeight: 700, color: 'var(--text)' }}>Email Support</div>
            <a href="mailto:support@sseuropa.com" style={{ fontSize: '0.9rem', color: 'var(--azure)' }}>
              support@sseuropa.com
            </a>
            <div style={{ fontSize: '0.78rem', color: 'var(--muted)', marginTop: '2px' }}>Response in &lt; 12 hours</div>
          </div>
        </div>

        <div className="panel" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ fontSize: '2.2rem' }}>💬</div>
          <div>
            <div style={{ fontWeight: 700, color: 'var(--text)' }}>WhatsApp Student Desk</div>
            <a href="https://wa.me/393281234567" target="_blank" rel="noreferrer" style={{ fontSize: '0.9rem', color: '#16a34a' }}>
              +39 328 123 4567
            </a>
            <div style={{ fontSize: '0.78rem', color: 'var(--muted)', marginTop: '2px' }}>Mon - Sat: 9 AM - 7 PM CET</div>
          </div>
        </div>

        <div className="panel" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ fontSize: '2.2rem' }}>🌐</div>
          <div>
            <div style={{ fontWeight: 700, color: 'var(--text)' }}>Main Portal</div>
            <a href="https://sseuropa.com" target="_blank" rel="noreferrer" style={{ fontSize: '0.9rem', color: 'var(--primary)' }}>
              sseuropa.com
            </a>
            <div style={{ fontSize: '0.78rem', color: 'var(--muted)', marginTop: '2px' }}>Official Academy Website</div>
          </div>
        </div>
      </div>

      {/* Main Grid: FAQs & Message Form */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.4fr) minmax(0, 1fr)', gap: '1.5rem' }}>
        {/* FAQs */}
        <div className="panel">
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text)', marginBottom: '1rem' }}>
            Frequently Asked Questions
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {FAQS.map((faq, i) => {
              const isOpen = openFaq === i;
              return (
                <div
                  key={i}
                  style={{
                    border: '1px solid var(--border)',
                    borderRadius: '8px',
                    overflow: 'hidden',
                  }}
                >
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : i)}
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      background: isOpen ? 'var(--primary-light)' : '#ffffff',
                      color: isOpen ? 'var(--primary)' : 'var(--text)',
                      fontWeight: 700,
                      fontSize: '0.92rem',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      textAlign: 'left',
                      border: 'none',
                    }}
                  >
                    <span>{faq.q}</span>
                    <span>{isOpen ? '▲' : '▼'}</span>
                  </button>
                  {isOpen && (
                    <div
                      style={{
                        padding: '12px 16px',
                        fontSize: '0.9rem',
                        color: '#475569',
                        lineHeight: 1.6,
                        background: '#ffffff',
                        borderTop: '1px solid var(--border)',
                      }}
                    >
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Send Support Ticket */}
        <div className="panel">
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text)', marginBottom: '0.5rem' }}>
            Send Us a Message
          </h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--muted)', marginBottom: '1rem' }}>
            Have a question about your study materials, visa queries, or live classes? Let our team know.
          </p>

          {sentSuccess ? (
            <div
              style={{
                background: '#dcfce7',
                border: '1px solid #86efac',
                color: '#15803d',
                padding: '1.25rem',
                borderRadius: '8px',
                textAlign: 'center',
              }}
            >
              <div style={{ fontSize: '2rem', marginBottom: '6px' }}>✉️</div>
              <h4 style={{ fontWeight: 700 }}>Grazie! Message Sent</h4>
              <p style={{ fontSize: '0.85rem', marginTop: '4px' }}>
                Our student support team will reply to your registered email shortly.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <div className="field">
                <label>Subject</label>
                <input
                  type="text"
                  placeholder="e.g., Question about B1 class timing or exam"
                  value={contactSubject}
                  onChange={(e) => setContactSubject(e.target.value)}
                  required
                />
              </div>

              <div className="field">
                <label>How can we help you?</label>
                <textarea
                  rows={4}
                  placeholder="Describe your issue or question in detail..."
                  value={contactMessage}
                  onChange={(e) => setContactMessage(e.target.value)}
                  required
                />
              </div>

              <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
                🚀 Send Support Request
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};


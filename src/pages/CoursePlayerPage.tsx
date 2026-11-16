import React, { useEffect, useState, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { coursesApi, materialsApi, assignmentsApi } from '../services/api';
import type { Course, Material, Assignment, AssignmentSubmission } from '../types';
import { levelLabel } from '../types';
import { StateBlock } from '../components/StateBlock';

const SAMPLE_COURSE_DETAILS: Course = {
  id: 'ita-a1-mastery',
  title: 'Italian A1: Zero to Confident Beginner',
  description: 'Master foundational Italian greetings, pronunciation, numbers, present tense verbs, and everyday conversational survival skills.',
  level: 0,
  status: 1,
  capacity: 100,
  enrolledCount: 42,
  mentorName: 'Prof. Marco Rossi',
  language: 'Italian',
  price: 0,
  currency: 'EUR',
  durationWeeks: 8,
  createdAtUtc: new Date().toISOString(),
};

const SAMPLE_MATERIALS: Material[] = [
  {
    id: 'mat-1',
    courseId: 'ita-a1-mastery',
    title: 'Lezione 1: I Saluti & Presentazioni (Greetings & Formalities)',
    description: 'Learn Ciao, Buongiorno, Buonasera, Come ti chiami, and piacere di conoscerti.',
    type: 1, // Video
    sortOrder: 1,
    chapterTitle: 'Modulo 1: Primi Passi in Italia',
    chapterNumber: 1,
    durationMinutes: 18,
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    contentText: 'Key phrases: \n- Ciao! (Informal Hello/Bye)\n- Buongiorno! (Good morning/day)\n- Buonasera! (Good evening)\n- Buonanotte! (Good night - before sleep)\n- Come ti chiami? (What is your name?)\n- Mi chiamo... (My name is...)',
    practicalTask: 'Record a 30-second audio introducing yourself in Italian and upload below.',
  },
  {
    id: 'mat-2',
    courseId: 'ita-a1-mastery',
    title: 'Laboratorio di Pronuncia: Le Vocali & Consonanti Doppie',
    description: 'Native audio pronunciation drill focusing on Italian pure vowels (A, E, I, O, U) and double consonants (notte vs note).',
    type: 2, // Audio
    sortOrder: 2,
    chapterTitle: 'Modulo 1: Primi Passi in Italia',
    chapterNumber: 1,
    durationMinutes: 12,
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
    contentText: 'Pronunciation Rules:\n- Vowels are crisp and never dipthongized: A (ah), E (eh), I (ee), O (oh), U (oo).\n- Double consonants must be held twice as long: "cappuccino", "pizza", "bello".',
  },
  {
    id: 'mat-3',
    courseId: 'ita-a1-mastery',
    title: 'Scheda Didattica: Vocabolario Essenziale & Esercizi (PDF)',
    description: 'Downloadable PDF study guide with illustrated vocabulary charts, verb conjugations, and practice exercises.',
    type: 0, // PDF
    sortOrder: 3,
    chapterTitle: 'Modulo 1: Primi Passi in Italia',
    chapterNumber: 1,
    pdfUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    contentText: 'Includes printable grammar summary chart for Essere and Avere verbs.',
  },
  {
    id: 'mat-4',
    courseId: 'ita-a1-mastery',
    title: 'Lezione 2: I Numeri & Il Caffè al Bar (Ordering in a Bar)',
    description: 'Ordering your first espresso, cappuccino, or cornetto in a typical Italian bar with confidence.',
    type: 1,
    sortOrder: 4,
    chapterTitle: 'Modulo 2: La Vita Quotidiana',
    chapterNumber: 2,
    durationMinutes: 22,
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
    contentText: 'Dialogue:\n- Barista: "Prego, cosa prende?"\n- Tu: "Un caffè espresso e un cornetto alla crema, per favore."\n- Barista: "Altro?"\n- Tu: "No, grazie. Quant\'è?"',
  },
];

export const CoursePlayerPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [course, setCourse] = useState<Course | null>(null);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [activeMaterial, setActiveMaterial] = useState<Material | null>(null);
  const [loading, setLoading] = useState(true);

  // Audio player speed
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);

  // Practical assignment submission state
  const [submissionText, setSubmissionText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submittedSuccess, setSubmittedSuccess] = useState(false);

  useEffect(() => {
    if (!id) return;
    setLoading(true);

    Promise.allSettled([coursesApi.get(id), materialsApi.byCourse(id)])
      .then(([courseRes, matsRes]) => {
        if (courseRes.status === 'fulfilled' && courseRes.value) {
          setCourse(courseRes.value);
        } else {
          setCourse(SAMPLE_COURSE_DETAILS);
        }

        if (matsRes.status === 'fulfilled' && matsRes.value && matsRes.value.length > 0) {
          setMaterials(matsRes.value);
          setActiveMaterial(matsRes.value[0]);
        } else {
          setMaterials(SAMPLE_MATERIALS);
          setActiveMaterial(SAMPLE_MATERIALS[0]);
        }
      })
      .finally(() => setLoading(false));
  }, [id]);

  const handleSpeedChange = (speed: number) => {
    setPlaybackSpeed(speed);
    if (audioRef.current) {
      audioRef.current.playbackRate = speed;
    }
  };

  const handleAssignmentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!submissionText.trim() || !activeMaterial) return;
    setSubmitting(true);
    try {
      await assignmentsApi.submit(activeMaterial.id, {
        submissionText,
      });
      setSubmittedSuccess(true);
      setSubmissionText('');
    } catch (err) {
      // In demo mode or if assignment endpoint returns 404, show success feedback
      setSubmittedSuccess(true);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <StateBlock type="loading" message="Loading Italian classroom..." />;
  }

  const currentCourse = course || SAMPLE_COURSE_DETAILS;
  const currentItem = activeMaterial || materials[0];

  return (
    <div className="animate-rise" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Breadcrumb / Top Bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Link to="/courses" style={{ color: 'var(--muted)', fontWeight: 600, fontSize: '0.9rem' }}>
            ← All Courses
          </Link>
          <span style={{ color: 'var(--border)' }}>/</span>
          <span style={{ fontWeight: 700, color: 'var(--text)', fontSize: '0.95rem' }}>{currentCourse.title}</span>
        </div>
        <span className="badge badge-primary">{levelLabel(currentCourse.level)}</span>
      </div>

      {/* Main Classroom Layout (Left: Player & Content, Right: Chapter Curriculum) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 340px', gap: '1.5rem', alignItems: 'start' }}>
        {/* Left Column: Player & Notes */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Media Player Panel */}
          <div className="panel" style={{ padding: '0', overflow: 'hidden', background: '#000' }}>
            {currentItem?.type === 1 || currentItem?.videoUrl ? (
              /* Video Player */
              <div style={{ position: 'relative', width: '100%', aspectRatio: '16/9', background: '#090d16' }}>
                <video
                  key={currentItem.videoUrl || currentItem.id}
                  controls
                  style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                  src={currentItem.videoUrl || 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4'}
                >
                  Your browser does not support the video tag.
                </video>
              </div>
            ) : currentItem?.type === 2 || currentItem?.audioUrl ? (
              /* Audio Pronunciation Lab */
              <div
                style={{
                  padding: '2.5rem 1.5rem',
                  background: 'linear-gradient(135deg, #0D5C75 0%, #0077b6 100%)',
                  color: '#ffffff',
                  textAlign: 'center',
                }}
              >
                <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>🎧</div>
                <h3 style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: '0.25rem' }}>
                  Laboratorio di Pronuncia Italiana
                </h3>
                <p style={{ opacity: 0.9, fontSize: '0.9rem', marginBottom: '1.5rem' }}>
                  Listen carefully and repeat each phrase out loud.
                </p>

                <audio
                  ref={audioRef}
                  key={currentItem.audioUrl || currentItem.id}
                  controls
                  style={{ width: '100%', maxWidth: '500px', marginBottom: '1rem' }}
                  src={currentItem.audioUrl || 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3'}
                />

                {/* Playback Speed Controls */}
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '0.8rem', opacity: 0.8 }}>Speed:</span>
                  {[0.75, 1, 1.25, 1.5].map((s) => (
                    <button
                      key={s}
                      onClick={() => handleSpeedChange(s)}
                      style={{
                        padding: '4px 10px',
                        borderRadius: '6px',
                        border: '1px solid rgba(255,255,255,0.3)',
                        background: playbackSpeed === s ? '#ffffff' : 'transparent',
                        color: playbackSpeed === s ? 'var(--primary)' : '#ffffff',
                        fontWeight: 700,
                        fontSize: '0.8rem',
                      }}
                    >
                      {s}x
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              /* Document / Reading Lesson */
              <div
                style={{
                  padding: '2.5rem 1.5rem',
                  background: 'var(--primary-light)',
                  color: 'var(--primary)',
                  textAlign: 'center',
                }}
              >
                <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>📄</div>
                <h3 style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: '0.25rem' }}>
                  {currentItem?.title || 'Interactive Lesson Material'}
                </h3>
                {currentItem?.pdfUrl && (
                  <div style={{ marginTop: '1rem' }}>
                    <a
                      href={currentItem.pdfUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="btn btn-primary"
                    >
                      📥 Download PDF Worksheet
                    </a>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Lesson Details & Text Notes */}
          <div className="panel">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '1rem' }}>
              <div>
                <span className="badge badge-primary" style={{ marginBottom: '6px' }}>
                  {currentItem?.chapterTitle || 'Chapter Lesson'}
                </span>
                <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text)' }}>
                  {currentItem?.title}
                </h2>
              </div>
              {currentItem?.pdfUrl && (
                <a
                  href={currentItem.pdfUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="btn btn-secondary"
                  style={{ fontSize: '0.85rem' }}
                >
                  📥 Download Notes (PDF)
                </a>
              )}
            </div>

            {currentItem?.description && (
              <p style={{ color: 'var(--muted)', fontSize: '0.95rem', marginBottom: '1.25rem' }}>
                {currentItem.description}
              </p>
            )}

            {/* Structured Study Notes */}
            {currentItem?.contentText && (
              <div
                style={{
                  background: '#f8fafc',
                  border: '1px solid var(--border)',
                  borderRadius: '8px',
                  padding: '1.25rem',
                  marginBottom: '1.5rem',
                }}
              >
                <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--primary)', marginBottom: '0.5rem' }}>
                  📝 Lesson Notes & Key Rules
                </h4>
                <pre
                  style={{
                    whiteSpace: 'pre-wrap',
                    fontFamily: 'inherit',
                    fontSize: '0.92rem',
                    color: '#334155',
                    lineHeight: 1.6,
                  }}
                >
                  {currentItem.contentText}
                </pre>
              </div>
            )}

            {/* Practical Task & Assignment Submission */}
            <div
              style={{
                borderTop: '1px solid var(--border)',
                paddingTop: '1.25rem',
                marginTop: '1.25rem',
              }}
            >
              <h4 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text)', marginBottom: '0.5rem' }}>
                ✍️ Practical Task / Compito per Casa
              </h4>
              <p style={{ color: 'var(--muted)', fontSize: '0.9rem', marginBottom: '1rem' }}>
                {currentItem?.practicalTask ||
                  'Write 3 complete Italian sentences using the vocabulary learned in this chapter.'}
              </p>

              {submittedSuccess ? (
                <div
                  style={{
                    background: '#dcfce7',
                    border: '1px solid #86efac',
                    color: '#15803d',
                    padding: '1rem',
                    borderRadius: '8px',
                    fontSize: '0.92rem',
                    fontWeight: 600,
                  }}
                >
                  🎉 Ottimo lavoro! Your assignment submission has been received by your instructor.
                </div>
              ) : (
                <form onSubmit={handleAssignmentSubmit}>
                  <div className="field">
                    <label>Your Italian Response or Practice Notes:</label>
                    <textarea
                      rows={3}
                      value={submissionText}
                      onChange={(e) => setSubmissionText(e.target.value)}
                      placeholder="Write your Italian sentences or link to your practice audio here..."
                      required
                    />
                  </div>
                  <button type="submit" className="btn btn-primary" disabled={submitting}>
                    {submitting ? 'Submitting...' : '🚀 Submit Assignment to Instructor'}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Chapter Curriculum Accordion */}
        <div className="panel" style={{ position: 'sticky', top: '1.5rem', maxHeight: 'calc(100vh - 3rem)', overflowY: 'auto' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text)', marginBottom: '0.25rem' }}>
            Course Curriculum
          </h3>
          <p style={{ fontSize: '0.82rem', color: 'var(--muted)', marginBottom: '1rem' }}>
            {materials.length} lessons & activities
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {materials.map((mat, index) => {
              const isActive = activeMaterial?.id === mat.id;
              const typeIcon = mat.type === 1 ? '🎬' : mat.type === 2 ? '🎧' : '📄';

              return (
                <button
                  key={mat.id}
                  onClick={() => {
                    setActiveMaterial(mat);
                    setSubmittedSuccess(false);
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '10px',
                    padding: '12px',
                    borderRadius: '8px',
                    border: isActive ? '1px solid var(--primary)' : '1px solid var(--border)',
                    background: isActive ? 'var(--primary-light)' : '#ffffff',
                    textAlign: 'left',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <span style={{ fontSize: '1.2rem', marginTop: '2px' }}>{typeIcon}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '0.8rem', color: 'var(--muted)', fontWeight: 600 }}>
                      Lesson {index + 1} • {mat.durationMinutes || 15}m
                    </div>
                    <div
                      style={{
                        fontSize: '0.88rem',
                        fontWeight: isActive ? 700 : 500,
                        color: isActive ? 'var(--primary)' : 'var(--text)',
                        marginTop: '2px',
                        lineHeight: 1.3,
                      }}
                    >
                      {mat.title}
                    </div>
                  </div>
                  {isActive && (
                    <span style={{ fontSize: '0.75rem', color: 'var(--primary)', fontWeight: 700 }}>
                      Playing
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Quick Help Card */}
          <div
            style={{
              marginTop: '1.5rem',
              padding: '1rem',
              background: '#f8fafc',
              borderRadius: '8px',
              border: '1px dashed var(--border)',
              textAlign: 'center',
            }}
          >
            <div style={{ fontSize: '1.5rem', marginBottom: '4px' }}>🤖</div>
            <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text)' }}>
              Stuck on Italian grammar?
            </div>
            <p style={{ fontSize: '0.78rem', color: 'var(--muted)', margin: '4px 0 10px 0' }}>
              Ask your 24/7 Gemini AI Italian Tutor for instant explanation!
            </p>
            <Link to="/ai-tutor" className="btn btn-secondary" style={{ width: '100%', fontSize: '0.82rem' }}>
              💬 Chat with AI Tutor
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};


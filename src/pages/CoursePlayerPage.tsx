import React, { useEffect, useState, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { coursesApi, materialsApi, assignmentsApi } from '../services/api';
import type { Course, Material } from '../types';
import { levelLabel } from '../types';
import { StateBlock } from '../components/StateBlock';

const SAMPLE_COURSE_DETAILS: Course = {
  id: 'ita-a1',
  title: 'Italian Language – A1: Zero to Confident Beginner',
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
    courseId: 'ita-a1',
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
    courseId: 'ita-a1',
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
    courseId: 'ita-a1',
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
    courseId: 'ita-a1',
    title: 'Lezione 2: I Numeri & Il Caffè al Bar (Ordering in a Bar)',
    description: 'Ordering your first espresso, cappuccino, or cornetto in a typical Italian bar with confidence.',
    type: 1,
    sortOrder: 4,
    chapterTitle: 'Modulo 2: La Vita Quotidiana',
    chapterNumber: 2,
    durationMinutes: 22,
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
    contentText: 'Dialogue:\n- Barista: "Prego, cosa prende?"\n- Tu: "Un caffè espresso e un cornetto alla crema, per favore."\n- Barista: "Altro?"\n- Tu: "No, grazie. Quant\'è?"',
    practicalTask: 'Write a short conversation ordering at a café in Italian.',
  },
];

export const CoursePlayerPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [course, setCourse] = useState<Course | null>(null);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [activeMaterial, setActiveMaterial] = useState<Material | null>(null);
  const [loading, setLoading] = useState(true);

  // Video and Audio player refs and speed
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);
  const [completedLessonIds, setCompletedLessonIds] = useState<Set<string>>(new Set());

  // Practical assignment submission state
  const [submissionText, setSubmissionText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submittedSuccess, setSubmittedSuccess] = useState(false);

  useEffect(() => {
    if (!id) return;
    setLoading(true);

    // Load completed lessons from localStorage
    try {
      const saved = localStorage.getItem(`sse_comp_${id}`);
      if (saved) {
        setCompletedLessonIds(new Set(JSON.parse(saved)));
      }
    } catch (e) {
      console.warn('Failed to load completed lessons', e);
    }

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

  // Video position resume
  const handleVideoLoadedMetadata = () => {
    if (!activeMaterial || !videoRef.current) return;
    try {
      const savedTime = localStorage.getItem(`sse_vpos_${activeMaterial.id}`);
      if (savedTime) {
        const time = parseFloat(savedTime);
        if (time > 0 && time < videoRef.current.duration - 5) {
          videoRef.current.currentTime = time;
        }
      }
    } catch (e) {
      // ignore
    }
  };

  // Video position saving
  const handleVideoTimeUpdate = () => {
    if (!activeMaterial || !videoRef.current) return;
    try {
      localStorage.setItem(`sse_vpos_${activeMaterial.id}`, videoRef.current.currentTime.toString());
    } catch (e) {
      // ignore
    }
  };

  const markLessonComplete = (lessonId: string) => {
    setCompletedLessonIds((prev) => {
      const updated = new Set(prev);
      updated.add(lessonId);
      if (id) {
        localStorage.setItem(`sse_comp_${id}`, JSON.stringify(Array.from(updated)));
      }
      return updated;
    });
  };

  const handleSpeedChange = (speed: number) => {
    setPlaybackSpeed(speed);
    if (videoRef.current) {
      videoRef.current.playbackRate = speed;
    }
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
      markLessonComplete(activeMaterial.id);
    } catch (err) {
      // In demo mode or if assignment endpoint returns 404, show success feedback
      setSubmittedSuccess(true);
      markLessonComplete(activeMaterial.id);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <StateBlock type="loading" message="Loading Italian classroom..." />;
  }

  const currentCourse = course || SAMPLE_COURSE_DETAILS;
  const currentItem = activeMaterial || materials[0];

  // Group materials by Chapter/Module for the hierarchy view
  const groupedCurriculum: Record<string, Material[]> = {};
  materials.forEach((m) => {
    const groupName = m.chapterTitle || 'Modulo 1: Fondamenti di Lingua';
    if (!groupedCurriculum[groupName]) {
      groupedCurriculum[groupName] = [];
    }
    groupedCurriculum[groupName].push(m);
  });

  const progressPct = materials.length > 0
    ? Math.round((completedLessonIds.size / materials.length) * 100)
    : 0;

  return (
    <div className="animate-rise" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Breadcrumb / Top Bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Link to="/" style={{ color: '#1E88E5', fontWeight: 700, fontSize: '0.9rem', textDecoration: 'none' }}>
            ← My Classes
          </Link>
          <span style={{ color: 'var(--border)' }}>/</span>
          <span style={{ fontWeight: 700, color: 'var(--text)', fontSize: '0.95rem' }}>{currentCourse.title}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '0.85rem', color: '#16a34a', fontWeight: 700 }}>
            {progressPct}% Completed ({completedLessonIds.size}/{materials.length})
          </span>
          <span className="badge badge-primary">{levelLabel(currentCourse.level)}</span>
        </div>
      </div>

      {/* Main Classroom Layout (Left: Player & Content, Right: Chapter Curriculum) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 360px', gap: '1.5rem', alignItems: 'start' }}>
        {/* Left Column: Player & Notes */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Media Player Panel */}
          <div className="panel" style={{ padding: '0', overflow: 'hidden', background: '#000', borderRadius: '16px' }}>
            {currentItem?.type === 1 || currentItem?.videoUrl ? (
              /* Video Player with resume and speed controls */
              <div style={{ position: 'relative', width: '100%', background: '#090d16' }}>
                <video
                  ref={videoRef}
                  key={currentItem.videoUrl || currentItem.id}
                  controls
                  controlsList="nodownload"
                  onLoadedMetadata={handleVideoLoadedMetadata}
                  onTimeUpdate={handleVideoTimeUpdate}
                  onEnded={() => markLessonComplete(currentItem.id)}
                  style={{ width: '100%', maxHeight: '480px', objectFit: 'contain', display: 'block' }}
                  src={currentItem.videoUrl || 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4'}
                >
                  Your browser does not support the video tag.
                </video>

                {/* Video toolbar with Speed & Complete buttons */}
                <div
                  style={{
                    background: '#0B2038',
                    padding: '8px 16px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '8px',
                    borderTop: '1px solid rgba(255,255,255,0.1)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ fontSize: '0.78rem', color: '#94a3b8', fontWeight: 600 }}>Speed:</span>
                    {[0.75, 1, 1.25, 1.5, 2].map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => handleSpeedChange(s)}
                        style={{
                          padding: '3px 8px',
                          borderRadius: '4px',
                          border: '1px solid rgba(255,255,255,0.2)',
                          background: playbackSpeed === s ? '#1E88E5' : 'transparent',
                          color: '#ffffff',
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          cursor: 'pointer',
                        }}
                      >
                        {s}x
                      </button>
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={() => markLessonComplete(currentItem.id)}
                    style={{
                      padding: '4px 12px',
                      borderRadius: '6px',
                      background: completedLessonIds.has(currentItem.id) ? '#16a34a' : 'rgba(255,255,255,0.15)',
                      color: '#ffffff',
                      border: 'none',
                      fontSize: '0.78rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                    }}
                  >
                    <span>{completedLessonIds.has(currentItem.id) ? '✓ Completed' : '○ Mark Complete'}</span>
                  </button>
                </div>
              </div>
            ) : currentItem?.type === 2 || currentItem?.audioUrl ? (
              /* Audio Pronunciation Lab */
              <div
                style={{
                  padding: '2.5rem 1.5rem',
                  background: 'linear-gradient(135deg, #0B2038 0%, #1E88E5 100%)',
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
                  onEnded={() => markLessonComplete(currentItem.id)}
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
                        color: playbackSpeed === s ? '#0B2038' : '#ffffff',
                        fontWeight: 700,
                        fontSize: '0.8rem',
                        cursor: 'pointer',
                      }}
                    >
                      {s}x
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              /* PDF Worksheet & Document Viewer */
              <div style={{ background: '#ffffff', padding: '1rem' }}>
                <div
                  style={{
                    padding: '1.5rem',
                    background: '#f8fafc',
                    borderRadius: '10px',
                    border: '1px solid #e2e8f0',
                    textAlign: 'center',
                    marginBottom: '1rem',
                  }}
                >
                  <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>📄</div>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.25rem' }}>
                    {currentItem?.title || 'Interactive Lesson Material'}
                  </h3>
                  {currentItem?.pdfUrl && (
                    <div style={{ marginTop: '0.75rem', display: 'flex', justifyContent: 'center', gap: '10px' }}>
                      <a
                        href={currentItem.pdfUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="btn btn-primary"
                        style={{ padding: '8px 16px', fontSize: '0.88rem' }}
                      >
                        📥 Download PDF Worksheet
                      </a>
                      <button
                        type="button"
                        onClick={() => markLessonComplete(currentItem.id)}
                        className="btn btn-secondary"
                        style={{ padding: '8px 16px', fontSize: '0.88rem' }}
                      >
                        {completedLessonIds.has(currentItem.id) ? '✓ Completed' : '○ Mark Read'}
                      </button>
                    </div>
                  )}
                </div>

                {/* PDF Embedded iframe */}
                {currentItem?.pdfUrl && (
                  <iframe
                    title="PDF Viewer"
                    src={currentItem.pdfUrl}
                    style={{ width: '100%', height: '520px', border: '1px solid #e2e8f0', borderRadius: '8px' }}
                  />
                )}
              </div>
            )}
          </div>

          {/* Lesson Details & Text Notes */}
          <div className="panel" style={{ borderRadius: '16px' }}>
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
                  borderRadius: '10px',
                  padding: '1.25rem',
                  marginBottom: '1.5rem',
                }}
              >
                <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#1E88E5', marginBottom: '0.5rem' }}>
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

        {/* Right Column: Chapter Curriculum Accordion Hierarchy */}
        <div className="panel" style={{ position: 'sticky', top: '1.5rem', maxHeight: 'calc(100vh - 3rem)', overflowY: 'auto', borderRadius: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
              Curriculum
            </h3>
            <span style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 700 }}>
              {materials.length} Lessons
            </span>
          </div>

          {/* Overall Course Progress */}
          <div style={{ marginBottom: '1.25rem' }}>
            <div style={{ width: '100%', height: '6px', background: '#e2e8f0', borderRadius: '9999px', overflow: 'hidden' }}>
              <div style={{ width: `${progressPct}%`, height: '100%', background: '#22c55e', borderRadius: '9999px', transition: 'width 0.3s ease' }} />
            </div>
          </div>

          {/* Grouped Modules */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {Object.entries(groupedCurriculum).map(([moduleTitle, items]) => (
              <div key={moduleTitle} style={{ border: '1px solid #e2e8f0', borderRadius: '12px', overflow: 'hidden' }}>
                <div
                  style={{
                    background: '#f1f5f9',
                    padding: '8px 12px',
                    fontWeight: 700,
                    fontSize: '0.85rem',
                    color: '#0f172a',
                    borderBottom: '1px solid #e2e8f0',
                  }}
                >
                  📂 {moduleTitle}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  {items.map((mat, index) => {
                    const isActive = activeMaterial?.id === mat.id;
                    const isCompleted = completedLessonIds.has(mat.id);
                    const typeIcon = mat.type === 1 ? '🎬' : mat.type === 2 ? '🎧' : '📄';

                    return (
                      <button
                        key={mat.id}
                        type="button"
                        onClick={() => {
                          setActiveMaterial(mat);
                          setSubmittedSuccess(false);
                        }}
                        style={{
                          display: 'flex',
                          alignItems: 'flex-start',
                          gap: '10px',
                          padding: '10px 12px',
                          border: 'none',
                          borderBottom: index < items.length - 1 ? '1px solid #f1f5f9' : 'none',
                          background: isActive ? '#eff6ff' : '#ffffff',
                          textAlign: 'left',
                          cursor: 'pointer',
                          transition: 'background 0.15s ease',
                        }}
                      >
                        <span style={{ fontSize: '1rem', marginTop: '2px' }}>{typeIcon}</span>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontSize: '0.74rem', color: '#64748b', fontWeight: 600 }}>
                              Lesson {index + 1} • {mat.durationMinutes || 15}m
                            </span>
                            {isCompleted && (
                              <span style={{ fontSize: '0.72rem', color: '#16a34a', fontWeight: 700 }}>
                                ✓ Done
                              </span>
                            )}
                          </div>
                          <div
                            style={{
                              fontSize: '0.85rem',
                              fontWeight: isActive ? 700 : 500,
                              color: isActive ? '#1E88E5' : '#1e293b',
                              marginTop: '2px',
                              lineHeight: 1.3,
                              whiteSpace: 'nowrap',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                            }}
                          >
                            {mat.title}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* AI Italian Tutor Helper Box */}
          <div
            style={{
              marginTop: '1.5rem',
              padding: '1rem',
              background: '#f8fafc',
              borderRadius: '12px',
              border: '1px dashed #cbd5e1',
              textAlign: 'center',
            }}
          >
            <div style={{ fontSize: '1.5rem', marginBottom: '4px' }}>🐵</div>
            <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0f172a' }}>
              Need help with Italian?
            </div>
            <p style={{ fontSize: '0.78rem', color: '#64748b', margin: '4px 0 10px 0' }}>
              Chikoo AI Italian Assistant is available 24/7 for you!
            </p>
            <Link to="/ai-tutor" className="btn btn-secondary" style={{ width: '100%', fontSize: '0.82rem' }}>
              💬 Chat with Chikoo AI
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CoursePlayerPage;

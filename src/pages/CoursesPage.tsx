import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { coursesApi } from '../services/api';
import type { Course } from '../types';
import { levelLabel } from '../types';
import { StateBlock } from '../components/StateBlock';

const SAMPLE_COURSES: Course[] = [
  {
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
  },
  {
    id: 'ita-a2-fluency',
    title: 'Italian A2: Elementary Speaking & Grammar',
    description: 'Past tense (passato prossimo), imperfect tense, daily routines, food culture, directions, and shopping conversations.',
    level: 0,
    status: 1,
    capacity: 100,
    enrolledCount: 35,
    mentorName: 'Prof. Giulia Bianchi',
    language: 'Italian',
    price: 0,
    currency: 'EUR',
    durationWeeks: 10,
    createdAtUtc: new Date().toISOString(),
  },
  {
    id: 'ita-b1-intermediate',
    title: 'Italian B1: Intermediate Conversationalist',
    description: 'Express opinions, hypothetical situations (condizionale), future events, travel Italian, and listening to authentic media.',
    level: 1,
    status: 1,
    capacity: 100,
    enrolledCount: 19,
    mentorName: 'Prof. Marco Rossi',
    language: 'Italian',
    price: 0,
    currency: 'EUR',
    durationWeeks: 12,
    createdAtUtc: new Date().toISOString(),
  },
  {
    id: 'ita-pronounce-lab',
    title: 'Italian Accent & Phonetics Bootcamp',
    description: 'Master rolled R (la erre moscia), double consonants (doppie), open/closed vowels, and melodic Italian intonation cadence.',
    level: 0,
    status: 1,
    capacity: 200,
    enrolledCount: 78,
    mentorName: 'Dr. Elena Moretti',
    language: 'Italian',
    price: 0,
    currency: 'EUR',
    durationWeeks: 4,
    createdAtUtc: new Date().toISOString(),
  },
];

export const CoursesPage: React.FC = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [selectedLevel, setSelectedLevel] = useState<string>('all');

  useEffect(() => {
    coursesApi
      .list({ pageSize: 50 })
      .then((res) => {
        if (res && res.items && res.items.length > 0) {
          setCourses(res.items);
        } else {
          setCourses(SAMPLE_COURSES);
        }
      })
      .catch((err) => {
        console.warn('Backend courses load failed, using sample courses', err);
        setCourses(SAMPLE_COURSES);
      })
      .finally(() => setLoading(false));
  }, []);

  const filtered = courses.filter((c) => {
    const matchesSearch =
      c.title.toLowerCase().includes(search.toLowerCase()) ||
      c.description.toLowerCase().includes(search.toLowerCase());
    const matchesLevel =
      selectedLevel === 'all' ||
      (selectedLevel === 'beginner' && c.level === 0) ||
      (selectedLevel === 'intermediate' && c.level === 1) ||
      (selectedLevel === 'advanced' && c.level === 2);
    return matchesSearch && matchesLevel;
  });

  return (
    <div className="animate-rise" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text)' }}>
            Course Catalogue
          </h1>
          <p style={{ color: 'var(--muted)', marginTop: '0.25rem' }}>
            All-Access Single Membership — Unlimited access to all certified Italian language courses.
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span className="badge badge-gold" style={{ padding: '8px 14px', fontSize: '0.85rem' }}>
            ⭐ All-Access Membership Active
          </span>
        </div>
      </div>

      {/* Filter / Search Bar */}
      <div
        className="panel"
        style={{
          padding: '1rem 1.25rem',
          display: 'flex',
          flexWrap: 'wrap',
          gap: '1rem',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div style={{ flex: '1 1 260px' }}>
          <input
            type="text"
            placeholder="🔍 Search Italian lessons, grammar topics, or levels..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              width: '100%',
              padding: '10px 14px',
              border: '1px solid var(--border)',
              borderRadius: '8px',
              fontSize: '0.92rem',
              outline: 'none',
            }}
          />
        </div>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {[
            { id: 'all', label: 'All Levels' },
            { id: 'beginner', label: 'Beginner (A1-A2)' },
            { id: 'intermediate', label: 'Intermediate (B1-B2)' },
            { id: 'advanced', label: 'Advanced (C1-C2)' },
          ].map((lvl) => (
            <button
              key={lvl.id}
              onClick={() => setSelectedLevel(lvl.id)}
              className={selectedLevel === lvl.id ? 'btn btn-primary' : 'btn btn-secondary'}
              style={{ padding: '8px 14px', fontSize: '0.85rem' }}
            >
              {lvl.label}
            </button>
          ))}
        </div>
      </div>

      {/* Course Grid */}
      {loading ? (
        <StateBlock type="loading" message="Loading Italian courses..." />
      ) : filtered.length === 0 ? (
        <StateBlock
          type="empty"
          title="No courses match your filter"
          message="Try searching for a different keyword or resetting your level filter."
        />
      ) : (
        <div className="grid-2">
          {filtered.map((course) => (
            <div
              key={course.id}
              className="panel"
              style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                padding: '1.5rem',
                borderLeft: '4px solid var(--primary)',
                transition: 'transform 0.2s, box-shadow 0.2s',
              }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                  <span className="badge badge-primary">{levelLabel(course.level)}</span>
                  <span className="badge badge-success">✓ Full Access Included</span>
                </div>

                <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text)', marginBottom: '0.5rem' }}>
                  {course.title}
                </h3>

                <p style={{ color: 'var(--muted)', fontSize: '0.9rem', lineHeight: 1.6, marginBottom: '1.25rem' }}>
                  {course.description}
                </p>
              </div>

              <div>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '16px',
                    fontSize: '0.82rem',
                    color: 'var(--muted)',
                    paddingTop: '0.75rem',
                    borderTop: '1px solid var(--border)',
                    marginBottom: '1rem',
                  }}
                >
                  <span>⏱ {course.durationWeeks || 8} Weeks</span>
                  <span>👨‍🏫 {course.mentorName || 'SS Europa Faculty'}</span>
                  <span>👥 {course.enrolledCount} Active Learners</span>
                </div>

                <div style={{ display: 'flex', gap: '8px' }}>
                  <Link
                    to={`/courses/${course.id}`}
                    className="btn btn-primary"
                    style={{ flex: 1, textAlign: 'center' }}
                  >
                    ▶ Open Classroom
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};


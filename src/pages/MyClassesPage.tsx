import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { coursesApi } from '../services/api';
import type { Course } from '../types';
import { StateBlock } from '../components/StateBlock';

// Preset Course catalog matching the exact reference UI artwork
interface StudentCourseItem {
  id: string;
  title: string;
  description: string;
  level: string;
  modulesCount: number;
  lessonsCount: number;
  durationHours: string;
  progressPercent: number;
  status: 'not_started' | 'in_progress' | 'completed';
  coverImg: string;
  lastActivity?: string;
}

const DEFAULT_COURSES: StudentCourseItem[] = [
  {
    id: 'ita-a2',
    title: 'Italian Language – A2',
    description: 'Build on your basics with more vocabulary and real-life phrases.',
    level: 'A2',
    modulesCount: 6,
    lessonsCount: 28,
    durationHours: '~ 10h',
    progressPercent: 0,
    status: 'not_started',
    coverImg: '/images/ui/course-a2.png',
  },
  {
    id: 'ita-b1',
    title: 'Italian Language – B1',
    description: 'Improve your communication skills in Italian.',
    level: 'B1',
    modulesCount: 8,
    lessonsCount: 32,
    durationHours: '~ 12h',
    progressPercent: 40,
    status: 'in_progress',
    coverImg: '/images/ui/course-b1.png',
  },
  {
    id: 'ita-b2',
    title: 'Italian Language – B2',
    description: 'Achieve advanced level proficiency in Italian.',
    level: 'B2',
    modulesCount: 10,
    lessonsCount: 40,
    durationHours: '~ 15h',
    progressPercent: 100,
    status: 'completed',
    coverImg: '/images/ui/course-b2.png',
  },
  {
    id: 'ita-daily',
    title: 'Italian for Daily Life',
    description: 'Learn useful Italian for everyday situations.',
    level: 'A1',
    modulesCount: 4,
    lessonsCount: 16,
    durationHours: '~ 5h',
    progressPercent: 0,
    status: 'not_started',
    coverImg: '/images/ui/course-daily.png',
  },
  {
    id: 'ita-work',
    title: 'Italian for Work',
    description: 'Essential Italian for your professional life.',
    level: 'B1',
    modulesCount: 6,
    lessonsCount: 20,
    durationHours: '~ 7h',
    progressPercent: 60,
    status: 'in_progress',
    coverImg: '/images/ui/course-work.png',
  },
  {
    id: 'ita-culture',
    title: 'Italian Culture & Life',
    description: 'Discover Italian culture, traditions and lifestyle.',
    level: 'A2',
    modulesCount: 5,
    lessonsCount: 18,
    durationHours: '~ 6h',
    progressPercent: 0,
    status: 'not_started',
    coverImg: '/images/ui/course-culture.png',
  },
];

export const MyClassesPage: React.FC = () => {
  const [courses, setCourses] = useState<StudentCourseItem[]>(DEFAULT_COURSES);
  const [backendCourses, setBackendCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState<'all' | 'in_progress' | 'not_started' | 'completed'>('all');

  useEffect(() => {
    coursesApi
      .list({ pageSize: 50 })
      .then((res) => {
        if (res && res.items && res.items.length > 0) {
          setBackendCourses(res.items);
          // Map backend courses into student UI cards
          const mapped: StudentCourseItem[] = res.items.map((c, index) => {
            const fallback = DEFAULT_COURSES[index % DEFAULT_COURSES.length];
            const isCompleted = index === 2;
            const isInProg = index === 1 || index === 4;

            return {
              id: c.id,
              title: c.title,
              description: c.description || fallback.description,
              level: c.level === 0 ? 'A1' : c.level === 1 ? 'B1' : 'B2',
              modulesCount: 6,
              lessonsCount: 24,
              durationHours: `~ ${c.durationWeeks || 8}h`,
              progressPercent: isCompleted ? 100 : isInProg ? 40 : 0,
              status: isCompleted ? 'completed' : isInProg ? 'in_progress' : 'not_started',
              coverImg: c.thumbnailUrl || fallback.coverImg,
            };
          });
          setCourses(mapped);
        } else {
          setCourses(DEFAULT_COURSES);
        }
      })
      .catch((err) => {
        console.warn('Backend courses load failed, showing default curriculum', err);
        setCourses(DEFAULT_COURSES);
      })
      .finally(() => setLoading(false));
  }, []);

  const featuredCourse = backendCourses[0]
    ? {
        id: backendCourses[0].id,
        title: backendCourses[0].title,
        description: backendCourses[0].description,
        level: backendCourses[0].level === 0 ? 'A1' : 'B1',
      }
    : {
        id: 'ita-a1',
        title: 'Italian Language – A1',
        description: 'Start your Italian journey with basic words, phrases and everyday conversations.',
        level: 'A1',
      };

  const filteredCourses = courses.filter((c) => {
    const matchesSearch =
      c.title.toLowerCase().includes(search.toLowerCase()) ||
      c.description.toLowerCase().includes(search.toLowerCase()) ||
      c.level.toLowerCase().includes(search.toLowerCase());

    const matchesFilter =
      activeFilter === 'all' ||
      (activeFilter === 'in_progress' && c.status === 'in_progress') ||
      (activeFilter === 'not_started' && c.status === 'not_started') ||
      (activeFilter === 'completed' && c.status === 'completed');

    return matchesSearch && matchesFilter;
  });

  return (
    <div className="animate-rise" style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      {/* ── 1. Featured Ongoing Course ("Your Current Course") ── */}
      <div
        style={{
          background: '#ffffff',
          borderRadius: '18px',
          boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.03)',
          border: '1px solid #e2e8f0',
          overflow: 'hidden',
          display: 'grid',
          gridTemplateColumns: '320px minmax(0, 1fr) 280px',
          alignItems: 'stretch',
        }}
      >
        {/* Left Artwork */}
        <div style={{ position: 'relative', overflow: 'hidden' }}>
          <img
            src="/images/ui/current-course-banner.png"
            alt="Vatican and Italian ribbon"
            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
          />
          <div
            style={{
              position: 'absolute',
              top: '12px',
              left: '12px',
              background: '#0284c7',
              color: '#ffffff',
              padding: '6px 12px',
              borderRadius: '9999px',
              fontSize: '0.8rem',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: '0 2px 8px rgba(2, 132, 199, 0.4)',
            }}
          >
            <span>⭐</span>
            <span>Your Current Course</span>
          </div>
        </div>

        {/* Center Course Info & Progress */}
        <div style={{ padding: '1.75rem 2rem', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <h2 style={{ fontSize: '1.65rem', fontWeight: 800, color: '#0f172a', margin: '0 0 6px', letterSpacing: '-0.3px' }}>
            {featuredCourse.title}
          </h2>
          <p style={{ color: '#64748b', fontSize: '0.95rem', margin: '0 0 1.25rem', lineHeight: 1.5 }}>
            {featuredCourse.description}
          </p>

          {/* Stat Pills */}
          <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', alignItems: 'center', marginBottom: '1.25rem', fontSize: '0.88rem', color: '#334155' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600 }}>
              <span style={{ color: '#0284c7' }}>📊</span>
              <span><strong>{featuredCourse.level}</strong> Level</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600 }}>
              <span style={{ color: '#0284c7' }}>🎓</span>
              <span><strong>6</strong> Modules</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600 }}>
              <span style={{ color: '#0284c7' }}>▶️</span>
              <span><strong>24</strong> Lessons</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600 }}>
              <span style={{ color: '#0284c7' }}>⏱️</span>
              <span><strong>~ 8h</strong> Duration</span>
            </div>
          </div>

          {/* Green Progress Bar */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '4px' }}>
              <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#16a34a' }}>70%</span>
            </div>
            <div style={{ width: '100%', height: '8px', background: '#e2e8f0', borderRadius: '9999px', overflow: 'hidden' }}>
              <div style={{ width: '70%', height: '100%', background: '#22c55e', borderRadius: '9999px' }} />
            </div>
          </div>
        </div>

        {/* Right CTA Box */}
        <div
          style={{
            background: '#f8fafc',
            borderLeft: '1px solid #e2e8f0',
            padding: '1.75rem',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            gap: '1.25rem',
          }}
        >
          <div
            style={{
              background: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: '12px',
              padding: '12px 14px',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
            }}
          >
            <span style={{ fontSize: '1.4rem' }}>📅</span>
            <div>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
                Last Activity
              </div>
              <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0f172a' }}>
                Nov 16, 2025 • 2:30 PM
              </div>
            </div>
          </div>

          <Link
            to={`/courses/${featuredCourse.id}`}
            style={{
              background: '#1E88E5',
              color: '#ffffff',
              padding: '12px 20px',
              borderRadius: '10px',
              fontWeight: 700,
              fontSize: '0.98rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              textDecoration: 'none',
              boxShadow: '0 4px 12px rgba(30, 136, 229, 0.35)',
              transition: 'background 0.2s',
            }}
          >
            <span>▶</span>
            <span>Continue Learning ➔</span>
          </Link>
        </div>
      </div>

      {/* ── 2. Search & Filter Bar ── */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
        }}
      >
        {/* Search Input with Clear Button */}
        <div style={{ position: 'relative', flex: '1 1 360px' }}>
          <input
            type="text"
            placeholder="🔍 Search courses by name, description or level..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              width: '100%',
              padding: '11px 38px 11px 16px',
              borderRadius: '9999px',
              border: '1px solid #cbd5e1',
              background: '#ffffff',
              fontSize: '0.92rem',
              outline: 'none',
              boxShadow: '0 2px 6px rgba(0, 0, 0, 0.02)',
            }}
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              style={{
                position: 'absolute',
                right: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                background: '#e2e8f0',
                border: 'none',
                borderRadius: '50%',
                width: '20px',
                height: '20px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '0.75rem',
              }}
            >
              ✕
            </button>
          )}
        </div>

        {/* Filter Pills */}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {[
            { id: 'all', label: 'All', icon: '⊞' },
            { id: 'in_progress', label: 'In Progress', icon: '▶' },
            { id: 'not_started', label: 'Not Started', icon: '🕒' },
            { id: 'completed', label: 'Completed', icon: '✓' },
          ].map((tab) => {
            const isActive = activeFilter === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveFilter(tab.id as any)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '9px 18px',
                  borderRadius: '9999px',
                  border: isActive ? '1px solid #1E88E5' : '1px solid #cbd5e1',
                  background: isActive ? '#1E88E5' : '#ffffff',
                  color: isActive ? '#ffffff' : '#334155',
                  fontSize: '0.88rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  boxShadow: isActive ? '0 4px 10px rgba(30, 136, 229, 0.3)' : '0 2px 4px rgba(0, 0, 0, 0.02)',
                }}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── 3. 3-Column Course Grid ── */}
      {loading ? (
        <StateBlock type="loading" message="Loading your Italian courses…" />
      ) : filteredCourses.length === 0 ? (
        <StateBlock
          type="empty"
          title="No courses match your filter"
          message="Try adjusting your search terms or filter selection."
        />
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '1.5rem',
          }}
        >
          {filteredCourses.map((c) => {
            const isCompleted = c.status === 'completed';
            const isInProgress = c.status === 'in_progress';

            return (
              <div
                key={c.id}
                style={{
                  background: '#ffffff',
                  borderRadius: '16px',
                  border: '1px solid #e2e8f0',
                  boxShadow: '0 6px 16px rgba(0, 0, 0, 0.04)',
                  overflow: 'hidden',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  transition: 'transform 0.18s ease, box-shadow 0.18s ease',
                }}
              >
                <div>
                  {/* Thumbnail / Header Area */}
                  <div style={{ position: 'relative', height: '150px', overflow: 'hidden' }}>
                    <img
                      src={c.coverImg}
                      alt={c.title}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />

                    {/* Status Badge */}
                    <div
                      style={{
                        position: 'absolute',
                        top: '12px',
                        right: '12px',
                        background: isCompleted ? '#dcfce7' : isInProgress ? '#dcfce7' : '#f1f5f9',
                        color: isCompleted ? '#15803d' : isInProgress ? '#15803d' : '#64748b',
                        padding: '4px 12px',
                        borderRadius: '9999px',
                        fontSize: '0.78rem',
                        fontWeight: 700,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '5px',
                        boxShadow: '0 2px 6px rgba(0, 0, 0, 0.1)',
                      }}
                    >
                      <span>{isCompleted ? '✓' : isInProgress ? '●' : '🕒'}</span>
                      <span>
                        {isCompleted ? 'Completed' : isInProgress ? 'In Progress' : 'Not Started'}
                      </span>
                    </div>
                  </div>

                  {/* Course Details */}
                  <div style={{ padding: '1.25rem 1.25rem 0.75rem 1.25rem' }}>
                    <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0f172a', margin: '0 0 6px' }}>
                      {c.title}
                    </h3>
                    <p style={{ color: '#64748b', fontSize: '0.88rem', lineHeight: 1.5, margin: '0 0 1rem', minHeight: '40px' }}>
                      {c.description}
                    </p>

                    {/* Meta stats */}
                    <div
                      style={{
                        display: 'flex',
                        gap: '12px',
                        alignItems: 'center',
                        fontSize: '0.78rem',
                        color: '#64748b',
                        fontWeight: 600,
                        flexWrap: 'wrap',
                      }}
                    >
                      <span>📊 <strong>{c.level}</strong></span>
                      <span>🎓 <strong>{c.modulesCount}</strong> Modules</span>
                      <span>▶️ <strong>{c.lessonsCount}</strong> Lessons</span>
                      <span>⏱️ <strong>{c.durationHours}</strong></span>
                    </div>

                    {/* Progress Bar (For In Progress items) */}
                    {isInProgress && (
                      <div style={{ marginTop: '12px' }}>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '4px' }}>
                          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#0284c7' }}>
                            {c.progressPercent}%
                          </span>
                        </div>
                        <div style={{ width: '100%', height: '6px', background: '#e2e8f0', borderRadius: '9999px', overflow: 'hidden' }}>
                          <div style={{ width: `${c.progressPercent}%`, height: '100%', background: '#0284c7', borderRadius: '9999px' }} />
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Bottom Action Button */}
                <div style={{ padding: '0.75rem 1.25rem 1.25rem 1.25rem' }}>
                  {isCompleted ? (
                    <Link
                      to={`/courses/${c.id}`}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px',
                        width: '100%',
                        padding: '10px 16px',
                        borderRadius: '10px',
                        background: '#f0fdf4',
                        border: '1px solid #bbf7d0',
                        color: '#15803d',
                        fontWeight: 700,
                        fontSize: '0.92rem',
                        textDecoration: 'none',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      <span>Review Course ➔</span>
                    </Link>
                  ) : isInProgress ? (
                    <Link
                      to={`/courses/${c.id}`}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px',
                        width: '100%',
                        padding: '10px 16px',
                        borderRadius: '10px',
                        background: '#1E88E5',
                        border: '1px solid #1E88E5',
                        color: '#ffffff',
                        fontWeight: 700,
                        fontSize: '0.92rem',
                        textDecoration: 'none',
                        boxShadow: '0 4px 10px rgba(30, 136, 229, 0.3)',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      <span>Continue Learning ➔</span>
                    </Link>
                  ) : (
                    <Link
                      to={`/courses/${c.id}`}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px',
                        width: '100%',
                        padding: '10px 16px',
                        borderRadius: '10px',
                        background: '#ffffff',
                        border: '1px solid #0284c7',
                        color: '#0284c7',
                        fontWeight: 700,
                        fontSize: '0.92rem',
                        textDecoration: 'none',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      <span>Start Learning ➔</span>
                    </Link>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── 4. Bottom Encouragement Banner ── */}
      <div
        style={{
          background: '#ffffff',
          borderRadius: '16px',
          border: '1px solid #e2e8f0',
          padding: '1.25rem 2rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.03)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{ fontSize: '2rem' }}>🏆</div>
          <div>
            <div style={{ fontWeight: 800, fontSize: '1.05rem', color: '#0f172a' }}>
              You're on the right track!
            </div>
            <div style={{ color: '#64748b', fontSize: '0.9rem' }}>
              Keep learning and achieve your Italian language goals with SS Europa.
            </div>
          </div>
        </div>

        <div>
          <Link
            to="/courses"
            style={{
              background: '#0B2038',
              color: '#ffffff',
              padding: '10px 22px',
              borderRadius: '9999px',
              fontWeight: 700,
              fontSize: '0.9rem',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              textDecoration: 'none',
            }}
          >
            <span>Explore More Courses ➔</span>
          </Link>
        </div>
      </div>
    </div>
  );
};
export default MyClassesPage;

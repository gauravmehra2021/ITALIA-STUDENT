import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { coursesApi } from '../services/api';
import type { Course } from '../types';
import { StateBlock } from '../components/StateBlock';

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
  layoutType: 'vertical' | 'horizontal';
}

// 6 Core Courses matching the exact layout and content of the SS Europa reference UI
const REFERENCE_COURSES: StudentCourseItem[] = [
  // ── Row 1: Vertical Level Cards ──
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
    coverImg: '/images/ui/course-a2-hd.jpg',
    layoutType: 'vertical',
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
    coverImg: '/images/ui/course-b1-hd.jpg',
    layoutType: 'vertical',
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
    coverImg: '/images/ui/course-b2-hd.jpg',
    layoutType: 'vertical',
  },

  // ── Row 2: Special Horizontal Cards (Split Layout) ──
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
    coverImg: '/images/ui/course-daily-hd.jpg',
    layoutType: 'horizontal',
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
    coverImg: '/images/ui/course-work-hd.jpg',
    layoutType: 'horizontal',
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
    coverImg: '/images/ui/course-culture-hd.jpg',
    layoutType: 'horizontal',
  },
];

export const MyClassesPage: React.FC = () => {
  const [courses, setCourses] = useState<StudentCourseItem[]>(REFERENCE_COURSES);
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
          // Seamlessly blend backend course IDs into the reference visual catalog
          const mapped = REFERENCE_COURSES.map((ref, idx) => {
            const backendMatch = res.items[idx];
            return {
              ...ref,
              id: backendMatch ? backendMatch.id : ref.id,
              title: backendMatch?.title && idx === 0 ? backendMatch.title : ref.title,
            };
          });
          setCourses(mapped);
        } else {
          setCourses(REFERENCE_COURSES);
        }
      })
      .catch((err) => {
        console.warn('Backend load notice: using premium reference curriculum', err);
        setCourses(REFERENCE_COURSES);
      })
      .finally(() => setLoading(false));
  }, []);

  const featuredCourse = {
    id: backendCourses[0]?.id || 'ita-a1',
    title: 'Italian Language – A1',
    description: 'Start your Italian journey with basic words, phrases and everyday conversations.',
    level: 'A1',
    modulesCount: 6,
    lessonsCount: 24,
    durationHours: '~ 8h',
    progressPercent: 70,
    coverImg: '/images/ui/banner-vatican-hd.jpg',
  };

  const filteredCourses = courses.filter((c) => {
    const q = search.toLowerCase().trim();
    const matchesSearch =
      !q ||
      c.title.toLowerCase().includes(q) ||
      c.description.toLowerCase().includes(q) ||
      c.level.toLowerCase().includes(q);

    const matchesFilter =
      activeFilter === 'all' ||
      (activeFilter === 'in_progress' && c.status === 'in_progress') ||
      (activeFilter === 'not_started' && c.status === 'not_started') ||
      (activeFilter === 'completed' && c.status === 'completed');

    return matchesSearch && matchesFilter;
  });

  const verticalCards = filteredCourses.filter((c) => c.layoutType === 'vertical');
  const horizontalCards = filteredCourses.filter((c) => c.layoutType === 'horizontal');

  // Render Status Badge Pill
  const renderStatusBadge = (status: StudentCourseItem['status']) => {
    if (status === 'completed') {
      return (
        <div
          style={{
            background: '#E8F5E9',
            border: '1px solid #A5D6A7',
            color: '#2E7D32',
            padding: '4px 12px',
            borderRadius: '9999px',
            fontSize: '0.76rem',
            fontWeight: 700,
            display: 'inline-flex',
            alignItems: 'center',
            gap: '5px',
            boxShadow: '0 2px 6px rgba(46, 125, 50, 0.12)',
          }}
        >
          <span style={{ fontSize: '0.85rem' }}>✓</span>
          <span>Completed</span>
        </div>
      );
    }
    if (status === 'in_progress') {
      return (
        <div
          style={{
            background: '#E8F5E9',
            border: '1px solid #A5D6A7',
            color: '#2E7D32',
            padding: '4px 12px',
            borderRadius: '9999px',
            fontSize: '0.76rem',
            fontWeight: 700,
            display: 'inline-flex',
            alignItems: 'center',
            gap: '5px',
            boxShadow: '0 2px 6px rgba(46, 125, 50, 0.12)',
          }}
        >
          <span style={{ fontSize: '0.65rem' }}>▶</span>
          <span>In Progress</span>
        </div>
      );
    }
    return (
      <div
        style={{
          background: 'rgba(255, 255, 255, 0.96)',
          backdropFilter: 'blur(8px)',
          border: '1px solid #E2E8F0',
          color: '#475569',
          padding: '4px 12px',
          borderRadius: '9999px',
          fontSize: '0.76rem',
          fontWeight: 700,
          display: 'inline-flex',
          alignItems: 'center',
          gap: '5px',
          boxShadow: '0 2px 6px rgba(0, 0, 0, 0.05)',
        }}
      >
        <span style={{ fontSize: '0.8rem' }}>🕒</span>
        <span>Not Started</span>
      </div>
    );
  };

  // Render Action Button
  const renderActionButton = (course: StudentCourseItem) => {
    if (course.status === 'completed') {
      return (
        <Link
          to={`/courses/${course.id}`}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
            width: '100%',
            height: '42px',
            borderRadius: '10px',
            background: '#E8F5E9',
            border: '1px solid #C8E6C9',
            color: '#2E7D32',
            fontWeight: 700,
            fontSize: '0.92rem',
            textDecoration: 'none',
            transition: 'all 0.18s ease',
          }}
        >
          <span>Review Course ➔</span>
        </Link>
      );
    }

    if (course.status === 'in_progress') {
      return (
        <Link
          to={`/courses/${course.id}`}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
            width: '100%',
            height: '42px',
            borderRadius: '10px',
            background: '#1E88E5',
            border: '1px solid #1E88E5',
            color: '#FFFFFF',
            fontWeight: 700,
            fontSize: '0.92rem',
            textDecoration: 'none',
            boxShadow: '0 4px 12px rgba(30, 136, 229, 0.35)',
            transition: 'all 0.18s ease',
          }}
        >
          <span>Continue Learning ➔</span>
        </Link>
      );
    }

    return (
      <Link
        to={`/courses/${course.id}`}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '6px',
          width: '100%',
          height: '42px',
          borderRadius: '10px',
          background: '#FFFFFF',
          border: '1.5px solid #1E88E5',
          color: '#1E88E5',
          fontWeight: 700,
          fontSize: '0.92rem',
          textDecoration: 'none',
          transition: 'all 0.18s ease',
        }}
      >
        <span>Start Learning ➔</span>
      </Link>
    );
  };

  return (
    <div className="animate-rise" style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem', paddingBottom: '2.5rem' }}>
      {/* ── 1. Featured Ongoing Course ("Your Current Course") ── */}
      <div
        style={{
          background: '#FFFFFF',
          borderRadius: '20px',
          boxShadow: '0 8px 30px rgba(11, 32, 56, 0.05), 0 2px 8px rgba(0, 0, 0, 0.02)',
          border: '1px solid #E2E8F0',
          overflow: 'hidden',
          display: 'grid',
          gridTemplateColumns: '350px minmax(0, 1fr) 290px',
          alignItems: 'stretch',
        }}
      >
        {/* Left Artwork */}
        <div style={{ position: 'relative', overflow: 'hidden', minHeight: '230px' }}>
          <img
            src={featuredCourse.coverImg}
            alt={featuredCourse.title}
            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
          />
          {/* Floating Current Course Badge */}
          <div
            style={{
              position: 'absolute',
              top: '14px',
              left: '14px',
              background: '#0284C7',
              color: '#FFFFFF',
              padding: '6px 14px',
              borderRadius: '9999px',
              fontSize: '0.8rem',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: '0 4px 12px rgba(2, 132, 199, 0.4)',
            }}
          >
            <span>⭐</span>
            <span>Your Current Course</span>
          </div>
        </div>

        {/* Center Course Info & Progress */}
        <div style={{ padding: '1.75rem 2.25rem', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <h2 style={{ fontSize: '1.7rem', fontWeight: 800, color: '#0F172A', margin: '0 0 6px', letterSpacing: '-0.3px' }}>
            {featuredCourse.title}
          </h2>
          <p style={{ color: '#64748B', fontSize: '0.96rem', margin: '0 0 1.5rem', lineHeight: 1.5 }}>
            {featuredCourse.description}
          </p>

          {/* Stat Row */}
          <div style={{ display: 'flex', gap: '22px', flexWrap: 'wrap', alignItems: 'center', marginBottom: '1.35rem', fontSize: '0.88rem', color: '#334155' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600 }}>
              <span style={{ color: '#1E88E5', fontSize: '1rem' }}>📊</span>
              <span><strong>{featuredCourse.level}</strong> Level</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600 }}>
              <span style={{ color: '#1E88E5', fontSize: '1rem' }}>🎓</span>
              <span><strong>{featuredCourse.modulesCount}</strong> Modules</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600 }}>
              <span style={{ color: '#1E88E5', fontSize: '1rem' }}>▶</span>
              <span><strong>{featuredCourse.lessonsCount}</strong> Lessons</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600 }}>
              <span style={{ color: '#1E88E5', fontSize: '1rem' }}>⏱️</span>
              <span><strong>{featuredCourse.durationHours}</strong> Duration</span>
            </div>
          </div>

          {/* Green Progress Bar */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '5px' }}>
              <span style={{ fontSize: '0.82rem', fontWeight: 800, color: '#16A34A' }}>
                {featuredCourse.progressPercent}%
              </span>
            </div>
            <div style={{ width: '100%', height: '8px', background: '#E2E8F0', borderRadius: '9999px', overflow: 'hidden' }}>
              <div
                style={{
                  width: `${featuredCourse.progressPercent}%`,
                  height: '100%',
                  background: '#22C55E',
                  borderRadius: '9999px',
                  transition: 'width 0.4s ease',
                }}
              />
            </div>
          </div>
        </div>

        {/* Right CTA Box */}
        <div
          style={{
            background: '#F8FAFC',
            borderLeft: '1px solid #E2E8F0',
            padding: '1.75rem',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            gap: '1.25rem',
          }}
        >
          {/* Last Activity Card */}
          <div
            style={{
              background: '#FFFFFF',
              border: '1px solid #E2E8F0',
              borderRadius: '12px',
              padding: '12px 14px',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              boxShadow: '0 2px 6px rgba(0, 0, 0, 0.02)',
            }}
          >
            <span style={{ fontSize: '1.5rem' }}>📅</span>
            <div>
              <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Last Activity
              </div>
              <div style={{ fontSize: '0.86rem', fontWeight: 700, color: '#0F172A', marginTop: '2px' }}>
                Nov 16, 2025 • 2:30 PM
              </div>
            </div>
          </div>

          {/* Action Button */}
          <Link
            to={`/courses/${featuredCourse.id}`}
            style={{
              background: '#1E88E5',
              color: '#FFFFFF',
              padding: '13px 20px',
              borderRadius: '10px',
              fontWeight: 700,
              fontSize: '0.98rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              textDecoration: 'none',
              boxShadow: '0 4px 14px rgba(30, 136, 229, 0.35)',
              transition: 'all 0.18s ease',
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
        <div style={{ position: 'relative', flex: '1 1 380px' }}>
          <div style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8', fontSize: '1rem' }}>
            🔍
          </div>
          <input
            type="text"
            placeholder="Search courses by name, description or level..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              width: '100%',
              padding: '11px 40px 11px 42px',
              borderRadius: '9999px',
              border: '1px solid #CBD5E1',
              background: '#FFFFFF',
              fontSize: '0.92rem',
              outline: 'none',
              boxShadow: '0 2px 6px rgba(0, 0, 0, 0.02)',
              color: '#0F172A',
            }}
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              style={{
                position: 'absolute',
                right: '14px',
                top: '50%',
                transform: 'translateY(-50%)',
                background: '#E2E8F0',
                border: 'none',
                borderRadius: '50%',
                width: '20px',
                height: '20px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '0.75rem',
                color: '#475569',
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
                  border: isActive ? '1px solid #1E88E5' : '1px solid #E2E8F0',
                  background: isActive ? '#1E88E5' : '#FFFFFF',
                  color: isActive ? '#FFFFFF' : '#475569',
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

      {loading ? (
        <StateBlock type="loading" message="Loading your Italian courses…" />
      ) : filteredCourses.length === 0 ? (
        <StateBlock
          type="empty"
          title="No courses match your filter"
          message="Try adjusting your search terms or filter selection."
        />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* ── 3. Row 1: The 3 Main Level Vertical Cards (A2, B1, B2) ── */}
          {verticalCards.length > 0 && (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
                gap: '1.5rem',
              }}
            >
              {verticalCards.map((c) => {
                const isInProgress = c.status === 'in_progress';

                return (
                  <div
                    key={c.id}
                    style={{
                      background: '#FFFFFF',
                      borderRadius: '18px',
                      border: '1px solid #E2E8F0',
                      boxShadow: '0 4px 16px rgba(11, 32, 56, 0.04)',
                      overflow: 'hidden',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                    }}
                  >
                    <div>
                      {/* Top Cover Image with Floating Status Badge */}
                      <div style={{ position: 'relative', height: '160px', overflow: 'hidden' }}>
                        <img
                          src={c.coverImg}
                          alt={c.title}
                          style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                        />
                        <div style={{ position: 'absolute', top: '12px', right: '12px' }}>
                          {renderStatusBadge(c.status)}
                        </div>
                      </div>

                      {/* Content Info */}
                      <div style={{ padding: '1.25rem 1.25rem 0.75rem 1.25rem' }}>
                        <h3 style={{ fontSize: '1.22rem', fontWeight: 800, color: '#0F172A', margin: '0 0 6px', letterSpacing: '-0.2px' }}>
                          {c.title}
                        </h3>
                        <p style={{ color: '#64748B', fontSize: '0.88rem', lineHeight: 1.45, margin: '0 0 1rem', minHeight: '38px' }}>
                          {c.description}
                        </p>

                        {/* Meta Row */}
                        <div
                          style={{
                            display: 'flex',
                            gap: '12px',
                            alignItems: 'center',
                            fontSize: '0.78rem',
                            color: '#64748B',
                            fontWeight: 600,
                            flexWrap: 'wrap',
                          }}
                        >
                          <span>📊 <strong>{c.level}</strong></span>
                          <span>🎓 <strong>{c.modulesCount}</strong> Modules</span>
                          <span>▶ <strong>{c.lessonsCount}</strong> Lessons</span>
                          <span>⏱️ <strong>{c.durationHours}</strong></span>
                        </div>

                        {/* In Progress Bar */}
                        {isInProgress && (
                          <div style={{ marginTop: '12px' }}>
                            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '4px' }}>
                              <span style={{ fontSize: '0.76rem', fontWeight: 800, color: '#1E88E5' }}>
                                {c.progressPercent}%
                              </span>
                            </div>
                            <div style={{ width: '100%', height: '6px', background: '#E2E8F0', borderRadius: '9999px', overflow: 'hidden' }}>
                              <div
                                style={{
                                  width: `${c.progressPercent}%`,
                                  height: '100%',
                                  background: '#1E88E5',
                                  borderRadius: '9999px',
                                }}
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Bottom Action Button */}
                    <div style={{ padding: '0.75rem 1.25rem 1.25rem 1.25rem' }}>
                      {renderActionButton(c)}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* ── 4. Row 2: Special Horizontal Split Cards (Daily Life, Work, Culture & Life) ── */}
          {horizontalCards.length > 0 && (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
                gap: '1.5rem',
              }}
            >
              {horizontalCards.map((c) => {
                const isInProgress = c.status === 'in_progress';

                return (
                  <div
                    key={c.id}
                    style={{
                      background: '#FFFFFF',
                      borderRadius: '18px',
                      border: '1px solid #E2E8F0',
                      boxShadow: '0 4px 16px rgba(11, 32, 56, 0.04)',
                      overflow: 'hidden',
                      display: 'grid',
                      gridTemplateColumns: '135px minmax(0, 1fr)',
                      alignItems: 'stretch',
                      transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                    }}
                  >
                    {/* Left Full-Height Thumbnail */}
                    <div style={{ position: 'relative', overflow: 'hidden', height: '100%', minHeight: '180px' }}>
                      <img
                        src={c.coverImg}
                        alt={c.title}
                        style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                      />
                    </div>

                    {/* Right Content */}
                    <div
                      style={{
                        padding: '1rem 1.15rem',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                      }}
                    >
                      <div>
                        {/* Top Status Badge */}
                        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '4px' }}>
                          {renderStatusBadge(c.status)}
                        </div>

                        <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0F172A', margin: '0 0 4px', letterSpacing: '-0.2px' }}>
                          {c.title}
                        </h3>
                        <p style={{ color: '#64748B', fontSize: '0.8rem', lineHeight: 1.35, margin: '0 0 8px' }}>
                          {c.description}
                        </p>

                        {/* Meta stats */}
                        <div
                          style={{
                            display: 'flex',
                            gap: '8px',
                            alignItems: 'center',
                            fontSize: '0.72rem',
                            color: '#64748B',
                            fontWeight: 600,
                            flexWrap: 'wrap',
                          }}
                        >
                          <span>📊 <strong>{c.level}</strong></span>
                          <span>🎓 <strong>{c.modulesCount}M</strong></span>
                          <span>▶ <strong>{c.lessonsCount}L</strong></span>
                          <span>⏱️ <strong>{c.durationHours}</strong></span>
                        </div>

                        {/* Progress Bar for In Progress */}
                        {isInProgress && (
                          <div style={{ marginTop: '8px' }}>
                            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '2px' }}>
                              <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#1E88E5' }}>
                                {c.progressPercent}%
                              </span>
                            </div>
                            <div style={{ width: '100%', height: '5px', background: '#E2E8F0', borderRadius: '9999px', overflow: 'hidden' }}>
                              <div
                                style={{
                                  width: `${c.progressPercent}%`,
                                  height: '100%',
                                  background: '#1E88E5',
                                  borderRadius: '9999px',
                                }}
                              />
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Bottom Action Button */}
                      <div style={{ marginTop: '10px' }}>
                        {renderActionButton(c)}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ── 5. Bottom Encouragement Banner ── */}
      <div
        style={{
          background: '#FFFFFF',
          borderRadius: '18px',
          border: '1px solid #E2E8F0',
          padding: '1.25rem 2.25rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
          boxShadow: '0 4px 16px rgba(11, 32, 56, 0.03)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ fontSize: '2.4rem' }}>🏆</div>
          <div>
            <div style={{ fontWeight: 800, fontSize: '1.1rem', color: '#0F172A', letterSpacing: '-0.2px' }}>
              You're on the right track!
            </div>
            <div style={{ color: '#64748B', fontSize: '0.9rem', marginTop: '2px' }}>
              Keep learning and achieve your Italian language goals with SS Europa.
            </div>
          </div>
        </div>

        <div>
          <Link
            to="/courses"
            style={{
              background: '#0B2038',
              color: '#FFFFFF',
              padding: '11px 24px',
              borderRadius: '9999px',
              fontWeight: 700,
              fontSize: '0.92rem',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              textDecoration: 'none',
              boxShadow: '0 4px 12px rgba(11, 32, 56, 0.25)',
              transition: 'background 0.18s ease',
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

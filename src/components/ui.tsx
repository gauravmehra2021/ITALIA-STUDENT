import { useState, type ReactNode } from 'react';
import { Icon } from './Icons';
import { speak } from '../lib/speech';
import { mediaUrl } from '../lib/media';
import type { LessonKind } from '../types';

export function Logo({ size = 40, withText = true, light = false }: { size?: number; withText?: boolean; light?: boolean }) {
  return (
    <span className="logo" style={{ display: 'inline-flex', alignItems: 'center', gap: 10 }}>
      <img src="/images/logo-256.png" alt="SS Europa" width={size} height={size} style={{ borderRadius: '50%', background: '#fff' }} />
      {withText && (
        <span style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.1 }}>
          <strong style={{ fontSize: 17, letterSpacing: '-0.01em', color: light ? '#fff' : 'var(--blue-800)' }}>SS Europa</strong>
          <span style={{ fontSize: 11.5, fontWeight: 600, color: light ? 'rgba(255,255,255,0.75)' : 'var(--muted)' }}>Italian Academy</span>
        </span>
      )}
    </span>
  );
}

export function Stars({ value, max = 3, size = 16 }: { value: number; max?: number; size?: number }) {
  return (
    <span className="stars" aria-label={`${value} of ${max} stars`}>
      {Array.from({ length: max }, (_, i) => (
        <Icon.Star key={i} size={size} className={i < value ? 'on' : 'off'} />
      ))}
    </span>
  );
}

export function ProgressBar({ value, tone = 'green', label }: { value: number; tone?: 'green' | 'blue'; label?: string }) {
  const v = Math.max(0, Math.min(100, value));
  return (
    <div className={`progress ${tone === 'blue' ? 'progress-blue' : ''}`} role="progressbar" aria-valuenow={v} aria-valuemin={0} aria-valuemax={100} aria-label={label}>
      <span style={{ width: `${v}%` }} />
    </div>
  );
}

export function ProgressRing({ value, size = 64, stroke = 7, children }: { value: number; size?: number; stroke?: number; children?: ReactNode }) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const v = Math.max(0, Math.min(100, value));
  return (
    <div style={{ position: 'relative', width: size, height: size, flex: 'none' }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }} aria-hidden>
        <circle cx={size / 2} cy={size / 2} r={r} stroke="#e8edf6" strokeWidth={stroke} fill="none" />
        <circle cx={size / 2} cy={size / 2} r={r} stroke="var(--green-500)" strokeWidth={stroke} fill="none"
          strokeDasharray={c} strokeDashoffset={c - (v / 100) * c} strokeLinecap="round" style={{ transition: 'stroke-dashoffset 0.6s ease' }} />
      </svg>
      <div style={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center', fontWeight: 800, fontSize: size / 4.4 }}>
        {children ?? `${Math.round(v)}%`}
      </div>
    </div>
  );
}

export function Loading({ label = 'Loading…' }: { label?: string }) {
  return (
    <div className="state" role="status">
      <div className="spinner" />
      <span>{label}</span>
    </div>
  );
}

export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div className="state" role="alert">
      <div style={{ fontSize: 40 }}>😕</div>
      <strong style={{ color: 'var(--ink)' }}>Something went wrong</strong>
      <span>{message}</span>
      {onRetry && (
        <button className="btn btn-sm" onClick={onRetry}>
          <Icon.Refresh size={16} /> Try again
        </button>
      )}
    </div>
  );
}

export function Empty({ icon = '📭', title, children }: { icon?: string; title: string; children?: ReactNode }) {
  return (
    <div className="state">
      <div style={{ fontSize: 44 }}>{icon}</div>
      <strong style={{ color: 'var(--ink)', fontSize: '1.05rem' }}>{title}</strong>
      {children}
    </div>
  );
}

/** Course illustration with a soft tinted background. */
export function Illustration({ src, size = 56, alt = '', tint = 'var(--blue-50)' }: { src?: string | null; size?: number; alt?: string; tint?: string }) {
  const url = mediaUrl(src);
  return (
    <div style={{ width: size, height: size, borderRadius: size * 0.28, background: tint, display: 'grid', placeItems: 'center', flex: 'none' }}>
      {url ? <img src={url} alt={alt} width={size * 0.72} height={size * 0.72} loading="lazy" /> : <Icon.Book size={size * 0.45} />}
    </div>
  );
}

export function AudioButton({ text, audioUrl, size = 'md', label }: { text: string; audioUrl?: string | null; size?: 'sm' | 'md' | 'lg'; label?: string }) {
  const [playing, setPlaying] = useState(false);
  const dims = size === 'lg' ? 72 : size === 'sm' ? 32 : 40;
  return (
    <button
      type="button"
      className={`audio-btn audio-${size} ${playing ? 'is-playing' : ''}`}
      style={{ width: dims, height: dims }}
      aria-label={label ?? `Listen: ${text}`}
      title="Listen"
      onClick={async (e) => {
        e.stopPropagation();
        setPlaying(true);
        await speak(text, { audioUrl });
        setPlaying(false);
      }}
    >
      <Icon.Volume size={size === 'lg' ? 32 : size === 'sm' ? 16 : 20} />
    </button>
  );
}

export const KIND_META: Record<LessonKind, { label: string; emoji: string; color: string; bg: string }> = {
  Vocabulary: { label: 'Words', emoji: '📸', color: '#1450b8', bg: '#e3edff' },
  Dialogue: { label: 'Dialogue', emoji: '💬', color: '#00894a', bg: '#dcf5e8' },
  Grammar: { label: 'Grammar', emoji: '📘', color: '#7a3cc8', bg: '#efe4ff' },
  Review: { label: 'Review', emoji: '🏆', color: '#b07400', bg: '#fff4cf' },
  Video: { label: 'Video', emoji: '🎬', color: '#c8202e', bg: '#fde4e6' },
  Exam: { label: 'Exam', emoji: '📝', color: '#0f1b33', bg: '#eef1f6' },
};

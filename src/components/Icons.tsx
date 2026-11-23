import type { SVGProps } from 'react';

type P = SVGProps<SVGSVGElement> & { size?: number };

function base({ size = 20, ...rest }: P) {
  return {
    width: size,
    height: size,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 2,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    'aria-hidden': true,
    ...rest,
  };
}

export const Icon = {
  Home: (p: P) => (<svg {...base(p)}><path d="M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z" /></svg>),
  Book: (p: P) => (<svg {...base(p)}><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20V3H6.5A2.5 2.5 0 0 0 4 5.5z" /><path d="M4 19.5A2.5 2.5 0 0 0 6.5 22H20v-5" /></svg>),
  Compass: (p: P) => (<svg {...base(p)}><circle cx="12" cy="12" r="9" /><path d="m15.5 8.5-2 5-5 2 2-5z" /></svg>),
  Video: (p: P) => (<svg {...base(p)}><rect x="2" y="6" width="14" height="12" rx="2" /><path d="m22 8-6 4 6 4z" /></svg>),
  Chart: (p: P) => (<svg {...base(p)}><path d="M3 3v18h18" /><path d="M7 15l4-4 3 3 5-6" /></svg>),
  Bell: (p: P) => (<svg {...base(p)}><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.7 21a2 2 0 0 1-3.4 0" /></svg>),
  Sparkles: (p: P) => (<svg {...base(p)}><path d="M12 3l1.8 4.7L18.5 9.5l-4.7 1.8L12 16l-1.8-4.7L5.5 9.5l4.7-1.8z" /><path d="M19 15l.8 2.2L22 18l-2.2.8L19 21l-.8-2.2L16 18l2.2-.8z" /></svg>),
  Logout: (p: P) => (<svg {...base(p)}><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><path d="m16 17 5-5-5-5" /><path d="M21 12H9" /></svg>),
  Lock: (p: P) => (<svg {...base(p)}><rect x="4" y="11" width="16" height="10" rx="2" /><path d="M8 11V7a4 4 0 0 1 8 0v4" /></svg>),
  Check: (p: P) => (<svg {...base(p)}><path d="M20 6 9 17l-5-5" /></svg>),
  X: (p: P) => (<svg {...base(p)}><path d="M18 6 6 18M6 6l12 12" /></svg>),
  Play: (p: P) => (<svg {...base(p)}><path d="M7 4v16l13-8z" fill="currentColor" stroke="none" /></svg>),
  Volume: (p: P) => (<svg {...base(p)}><path d="M11 5 6 9H3v6h3l5 4z" fill="currentColor" /><path d="M15.5 8.5a5 5 0 0 1 0 7" /><path d="M18.5 5.5a9 9 0 0 1 0 13" /></svg>),
  Turtle: (p: P) => (<svg {...base(p)}><path d="M4 15c0-4 3.6-7 8-7s8 3 8 7z" /><path d="M20 15h1.5a1.5 1.5 0 0 0 0-3H20" /><path d="M7 15v3M17 15v3" /></svg>),
  File: (p: P) => (<svg {...base(p)}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><path d="M14 2v6h6M9 13h6M9 17h6" /></svg>),
  Download: (p: P) => (<svg {...base(p)}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><path d="m7 10 5 5 5-5M12 15V3" /></svg>),
  // Arrows point the other way when the page is right-to-left (Urdu): see .flip-rtl.
  ArrowRight: (p: P) => (<svg {...base({ ...p, className: `flip-rtl ${p.className ?? ''}` })}><path d="M5 12h14M13 6l6 6-6 6" /></svg>),
  ArrowLeft: (p: P) => (<svg {...base({ ...p, className: `flip-rtl ${p.className ?? ''}` })}><path d="M19 12H5M11 18l-6-6 6-6" /></svg>),
  Flame: (p: P) => (<svg {...base(p)}><path d="M12 22c4 0 7-2.8 7-7 0-4.5-4-7.5-5-12-2 2-3 4-3 6-1-1-2-2-2.5-3C6 8 5 10.5 5 15c0 4.2 3 7 7 7z" fill="currentColor" stroke="none" /></svg>),
  Star: (p: P) => (<svg {...base(p)}><path d="m12 2.5 2.9 6 6.6.9-4.8 4.6 1.2 6.5L12 17.4l-5.9 3.1 1.2-6.5-4.8-4.6 6.6-.9z" fill="currentColor" stroke="none" /></svg>),
  Trophy: (p: P) => (<svg {...base(p)}><path d="M8 21h8M12 17v4M7 4h10v5a5 5 0 0 1-10 0z" /><path d="M17 5h3v2a3 3 0 0 1-3 3M7 5H4v2a3 3 0 0 0 3 3" /></svg>),
  Bolt: (p: P) => (<svg {...base(p)}><path d="M13 2 4 14h7l-1 8 9-12h-7z" fill="currentColor" stroke="none" /></svg>),
  Clock: (p: P) => (<svg {...base(p)}><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></svg>),
  Chat: (p: P) => (<svg {...base(p)}><path d="M21 12a8 8 0 0 1-11.6 7.1L4 20l1-4.6A8 8 0 1 1 21 12z" /></svg>),
  Menu: (p: P) => (<svg {...base(p)}><path d="M4 6h16M4 12h16M4 18h16" /></svg>),
  Words: (p: P) => (<svg {...base(p)}><path d="M4 7V5h16v2M9 19h6M12 5v14" /></svg>),
  Target: (p: P) => (<svg {...base(p)}><circle cx="12" cy="12" r="9" /><circle cx="12" cy="12" r="5" /><circle cx="12" cy="12" r="1" fill="currentColor" /></svg>),
  Calendar: (p: P) => (<svg {...base(p)}><rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" /></svg>),
  Eye: (p: P) => (<svg {...base(p)}><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z" /><circle cx="12" cy="12" r="3" /></svg>),
  Refresh: (p: P) => (<svg {...base(p)}><path d="M21 12a9 9 0 1 1-3-6.7L21 8" /><path d="M21 3v5h-5" /></svg>),
  Send: (p: P) => (<svg {...base(p)}><path d="m22 2-7 20-4-9-9-4z" /><path d="M22 2 11 13" /></svg>),
  Mic: (p: P) => (<svg {...base(p)}><rect x="9" y="2" width="6" height="12" rx="3" /><path d="M5 10a7 7 0 0 0 14 0M12 17v5M8 22h8" /></svg>),
};

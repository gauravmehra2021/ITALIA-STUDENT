import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { learnApi } from '../services/api';
import { mediaUrl } from '../lib/media';
import { useAuth } from '../hooks/useAuth';
import { useI18n } from '../i18n';
import { Icon } from './Icons';
import '../styles/pdf-viewer.css';

/**
 * Shows a syllabus PDF inside the app, page by page as pictures, with the student's name and email
 * printed across every page. There is no download or print button, and the file itself can only be
 * fetched for a few minutes through a link the API gives to students who may see the course.
 * (Nothing on a screen can be fully protected — the watermark shows who shared a copy.)
 */
export function PdfViewer({ url, title, onClose }: { url: string; title: string; onClose: () => void }) {
  const { t } = useI18n();
  const { user } = useAuth();
  const pagesRef = useRef<HTMLDivElement>(null);
  const [state, setState] = useState<'loading' | 'ready' | 'error'>('loading');
  const [pageCount, setPageCount] = useState(0);
  const mark = [`${user?.firstName ?? ''} ${user?.lastName ?? ''}`.trim(), user?.email].filter(Boolean).join(' · ') || 'SS Europa';
  // The parent passes a new function on every render; keep the latest without reloading the document.
  const closeRef = useRef(onClose);
  closeRef.current = onClose;

  useEffect(() => {
    let cancelled = false;
    let destroy: (() => void) | undefined;
    document.body.classList.add('pdf-open');
    pagesRef.current?.replaceChildren();

    (async () => {
      try {
        // The "legacy" build of pdf.js also runs on older phones (iOS 15–17, older Android WebViews).
        const [{ url: link }, pdfjs, worker] = await Promise.all([
          learnApi.documentLink(url),
          import('pdfjs-dist/legacy/build/pdf.mjs'),
          import('pdfjs-dist/legacy/build/pdf.worker.min.mjs?worker&url'),
        ]);
        if (cancelled) return;
        pdfjs.GlobalWorkerOptions.workerSrc = worker.default;
        const task = pdfjs.getDocument({ url: mediaUrl(link)!, disableAutoFetch: true });
        destroy = () => void task.destroy();
        const doc = await task.promise;
        if (cancelled) return;
        setPageCount(doc.numPages);
        setState('ready');

        const host = pagesRef.current;
        if (!host) return;
        const width = Math.min(host.clientWidth || 800, 900);
        // Sharp enough to read, small enough for phones with little memory.
        const ratio = Math.min(window.devicePixelRatio || 1, 1.5);
        for (let n = 1; n <= doc.numPages; n++) {
          const page = await doc.getPage(n);
          const base = page.getViewport({ scale: 1 });
          const viewport = page.getViewport({ scale: (width / base.width) * ratio });
          const canvas = document.createElement('canvas');
          canvas.width = Math.floor(viewport.width);
          canvas.height = Math.floor(viewport.height);
          canvas.className = 'pdfv-page';
          canvas.style.width = `${width}px`;
          const ctx = canvas.getContext('2d')!;
          await page.render({ canvasContext: ctx, viewport }).promise;
          page.cleanup();
          if (cancelled) return;
          watermark(ctx, canvas.width, canvas.height, mark, ratio);
          host.appendChild(canvas);
        }
      } catch {
        if (!cancelled) setState('error');
      }
    })();

    // No saving or printing shortcuts while the document is open.
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeRef.current();
      if ((e.ctrlKey || e.metaKey) && ['s', 'p'].includes(e.key.toLowerCase())) e.preventDefault();
    };
    window.addEventListener('keydown', onKey);
    return () => {
      cancelled = true;
      destroy?.();
      window.removeEventListener('keydown', onKey);
      document.body.classList.remove('pdf-open');
    };
  }, [url, mark]);

  return createPortal(
    <div className="pdfv" role="dialog" aria-modal="true" aria-label={title} onContextMenu={(e) => e.preventDefault()}>
      <header className="pdfv-bar">
        <Icon.File size={20} />
        <div className="pdfv-title">
          <strong>{title}</strong>
          <span>{state === 'ready' ? t('blocks.pdfPages', { n: pageCount }) + ' · ' : ''}{t('blocks.pdfNote')}</span>
        </div>
        <button type="button" className="btn btn-sm" onClick={onClose}>{t('blocks.pdfClose')}</button>
      </header>
      <div className="pdfv-body" onDragStart={(e) => e.preventDefault()}>
        {state === 'loading' && <p className="pdfv-msg">{t('blocks.pdfLoading')}</p>}
        {state === 'error' && <p className="pdfv-msg">{t('blocks.pdfError')}</p>}
        <div ref={pagesRef} className="pdfv-pages" />
      </div>
    </div>,
    document.body,
  );
}

/** The student's name and email, faint and diagonal, repeated across the page. */
function watermark(ctx: CanvasRenderingContext2D, w: number, h: number, text: string, ratio: number) {
  ctx.save();
  ctx.globalAlpha = 0.13;
  ctx.fillStyle = '#0b3d91';
  ctx.font = `600 ${Math.round(15 * ratio)}px sans-serif`;
  ctx.translate(w / 2, h / 2);
  ctx.rotate(-Math.PI / 7);
  const step = Math.round(150 * ratio);
  const span = Math.hypot(w, h);
  const textWidth = ctx.measureText(text).width + 60 * ratio;
  for (let y = -span / 2; y < span / 2; y += step)
    for (let x = -span / 2; x < span / 2; x += textWidth) ctx.fillText(text, x, y);
  ctx.restore();
}

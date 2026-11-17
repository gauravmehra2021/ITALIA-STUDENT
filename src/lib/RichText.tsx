import type { ReactNode } from 'react';

/**
 * Renders lesson text: paragraphs (blank line), bullet lists ("- "),
 * **bold**, *italic* and single line breaks. No HTML is ever injected.
 */
export function RichText({ text, className }: { text?: string | null; className?: string }) {
  if (!text) return null;
  const blocks = text.replace(/\r\n/g, '\n').split(/\n{2,}/);
  return (
    <div className={['rich', className].filter(Boolean).join(' ')}>
      {blocks.map((block, i) => {
        const lines = block.split('\n');
        if (lines.every((l) => /^\s*[-•]\s+/.test(l))) {
          return (
            <ul key={i}>
              {lines.map((l, j) => (
                <li key={j}>{inline(l.replace(/^\s*[-•]\s+/, ''))}</li>
              ))}
            </ul>
          );
        }
        // Mixed block: a lead line followed by bullets.
        const firstBullet = lines.findIndex((l) => /^\s*[-•]\s+/.test(l));
        if (firstBullet > 0 && lines.slice(firstBullet).every((l) => /^\s*[-•]\s+/.test(l))) {
          return (
            <div key={i}>
              <p>{withBreaks(lines.slice(0, firstBullet))}</p>
              <ul>
                {lines.slice(firstBullet).map((l, j) => (
                  <li key={j}>{inline(l.replace(/^\s*[-•]\s+/, ''))}</li>
                ))}
              </ul>
            </div>
          );
        }
        return <p key={i}>{withBreaks(lines)}</p>;
      })}
    </div>
  );
}

function withBreaks(lines: string[]): ReactNode[] {
  return lines.flatMap((l, i) => (i === 0 ? [inline(l, i)] : [<br key={`br${i}`} />, inline(l, i)]));
}

function inline(text: string, key: number | string = 0): ReactNode {
  const parts: ReactNode[] = [];
  const re = /\*\*(.+?)\*\*|\*(.+?)\*/g;
  let last = 0;
  let m: RegExpExecArray | null;
  let n = 0;
  while ((m = re.exec(text))) {
    if (m.index > last) parts.push(text.slice(last, m.index));
    parts.push(m[1] ? <strong key={n++}>{m[1]}</strong> : <em key={n++}>{m[2]}</em>);
    last = m.index + m[0].length;
  }
  if (last < text.length) parts.push(text.slice(last));
  return <span key={key}>{parts}</span>;
}

import { useState } from 'react';
import { RichText } from '../lib/RichText';
import { embedUrl, mediaUrl } from '../lib/media';
import { speak, stopSpeaking } from '../lib/speech';
import { AudioButton } from './ui';
import { Icon } from './Icons';
import type { DialogueLine, LessonBlock, VocabularyItem } from '../types';

export function LessonBlockView({ block }: { block: LessonBlock }) {
  switch (block.type) {
    case 'Vocabulary':
      return <VocabularyBlock block={block} />;
    case 'Dialogue':
      return <DialogueBlock block={block} />;
    case 'Table':
      return <TableBlock block={block} />;
    case 'Tip':
      return (
        <section className="lb lb-tip">
          <div className="lb-tip-icon">💡</div>
          <div>
            <h3>{block.title || 'Good to know'}</h3>
            <RichText text={block.body} />
          </div>
        </section>
      );
    case 'Video':
      return <VideoBlock block={block} />;
    case 'Audio':
      return (
        <section className="lb card card-pad">
          {block.title && <h3>{block.title}</h3>}
          {block.mediaUrl && <audio controls preload="none" src={mediaUrl(block.mediaUrl) ?? undefined} style={{ width: '100%' }} />}
          {block.caption && <p className="muted small">{block.caption}</p>}
        </section>
      );
    case 'Image':
      return (
        <figure className="lb lb-image">
          {block.mediaUrl && <img src={mediaUrl(block.mediaUrl) ?? undefined} alt={block.caption ?? block.title ?? ''} loading="lazy" />}
          {(block.caption || block.title) && <figcaption>{block.caption || block.title}</figcaption>}
        </figure>
      );
    case 'Pdf':
      return (
        <a className="lb lb-pdf card card-hover" href={mediaUrl(block.mediaUrl) ?? '#'} target="_blank" rel="noreferrer">
          <span className="lb-pdf-icon"><Icon.File size={26} /></span>
          <span style={{ flex: 1 }}>
            <strong>{block.title || 'Download PDF'}</strong>
            {block.body && <span className="muted small" style={{ display: 'block' }}>{block.body}</span>}
          </span>
          <Icon.Download size={20} />
        </a>
      );
    default:
      return <TextBlock block={block} />;
  }
}

function TextBlock({ block }: { block: LessonBlock }) {
  const [showTranslation, setShowTranslation] = useState(false);
  // A text block with a caption is a reading: Italian body + English translation.
  const isReading = Boolean(block.caption);
  return (
    <section className={`lb ${isReading ? 'lb-reading card card-pad' : 'lb-text'}`}>
      {block.title && (
        <div className="row-between">
          <h3>{block.title}</h3>
          {isReading && <AudioButton text={block.body ?? ''} size="sm" label="Listen to the text" />}
        </div>
      )}
      <RichText text={block.body} className={isReading ? 'reading-it' : undefined} />
      {isReading && (
        <>
          <button className="link-toggle" onClick={() => setShowTranslation((v) => !v)}>
            {showTranslation ? 'Hide translation' : 'Show English translation'}
          </button>
          {showTranslation && <RichText text={block.caption} className="reading-en" />}
        </>
      )}
    </section>
  );
}

function VocabularyBlock({ block }: { block: LessonBlock }) {
  const withImages = block.items.some((i) => i.imageUrl);
  return (
    <section className="lb">
      {block.title && (
        <div className="lb-head">
          <h3>{block.title}</h3>
          <span className="muted small">{withImages ? 'Tap a card to hear it' : 'Tap ▶ to listen'}</span>
        </div>
      )}
      {withImages ? (
        <div className="vocab-grid">
          {block.items.map((item) => <VocabCard key={item.id} item={item} />)}
        </div>
      ) : (
        <div className="phrase-list">
          {block.items.map((item) => <PhraseRow key={item.id} item={item} />)}
        </div>
      )}
    </section>
  );
}

function VocabCard({ item }: { item: VocabularyItem }) {
  const [flipped, setFlipped] = useState(false);
  const img = mediaUrl(item.imageUrl);
  return (
    <button
      type="button"
      className={`vocab-card ${flipped ? 'flipped' : ''}`}
      onClick={() => {
        setFlipped((f) => !f);
        void speak(item.italian, { audioUrl: item.audioUrl });
      }}
      aria-label={`${item.italian}: ${item.english}`}
    >
      {!flipped ? (
        <>
          <div className="vocab-img">{img ? <img src={img} alt="" loading="lazy" /> : <span>🔤</span>}</div>
          <strong className="vocab-it">{item.italian}</strong>
          {item.pronunciation && <span className="vocab-pron">{item.pronunciation}</span>}
          <span className="vocab-hint"><Icon.Volume size={14} /> tap</span>
        </>
      ) : (
        <div className="vocab-back">
          <strong className="vocab-en">{item.english}</strong>
          <span className="vocab-it-small">{item.italian}</span>
          {item.example && (
            <span className="vocab-example">
              <em>{item.example}</em>
              {item.exampleEnglish && <span>{item.exampleEnglish}</span>}
            </span>
          )}
        </div>
      )}
    </button>
  );
}

function PhraseRow({ item }: { item: VocabularyItem }) {
  return (
    <div className="phrase">
      <AudioButton text={item.italian} audioUrl={item.audioUrl} size="sm" />
      <div className="phrase-text">
        <strong>{item.italian}</strong>
        <span>{item.english}</span>
      </div>
      {item.pronunciation && <span className="phrase-pron">{item.pronunciation}</span>}
    </div>
  );
}

function DialogueBlock({ block }: { block: LessonBlock }) {
  const [showEnglish, setShowEnglish] = useState(true);
  const [playing, setPlaying] = useState<number | null>(null);
  const speakers = [...new Set(block.lines.map((l) => l.speaker))];

  async function playAll() {
    for (let i = 0; i < block.lines.length; i++) {
      setPlaying(i);
      await speak(block.lines[i].italian, { audioUrl: block.lines[i].audioUrl });
      // Stop if the user started something else.
      if (playingRef.stopped) break;
    }
    setPlaying(null);
    playingRef.stopped = false;
  }

  return (
    <section className="lb">
      <div className="lb-head">
        <h3>💬 {block.title || 'Dialogue'}</h3>
        <div className="row" style={{ gap: 8 }}>
          <button className="btn btn-sm" onClick={() => setShowEnglish((v) => !v)}>{showEnglish ? 'Hide English' : 'Show English'}</button>
          {playing === null ? (
            <button className="btn btn-sm btn-success" onClick={() => void playAll()}><Icon.Play size={14} /> Play all</button>
          ) : (
            <button className="btn btn-sm" onClick={() => { playingRef.stopped = true; stopSpeaking(); setPlaying(null); }}>Stop</button>
          )}
        </div>
      </div>
      <div className="dialogue">
        {block.lines.map((line, i) => (
          <DialogueBubble key={i} line={line} right={speakers.indexOf(line.speaker) % 2 === 1} active={playing === i} showEnglish={showEnglish} />
        ))}
      </div>
    </section>
  );
}

const playingRef = { stopped: false };

function DialogueBubble({ line, right, active, showEnglish }: { line: DialogueLine; right: boolean; active: boolean; showEnglish: boolean }) {
  return (
    <div className={`dl ${right ? 'dl-right' : ''} ${active ? 'dl-active' : ''}`}>
      <span className="dl-avatar">{line.speaker.slice(0, 1)}</span>
      <div className="dl-bubble">
        <span className="dl-speaker">{line.speaker}</span>
        <div className="dl-line">
          <strong>{line.italian}</strong>
          <AudioButton text={line.italian} audioUrl={line.audioUrl} size="sm" />
        </div>
        {showEnglish && <span className="dl-en">{line.english}</span>}
      </div>
    </div>
  );
}

function TableBlock({ block }: { block: LessonBlock }) {
  const [head, ...rows] = block.table;
  if (!head) return null;
  return (
    <section className="lb">
      {block.title && <h3>{block.title}</h3>}
      <div className="table-wrap">
        <table className="g-table">
          <thead><tr>{head.map((h, i) => <th key={i}>{h}</th>)}</tr></thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={i}>{r.map((c, j) => <td key={j} className={j === 1 ? 'em' : ''}>{c}</td>)}</tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function VideoBlock({ block }: { block: LessonBlock }) {
  const embed = embedUrl(block.mediaUrl);
  const src = mediaUrl(block.mediaUrl);
  return (
    <section className="lb">
      {block.title && <h3>🎬 {block.title}</h3>}
      <div className="video-frame">
        {embed ? (
          <iframe src={embed} title={block.title ?? 'Lesson video'} allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowFullScreen />
        ) : src ? (
          <video src={src} controls preload="metadata" playsInline />
        ) : null}
      </div>
      {block.caption && <p className="muted small">{block.caption}</p>}
    </section>
  );
}

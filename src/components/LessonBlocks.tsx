import { useState } from 'react';
import { RichText } from '../lib/RichText';
import { embedUrl, mediaUrl } from '../lib/media';
import { speak, stopSpeaking } from '../lib/speech';
import { AudioButton } from './ui';
import { RoleplayBlock } from './Roleplay';
import { Icon } from './Icons';
import { dirOf, htmlLangOf, useI18n, useTc } from '../i18n';
import { Tr, useContentTr } from '../i18n/content';
import { LANGUAGE_NAME, meaningColumns, splitMeaning } from '../lib/meaning';
import type { DialogueLine, LessonBlock, VocabularyItem } from '../types';

export function LessonBlockView({ block }: { block: LessonBlock }) {
  const { t } = useI18n();
  const tc = useTc();
  switch (block.type) {
    case 'Vocabulary':
      return <VocabularyBlock block={block} />;
    case 'Dialogue':
      return <DialogueBlock block={block} />;
    case 'Roleplay':
      return <RoleplayBlock block={block} />;
    case 'Table':
      return <TableBlock block={block} />;
    case 'Tip':
      return (
        <section className="lb lb-tip">
          <div className="lb-tip-icon">💡</div>
          <div>
            <h3>{tc(block.title) || t('blocks.goodToKnow')}</h3>
            {tc(block.title) === block.title && <Tr text={block.title} />}
            <RichText text={block.body} />
            <Tr text={block.body} rich />
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
            <strong>{tc(block.title) || t('blocks.downloadPdf')}</strong>
            {tc(block.title) === block.title && <Tr text={block.title} />}
            {block.body && <span className="muted small" style={{ display: 'block' }}>{tc(block.body)}</span>}
          </span>
          <Icon.Download size={20} />
        </a>
      );
    default:
      return <TextBlock block={block} />;
  }
}

function TextBlock({ block }: { block: LessonBlock }) {
  const { t } = useI18n();
  const tc = useTc();
  const [showTranslation, setShowTranslation] = useState(false);
  // A text block with a caption is a reading: Italian body + English translation.
  const isReading = Boolean(block.caption);
  return (
    <section className={`lb ${isReading ? 'lb-reading card card-pad' : 'lb-text'}`}>
      {block.title && (
        <div className="row-between">
          <div>
            <h3>{tc(block.title)}</h3>
            {tc(block.title) === block.title && <Tr text={block.title} />}
          </div>
          {isReading && <AudioButton text={block.body ?? ''} size="sm" label={t('blocks.listenText')} />}
        </div>
      )}
      <RichText text={block.body} className={isReading ? 'reading-it' : undefined} />
      {!isReading && <Tr text={block.body} rich />}
      {isReading && (
        <>
          <button className="link-toggle" onClick={() => setShowTranslation((v) => !v)}>
            {showTranslation ? t('blocks.hideTranslation') : t('blocks.showTranslation')}
          </button>
          {showTranslation && <RichText text={block.caption} className="reading-en" />}
          {showTranslation && <Tr text={block.caption} rich />}
        </>
      )}
    </section>
  );
}

function VocabularyBlock({ block }: { block: LessonBlock }) {
  const { t } = useI18n();
  const tc = useTc();
  const withImages = block.items.some((i) => i.imageUrl);
  return (
    <section className="lb">
      {block.title && (
        <div className="lb-head">
          <div>
            <h3>{tc(block.title)}</h3>
            {tc(block.title) === block.title && <Tr text={block.title} />}
          </div>
          <span className="muted small">{withImages ? t('blocks.tapCard') : t('blocks.tapPlay')}</span>
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

/** The Punjabi written in the lesson is shown only to students who chose Punjabi. */
const showsLessonPunjabi = (lang: string) => lang === 'pa';

/** The Punjabi written on the word (Punjabi learners), or the translation (Hindi, Urdu); nothing in English. */
function Meaning({ item, cls }: { item: VocabularyItem; cls: string }) {
  const { lang } = useI18n();
  if (item.punjabi && showsLessonPunjabi(lang)) return <span className={cls} lang="pa-Latn"><abbr title="Punjabi">PA</abbr> {item.punjabi}</span>;
  return <Tr text={item.english} />;
}

function VocabCard({ item }: { item: VocabularyItem }) {
  const { t } = useI18n();
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
          <span className="vocab-hint"><Icon.Volume size={14} /> {t('blocks.tap')}</span>
        </>
      ) : (
        <div className="vocab-back">
          <strong className="vocab-en">{item.english}</strong>
          <Meaning item={item} cls="vocab-pa" />
          <span className="vocab-it-small">{item.italian}</span>
          {item.example && (
            <span className="vocab-example">
              <em>{item.example}</em>
              {item.exampleEnglish && <span>{item.exampleEnglish}</span>}
              <Tr text={item.exampleEnglish} />
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
        <Meaning item={item} cls="phrase-pa" />
      </div>
      {item.pronunciation && <span className="phrase-pron">{item.pronunciation}</span>}
    </div>
  );
}

function DialogueBlock({ block }: { block: LessonBlock }) {
  const { t } = useI18n();
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
        <h3>💬 {block.title || t('blocks.dialogue')}</h3>
        <div className="row" style={{ gap: 8 }}>
          <button className="btn btn-sm" onClick={() => setShowEnglish((v) => !v)}>{showEnglish ? t('blocks.hide') : t('blocks.show')}</button>
          {playing === null ? (
            <button className="btn btn-sm btn-success" onClick={() => void playAll()}><Icon.Play size={14} /> {t('blocks.playAll')}</button>
          ) : (
            <button className="btn btn-sm" onClick={() => { playingRef.stopped = true; stopSpeaking(); setPlaying(null); }}>{t('blocks.stop')}</button>
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
  const { lang } = useI18n();
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
        {showEnglish && line.punjabi && showsLessonPunjabi(lang) && <span className="dl-pa" lang="pa-Latn"><abbr title="Punjabi">PA</abbr> {line.punjabi}</span>}
        {showEnglish && (!line.punjabi || !showsLessonPunjabi(lang)) && <Tr text={line.english} />}
      </div>
    </div>
  );
}

/** The translation of an English meaning in the student's language (Hindi / Urdu table cells). */
function TranslatedCell({ text }: { text: string | undefined }) {
  const { lang } = useI18n();
  const value = useContentTr(text);
  return <span lang={htmlLangOf(lang)} dir={dirOf(lang)}>{value ?? ''}</span>;
}

/**
 * Grammar table. A Punjabi meaning column is shown in the student's language: Punjabi as written,
 * Hindi / Urdu as the translation of the English meaning, and not at all in English.
 */
function TableBlock({ block }: { block: LessonBlock }) {
  const tc = useTc();
  const { lang } = useI18n();
  const [head, ...rows] = block.table;
  if (!head) return null;
  const { english, punjabi, mixed } = meaningColumns(head);
  const separate = english >= 0 && punjabi >= 0;
  const translated = lang === 'hi' || lang === 'ur';
  // A Punjabi column without English (older content) only means something to Punjabi learners.
  const hidden = (j: number) => j === punjabi && lang !== 'pa' && (!separate || lang === 'en');
  const columns = head.map((_, j) => j).filter((j) => !hidden(j));

  const header = (h: string, j: number) => {
    if (separate && j === punjabi && translated) return LANGUAGE_NAME[lang];
    if (j === mixed) return lang === 'pa' ? h : translated ? `English · ${LANGUAGE_NAME[lang]}` : 'English';
    return <>{h}<Tr text={h} className="tr-th" /></>;
  };
  const cell = (row: string[], j: number) => {
    const c = row[j] ?? '';
    if (separate && j === punjabi && translated) return <TranslatedCell text={row[english]} />;
    if (j === mixed) {
      const [en] = splitMeaning(c);
      if (lang === 'pa') return c;
      return <>{en}<Tr text={en} block /></>;
    }
    return c;
  };

  return (
    <section className="lb">
      {block.title && <h3>{tc(block.title)}</h3>}
      {block.title && tc(block.title) === block.title && <Tr text={block.title} />}
      <div className="table-wrap">
        <table className="g-table">
          <thead><tr>{columns.map((j) => <th key={j}>{header(head[j], j)}</th>)}</tr></thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={i}>{columns.map((j) => <td key={j} className={j === 1 ? 'em' : ''}>{cell(r, j)}</td>)}</tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function VideoBlock({ block }: { block: LessonBlock }) {
  const { t } = useI18n();
  const embed = embedUrl(block.mediaUrl);
  const src = mediaUrl(block.mediaUrl);
  return (
    <section className="lb">
      {block.title && <h3>🎬 {block.title}</h3>}
      <div className="video-frame">
        {embed ? (
          <iframe src={embed} title={block.title ?? t('blocks.video')} allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowFullScreen />
        ) : src ? (
          <video src={src} controls preload="metadata" playsInline />
        ) : null}
      </div>
      {block.caption && <p className="muted small">{block.caption}</p>}
    </section>
  );
}

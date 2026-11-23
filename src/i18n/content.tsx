import { useEffect, useSyncExternalStore } from 'react';
import { learnApi } from '../services/api';
import { RichText } from '../lib/RichText';
import { apiFromCode, dirOf, htmlLangOf, useI18n, type LangCode } from '.';

// ─────────────────────────────────────────────────────────────────────────────
// Lesson content translations (Punjabi / Hindi / Urdu), managed by admins in the database.
// Any component can ask for the translation of an English text; requests made in the
// same moment are sent together in one call and cached for the rest of the visit.
// ─────────────────────────────────────────────────────────────────────────────

type ContentLang = Exclude<LangCode, 'en'>;

const CONTENT_LANGS: ContentLang[] = ['pa', 'hi', 'ur'];
const cache = Object.fromEntries(CONTENT_LANGS.map((l) => [l, new Map<string, string | null>()])) as Record<ContentLang, Map<string, string | null>>;
const queue = Object.fromEntries(CONTENT_LANGS.map((l) => [l, new Set<string>()])) as Record<ContentLang, Set<string>>;
const listeners = new Set<() => void>();
let version = 0;
let timer: number | null = null;

const notify = () => {
  version++;
  listeners.forEach((l) => l());
};

async function flush() {
  timer = null;
  for (const lang of CONTENT_LANGS) {
    const texts = [...queue[lang]];
    queue[lang].clear();
    for (let i = 0; i < texts.length; i += 400) {
      const chunk = texts.slice(i, i + 400);
      try {
        const found = await learnApi.translations(apiFromCode(lang), chunk);
        for (const t of chunk) cache[lang].set(t, found[t] ?? null);
      } catch {
        // Offline or signed out: show the original text only.
        for (const t of chunk) cache[lang].set(t, null);
      }
    }
  }
  notify();
}

function request(lang: ContentLang, text: string) {
  if (cache[lang].has(text) || queue[lang].has(text)) return;
  queue[lang].add(text);
  if (timer === null) timer = window.setTimeout(() => void flush(), 25);
}

const subscribe = (l: () => void) => {
  listeners.add(l);
  return () => listeners.delete(l);
};

/** Forget cached translations (e.g. after signing in as someone else). */
export function clearContentTranslations() {
  CONTENT_LANGS.forEach((l) => cache[l].clear());
  notify();
}

/**
 * The translation of an English content text in the student's language, or null
 * (English chosen, no translation yet, or still loading).
 */
export function useContentTr(text: string | null | undefined): string | null {
  const { lang } = useI18n();
  useSyncExternalStore(subscribe, () => version);
  const key = text?.trim() ?? '';
  useEffect(() => {
    if (lang !== 'en' && key) request(lang, key);
  }, [lang, key]);
  if (lang === 'en' || !key) return null;
  return cache[lang].get(key) ?? null;
}

/** Small translated line shown under an original text. Renders nothing when there is none. */
export function Tr({ text, block = false, rich = false, className = '' }: { text: string | null | undefined; block?: boolean; rich?: boolean; className?: string }) {
  const { lang } = useI18n();
  const value = useContentTr(text);
  // Nothing to add when the "translation" is the same text (e.g. an Italian verb in a table).
  if (!value || value.trim() === text?.trim()) return null;
  const langAttr = htmlLangOf(lang);
  const dir = dirOf(lang);
  if (rich) return <div lang={langAttr} dir={dir}><RichText text={value} className={`tr tr-rich ${className}`} /></div>;
  const Tag = block ? 'div' : 'span';
  return <Tag className={`tr ${block ? 'tr-block' : ''} ${className}`} lang={langAttr} dir={dir}>{value}</Tag>;
}

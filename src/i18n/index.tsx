import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { en, type Dict } from './en';
import { pa } from './pa';
import { hi } from './hi';
import { ur } from './ur';

// ─────────────────────────────────────────────────────────────────────────────
// Student portal languages. The choice is kept on this device (so it works on the
// login page too) and on the student's profile (so it follows them to other devices).
// Italian is never translated. Punjabi is written in Roman letters; Urdu in Urdu script,
// and the whole page turns right-to-left when Urdu is chosen.
// ─────────────────────────────────────────────────────────────────────────────

export type LangCode = 'en' | 'pa' | 'hi' | 'ur';

export interface LanguageInfo {
  code: LangCode;
  /** Name used by the API (profile language, translations). */
  api: string;
  /** Name shown in the language choosers. */
  label: string;
  /** Greeting shown under the name on the dashboard chooser. */
  hello: string;
  /** Value for the html lang attribute (Punjabi is written in Roman letters). */
  htmlLang: string;
  /** Writing direction: Urdu is right-to-left. */
  dir: 'ltr' | 'rtl';
  locale: string;
}

export const LANGUAGES: LanguageInfo[] = [
  { code: 'en', api: 'English', label: 'English', hello: 'Hello', htmlLang: 'en', dir: 'ltr', locale: 'en-GB' },
  { code: 'pa', api: 'Punjabi', label: 'Punjabi', hello: 'Sat Sri Akal', htmlLang: 'pa-Latn', dir: 'ltr', locale: 'en-IN' },
  { code: 'hi', api: 'Hindi', label: 'हिंदी (Hindi)', hello: 'नमस्ते', htmlLang: 'hi', dir: 'ltr', locale: 'hi-IN' },
  { code: 'ur', api: 'Urdu', label: 'اردو (Urdu)', hello: 'السلام علیکم', htmlLang: 'ur', dir: 'rtl', locale: 'ur-PK' },
];

export const htmlLangOf = (code: LangCode) => LANGUAGES.find((l) => l.code === code)!.htmlLang;
export const dirOf = (code: LangCode) => LANGUAGES.find((l) => l.code === code)!.dir;

const DICTS: Record<LangCode, Dict> = { en, pa, hi, ur };
const STORAGE_KEY = 'sseuropa_student_lang';

/** "Punjabi" (from the API) → "pa". Unknown values → null. */
export function codeFromApi(value?: string | null): LangCode | null {
  const v = (value ?? '').toLowerCase();
  return LANGUAGES.find((l) => l.api.toLowerCase() === v || l.code === v)?.code ?? null;
}

export const apiFromCode = (code: LangCode) => LANGUAGES.find((l) => l.code === code)!.api;

function readStored(): LangCode | null {
  try {
    return codeFromApi(localStorage.getItem(STORAGE_KEY));
  } catch {
    return null;
  }
}

function writeStored(code: LangCode) {
  try {
    localStorage.setItem(STORAGE_KEY, code);
  } catch {
    /* private mode: keep it in memory */
  }
}

type Vars = Record<string, string | number>;

function lookup(dict: Dict, key: string): string | undefined {
  let node: unknown = dict;
  for (const part of key.split('.')) {
    if (node && typeof node === 'object' && part in (node as Record<string, unknown>)) node = (node as Record<string, unknown>)[part];
    else return undefined;
  }
  return typeof node === 'string' ? node : undefined;
}

const fill = (text: string, vars?: Vars) =>
  vars ? text.replace(/\{(\w+)\}/g, (m, k: string) => (k in vars ? String(vars[k]) : m)) : text;

/** Builds a translate function for a language (falls back to English, then to the key). */
export function makeT(code: LangCode) {
  // Right-to-left text starts with an invisible RLM so it stays RTL even when it begins
  // with a Latin word or a name ("{name} کے ساتھ"). See language.css.
  const mark = dirOf(code) === 'rtl' ? '‏' : '';
  return (key: string, vars?: Vars) => mark + fill(lookup(DICTS[code], key) ?? lookup(en, key) ?? key, vars);
}

export type TFunction = ReturnType<typeof makeT>;

interface I18nState {
  lang: LangCode;
  locale: string;
  t: TFunction;
  setLang: (code: LangCode) => void;
}

const I18nContext = createContext<I18nState>({ lang: 'en', locale: 'en-GB', t: makeT('en'), setLang: () => undefined });

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<LangCode>(() => readStored() ?? 'en');

  useEffect(() => {
    document.documentElement.lang = htmlLangOf(lang);
    document.documentElement.dir = dirOf(lang);
  }, [lang]);

  const setLang = useCallback((code: LangCode) => {
    writeStored(code);
    setLangState(code);
  }, []);

  const value = useMemo<I18nState>(
    () => ({ lang, locale: LANGUAGES.find((l) => l.code === lang)!.locale, t: makeT(lang), setLang }),
    [lang, setLang],
  );
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export const useI18n = () => useContext(I18nContext);

// ── Standard instructions that come from the course content ──────────────────
// Lesson exercises use a fixed set of English instructions (written by the content
// builder). These are shown in the student's language; anything else stays as written.

const EXACT: Record<string, string> = {
  'Listen and choose the right picture': 'ex.listenPicture',
  'Listen and choose the word you hear': 'ex.listenWord',
  'Listen: which word do you hear?': 'ex.listenWhichWord',
  'Listen and choose the number': 'ex.listenNumber',
  'Listen and choose the sentence you hear': 'ex.listenSentence',
  'Listen and choose what you hear': 'ex.listenWhat',
  'Listen and choose the time': 'ex.listenTime',
  'Listen: what time is it?': 'ex.listenWhatTime',
  'Listen and choose the price or weight': 'ex.listenPrice',
  'Listen: how much is it?': 'ex.listenHowMuch',
  'What is this in Italian?': 'ex.whatInItalian',
  'What does it mean?': 'ex.whatMeans',
  'Match the Italian words with their meaning': 'ex.matchWords',
  'Match each Italian word with its meaning': 'ex.matchEach',
  'Match each word with its meaning': 'ex.matchEachWord',
  'Match each expression with its meaning': 'ex.matchExpression',
  'Choose the missing word': 'ex.missingWord',
  'True or false?': 'ex.trueFalse',
  'Choose the correct sentence': 'ex.correctSentence',
  'Choose the correct sentence:': 'ex.correctSentence',
  'Choose the correct form:': 'ex.correctForm',
  // Block titles written by the content builder
  'New words': 'blocks.newWords',
  'Key phrases': 'blocks.keyPhrases',
  'Useful phrases': 'blocks.usefulPhrases',
  'Examples': 'blocks.examples',
  'The situation': 'blocks.situation',
  'Good to know': 'blocks.goodToKnow',
  'What you can do now': 'blocks.canDoNow',
  'Unit study sheet (PDF)': 'blocks.unitSheet',
  'All the words, dialogues and grammar of this unit on one printable sheet.': 'blocks.unitSheetText',
  'Course phrasebook (PDF)': 'blocks.phrasebook',
  'The slides your teacher uses in class. Open them on your phone or print them.': 'blocks.slidesText',
};

const PATTERNS: [RegExp, string][] = [
  [/^True or false\? \((.+)\)$/s, 'ex.trueFalseAbout'],
  [/^Put the words in order: "(.+)"$/s, 'ex.wordOrder'],
  [/^They say: “(.+)” — what do you answer\?$/s, 'ex.theySay'],
  [/^Write the number in Italian: (.+)$/s, 'ex.writeNumber'],
  [/^Make it negative: "(.+)"$/s, 'ex.makeNegative'],
  [/^Class slides: (.+) \(PDF\)$/s, 'blocks.classSlides'],
];

/**
 * Translates a standard instruction or block title from the course content.
 * Test sections keep their number: "1A · Listen and choose…" → "1A · Suno te…".
 */
export function translateContent(text: string | null | undefined, t: TFunction, lang: LangCode): string {
  if (!text || lang === 'en') return text ?? '';
  const prefix = /^(\d+[A-Z]? · )/.exec(text)?.[1] ?? '';
  const body = text.slice(prefix.length);
  const exact = EXACT[body];
  if (exact) return prefix + t(exact);
  for (const [re, key] of PATTERNS) {
    const m = re.exec(body);
    if (m) return prefix + t(key, { text: m[1], name: m[1] });
  }
  return text;
}

/** Shorthand for components: const tc = useTc(); tc(exercise.prompt). */
export function useTc() {
  const { t, lang } = useI18n();
  return useCallback((text: string | null | undefined) => translateContent(text, t, lang), [t, lang]);
}

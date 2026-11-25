// Where lessons carry a Punjabi meaning next to the English one. Students who chose Punjabi see
// the Punjabi; Hindi and Urdu learners see the translation of the English; English learners see
// English only. Same rules as ITALIA-backend/content/translatable.mjs and the API (PunjabiText).

/** Header of a column that holds "English · Punjabi" in each cell. */
const MIXED_HEADER = /^English\s*[·/]\s*Punjabi$/;

/** "the biggest · sab ton vadda" → ["the biggest", "sab ton vadda"] (Punjabi may be missing). */
export function splitMeaning(text: string): [string, string | null] {
  const i = text.indexOf(' · ');
  return i < 0 ? [text, null] : [text.slice(0, i), text.slice(i + 3)];
}

export interface MeaningColumns {
  /** Column with the English meaning, next to a separate Punjabi column. */
  english: number;
  /** Separate Punjabi column. */
  punjabi: number;
  /** One "English · Punjabi" column. */
  mixed: number;
}

export function meaningColumns(head: string[]): MeaningColumns {
  const english = head.indexOf('English');
  const punjabi = head.indexOf('Punjabi');
  const mixed = head.findIndex((h) => MIXED_HEADER.test(h.trim()));
  return { english, punjabi, mixed };
}

/** Name of the student's language, shown as a column header. */
export const LANGUAGE_NAME: Record<string, string> = { pa: 'Punjabi', hi: 'हिंदी', ur: 'اردو' };

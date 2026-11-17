import { mediaUrl } from './media';

// Italian pronunciation.
// A recorded file (audioUrl) is used when a teacher uploaded one; otherwise the
// device's built-in Italian voice reads the text (Chrome, Edge, Safari, Android, iOS).

let italianVoice: SpeechSynthesisVoice | null = null;
let current: HTMLAudioElement | null = null;

function pickVoice() {
  if (!('speechSynthesis' in window)) return;
  const voices = window.speechSynthesis.getVoices();
  italianVoice =
    voices.find((v) => v.lang === 'it-IT' && /google|natural|online/i.test(v.name)) ||
    voices.find((v) => v.lang === 'it-IT') ||
    voices.find((v) => v.lang.toLowerCase().startsWith('it')) ||
    null;
}

if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
  pickVoice();
  window.speechSynthesis.onvoiceschanged = pickVoice;
}

export const canSpeak = () => typeof window !== 'undefined' && 'speechSynthesis' in window;

/** Plays Italian audio. Resolves when playback ends (or immediately if audio isn't available). */
export function speak(text: string, opts: { audioUrl?: string | null; slow?: boolean } = {}): Promise<void> {
  stopSpeaking();
  if (opts.audioUrl) {
    return new Promise((resolve) => {
      current = new Audio(mediaUrl(opts.audioUrl) ?? undefined);
      current.playbackRate = opts.slow ? 0.75 : 1;
      current.onended = () => resolve();
      current.onerror = () => resolve();
      current.play().catch(() => resolve());
    });
  }
  if (!canSpeak() || !text) return Promise.resolve();

  // Speak only the Italian: drop dashes and ellipses used in the written form.
  const clean = text.replace(/[–—…]/g, ' ').replace(/\s+/g, ' ').trim();
  return new Promise((resolve) => {
    const u = new SpeechSynthesisUtterance(clean);
    u.lang = 'it-IT';
    if (italianVoice) u.voice = italianVoice;
    u.rate = opts.slow ? 0.6 : 0.88;
    u.onend = () => resolve();
    u.onerror = () => resolve();
    window.speechSynthesis.speak(u);
  });
}

export function stopSpeaking() {
  if (canSpeak()) window.speechSynthesis.cancel();
  if (current) {
    current.pause();
    current = null;
  }
}

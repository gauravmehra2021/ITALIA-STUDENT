import { useCallback, useEffect, useRef, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { learnApi, setApiMessages } from '../services/api';
import { LANGUAGES, apiFromCode, codeFromApi, useI18n, type LangCode } from '.';
import './language.css';

/**
 * Changes the portal language: immediately on screen and on this device, and — when
 * the student is signed in — on their profile, so it follows them to other devices.
 */
export function useLanguageChoice() {
  const { lang, setLang } = useI18n();
  const { user, updateUser } = useAuth();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(false);

  const choose = useCallback(
    async (code: LangCode) => {
      setLang(code);
      setError(false);
      if (!user) return true;
      setSaving(true);
      try {
        const saved = await learnApi.setLanguage(apiFromCode(code));
        updateUser({ preferredLanguage: saved });
        return true;
      } catch {
        setError(true);
        return false;
      } finally {
        setSaving(false);
      }
    },
    [setLang, user, updateUser],
  );

  return { lang, choose, saving, error };
}

/**
 * Keeps the screen language and the profile in step after sign-in:
 * a language saved on the profile wins; if the profile still has the default (English)
 * but the student picked another language on this device, that choice is saved.
 */
export function LanguageSync() {
  const { user, updateUser } = useAuth();
  const { lang, setLang, t } = useI18n();
  const synced = useRef<string | null>(null);

  useEffect(() => {
    setApiMessages({ network: t('common.networkError') });
  }, [t]);

  useEffect(() => {
    if (!user || synced.current === user.id) return;
    synced.current = user.id;
    const profile = codeFromApi(user.preferredLanguage);
    if (profile && profile !== 'en') {
      if (profile !== lang) setLang(profile);
    } else if (lang !== 'en') {
      learnApi.setLanguage(apiFromCode(lang))
        .then((saved) => updateUser({ preferredLanguage: saved }))
        .catch(() => undefined);
    }
  }, [user, lang, setLang, updateUser]);

  return null;
}

/** Big, friendly chooser for the dashboard. */
export function LanguageCard() {
  const { t } = useI18n();
  const { lang, choose, saving, error } = useLanguageChoice();
  const [justSaved, setJustSaved] = useState(false);

  async function pick(code: LangCode) {
    if (code === lang) return;
    setJustSaved(false);
    if (await choose(code)) {
      setJustSaved(true);
      window.setTimeout(() => setJustSaved(false), 2500);
    }
  }

  return (
    <section className="card card-pad lang-card" aria-labelledby="lang-card-title">
      <div className="lang-card-head">
        <span className="lang-card-icon" aria-hidden>🌐</span>
        <div>
          <h2 id="lang-card-title">{t('language.choose')}</h2>
          <p className="muted small">{t('language.help')}</p>
        </div>
      </div>
      <div className="lang-options" role="radiogroup" aria-label={t('language.choose')}>
        {LANGUAGES.map((l) => (
          <button
            key={l.code}
            type="button"
            role="radio"
            aria-checked={lang === l.code}
            className={`lang-option ${lang === l.code ? 'active' : ''}`}
            onClick={() => void pick(l.code)}
            disabled={saving}
            lang={l.htmlLang}
            dir={l.dir}
          >
            <strong>{l.label}</strong>
            <span>{l.hello}</span>
          </button>
        ))}
      </div>
      {justSaved && <p className="lang-status ok small" role="status">✓ {t('language.saved')}</p>}
      {error && <p className="lang-status warn small" role="status">{t('language.saveError')}</p>}
    </section>
  );
}

/** Compact chooser for the header menu and the sign-in page. */
export function LanguageSelect({ className = '' }: { className?: string }) {
  const { t } = useI18n();
  const { lang, choose, saving } = useLanguageChoice();
  return (
    <label className={`lang-select ${className}`}>
      <span aria-hidden>🌐</span>
      <span className="sr-only">{t('language.title')}</span>
      <select value={lang} onChange={(e) => void choose(e.target.value as LangCode)} disabled={saving} aria-label={t('language.title')}>
        {LANGUAGES.map((l) => (
          <option key={l.code} value={l.code}>{l.label}</option>
        ))}
      </select>
    </label>
  );
}

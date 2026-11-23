import { useState, type FormEvent } from 'react';
import { useAuth } from '../hooks/useAuth';
import { authApi } from '../services/api';
import { Logo } from '../components/ui';
import { Icon } from '../components/Icons';
import { useI18n } from '../i18n';
import { LanguageSelect } from '../i18n/LanguagePicker';
import './login.css';

// The temporary password typed on the login page, kept in memory only (never stored),
// so the student doesn't have to type it twice. After a page reload we ask for it again.
let temporaryPassword: string | null = null;
export function rememberTemporaryPassword(value: string) {
  temporaryPassword = value;
}

/**
 * Shown instead of the portal when the student signed in with a temporary password
 * from the team (account created in the admin panel, or password reset by the team).
 */
export function ChangePasswordPage() {
  const { user, updateUser, logout } = useAuth();
  const { t } = useI18n();
  const [current, setCurrent] = useState(temporaryPassword ?? '');
  const [next, setNext] = useState('');
  const [repeat, setRepeat] = useState('');
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const askCurrent = temporaryPassword === null;

  async function submit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    if (next !== repeat) {
      setError(t('login.pwMismatch'));
      return;
    }
    setBusy(true);
    try {
      const saved = await authApi.changePassword(current, next);
      temporaryPassword = null;
      updateUser({ mustChangePassword: saved.mustChangePassword ?? false });
    } catch (err) {
      setError(err instanceof Error ? err.message : t('login.error'));
      setBusy(false);
    }
  }

  const type = show ? 'text' : 'password';

  return (
    <div className="auth auth-single">
      <section className="auth-panel">
        <div className="auth-lang"><LanguageSelect /></div>
        <div className="auth-card">
          <div className="auth-mobile-logo" style={{ display: 'flex' }}><Logo size={48} /></div>
          <div className="auth-head">
            <h2>{t('login.firstTitle')}</h2>
            <p>{t('login.firstSub')}</p>
          </div>

          {error && <div className="alert alert-error" role="alert">{error}</div>}

          <form onSubmit={submit} className="stack">
            <div className="field">
              <label htmlFor="cp-email">{t('login.email')}</label>
              <input id="cp-email" className="input" value={user?.email ?? ''} readOnly autoComplete="username" />
            </div>
            {askCurrent && (
              <div className="field">
                <label htmlFor="cp-current">{t('login.tempPassword')}</label>
                <input id="cp-current" className="input" type={type} value={current} onChange={(e) => setCurrent(e.target.value)} required autoComplete="current-password" />
              </div>
            )}
            <div className="field">
              <label htmlFor="cp-new">{t('login.newPassword')}</label>
              <div className="password-wrap">
                <input id="cp-new" className="input" type={type} value={next} onChange={(e) => setNext(e.target.value)} required minLength={8} autoComplete="new-password" placeholder={t('login.pwRule')} />
                <button type="button" className="password-toggle" onClick={() => setShow((v) => !v)} aria-label={show ? t('login.hidePassword') : t('login.showPassword')}>
                  <Icon.Eye size={18} />
                </button>
              </div>
            </div>
            <div className="field">
              <label htmlFor="cp-repeat">{t('login.repeatPassword')}</label>
              <input id="cp-repeat" className="input" type={type} value={repeat} onChange={(e) => setRepeat(e.target.value)} required minLength={8} autoComplete="new-password" />
            </div>
            <button className="btn btn-primary btn-lg btn-block" disabled={busy}>{busy ? t('login.savingPw') : t('login.savePassword')}</button>
            <button type="button" className="link-btn center" onClick={() => void logout()}>{t('nav.signOut')}</button>
          </form>
        </div>
      </section>
    </div>
  );
}

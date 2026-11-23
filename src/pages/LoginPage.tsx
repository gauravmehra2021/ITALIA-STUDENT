import { useState, type FormEvent } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { authApi } from '../services/api';
import { Logo } from '../components/ui';
import { Icon } from '../components/Icons';
import { apiFromCode, useI18n } from '../i18n';
import { LanguageSelect } from '../i18n/LanguagePicker';
import './login.css';

type Mode = 'login' | 'register' | 'forgot' | 'reset' | 'otp';

const TITLE: Record<Mode, string> = {
  login: 'login.titleLogin',
  register: 'login.titleRegister',
  forgot: 'login.titleForgot',
  reset: 'login.titleReset',
  otp: 'login.titleOtp',
};

const SUBTITLE: Record<Mode, string> = {
  login: 'login.subLogin',
  register: 'login.subRegister',
  forgot: 'login.subForgot',
  reset: 'login.subReset',
  otp: 'login.subOtp',
};

export function LoginPage() {
  const { user, login, register, verifyOtp } = useAuth();
  const { t, lang } = useI18n();
  const navigate = useNavigate();
  const [mode, setMode] = useState<Mode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [code, setCode] = useState('');
  const [challengeId, setChallengeId] = useState<string | null>(null);
  const [pendingUserId, setPendingUserId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  if (user) return <Navigate to="/" replace />;

  function go(next: Mode) {
    setMode(next);
    setError(null);
    setInfo(null);
  }

  async function run(action: () => Promise<void>) {
    setBusy(true);
    setError(null);
    try {
      await action();
    } catch (e) {
      setError(e instanceof Error ? e.message : t('login.error'));
    } finally {
      setBusy(false);
    }
  }

  const onLogin = (e: FormEvent) => {
    e.preventDefault();
    void run(async () => {
      const res = await login(email, password);
      if (res.requiresOtp && res.pendingUserId) {
        setPendingUserId(res.pendingUserId);
        go('otp');
        setInfo(t('login.otpSent'));
        return;
      }
      navigate('/');
    });
  };

  const onRegister = (e: FormEvent) => {
    e.preventDefault();
    void run(async () => {
      await register({ email, password, firstName: firstName.trim(), lastName: lastName.trim(), preferredLanguage: apiFromCode(lang) });
      navigate('/courses');
    });
  };

  const onForgot = (e: FormEvent) => {
    e.preventDefault();
    void run(async () => {
      const res = await authApi.forgotPassword(email.trim());
      setChallengeId(res.challengeId);
      go('reset');
      setInfo(t('login.resetSent'));
    });
  };

  const onReset = (e: FormEvent) => {
    e.preventDefault();
    if (!challengeId) return;
    void run(async () => {
      await authApi.resetPassword({ challengeId, code: code.trim(), newPassword: password });
      go('login');
      setCode('');
      setInfo(t('login.pwChanged'));
    });
  };

  const onOtp = (e: FormEvent) => {
    e.preventDefault();
    if (!pendingUserId) return;
    void run(async () => {
      await verifyOtp(pendingUserId, code.trim());
      navigate('/');
    });
  };

  const passwordField = (labelKey: string, autoComplete: string) => (
    <div className="field">
      <label htmlFor="password">{t(labelKey)}</label>
      <div className="password-wrap">
        <input
          id="password"
          className="input"
          type={showPassword ? 'text' : 'password'}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={mode === 'login' ? undefined : 8}
          autoComplete={autoComplete}
          placeholder={mode === 'login' ? t('login.yourPassword') : t('login.minChars')}
        />
        <button type="button" className="password-toggle" onClick={() => setShowPassword((v) => !v)} aria-label={showPassword ? t('login.hidePassword') : t('login.showPassword')}>
          <Icon.Eye size={18} />
        </button>
      </div>
    </div>
  );

  const emailField = (autoComplete = 'email', placeholder = 'you@example.com') => (
    <div className="field">
      <label htmlFor="email">{t('login.email')}</label>
      <input id="email" className="input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete={autoComplete} placeholder={placeholder} />
    </div>
  );

  const codeField = (
    <div className="field">
      <label htmlFor="code">{t('login.code')}</label>
      <input id="code" className="input code-input" inputMode="numeric" maxLength={6} value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))} required autoComplete="one-time-code" />
    </div>
  );

  return (
    <div className="auth">
      <section className="auth-hero" aria-hidden>
        <div className="auth-hero-overlay" />
        <div className="auth-hero-content">
          <Logo size={56} light />
          <div>
            <h1>{t('login.heroTitle')}</h1>
            <p>{t('login.heroText')}</p>
          </div>
          <ul className="auth-points">
            <li><span>📸</span> {t('login.point1')}</li>
            <li><span>🎥</span> {t('login.point2')}</li>
            <li><span>🏅</span> {t('login.point3')}</li>
          </ul>
          <div className="auth-flag"><span /><span /><span /></div>
        </div>
      </section>

      <section className="auth-panel">
        <div className="auth-lang"><LanguageSelect /></div>
        <div className="auth-card">
          <div className="auth-mobile-logo"><Logo size={48} /></div>

          {(mode === 'login' || mode === 'register') && (
            <div className="auth-tabs" role="tablist">
              <button role="tab" aria-selected={mode === 'login'} className={mode === 'login' ? 'active' : ''} onClick={() => go('login')}>{t('login.signIn')}</button>
              <button role="tab" aria-selected={mode === 'register'} className={mode === 'register' ? 'active' : ''} onClick={() => go('register')}>{t('login.createAccount')}</button>
            </div>
          )}

          <div className="auth-head">
            <h2>{t(TITLE[mode])}</h2>
            <p>{t(SUBTITLE[mode])}</p>
          </div>

          {error && <div className="alert alert-error" role="alert">{error}</div>}
          {info && <div className="alert alert-success" role="status">{info}</div>}

          {mode === 'login' && (
            <form onSubmit={onLogin} className="stack">
              {emailField()}
              {passwordField('login.password', 'current-password')}
              <button type="button" className="link-btn" onClick={() => go('forgot')}>{t('login.forgot')}</button>
              <button className="btn btn-primary btn-lg btn-block" disabled={busy}>{busy ? t('login.signingIn') : t('login.signIn')}</button>
            </form>
          )}

          {mode === 'register' && (
            <form onSubmit={onRegister} className="stack">
              <div className="auth-row">
                <div className="field">
                  <label htmlFor="first">{t('login.firstName')}</label>
                  <input id="first" className="input" value={firstName} onChange={(e) => setFirstName(e.target.value)} required autoComplete="given-name" />
                </div>
                <div className="field">
                  <label htmlFor="last">{t('login.surname')}</label>
                  <input id="last" className="input" value={lastName} onChange={(e) => setLastName(e.target.value)} required autoComplete="family-name" />
                </div>
              </div>
              {emailField()}
              {passwordField('login.password', 'new-password')}
              <button className="btn btn-success btn-lg btn-block" disabled={busy}>{busy ? t('login.creating') : t('login.createAccount')}</button>
              <p className="muted small" style={{ textAlign: 'center' }}>{t('login.sameAccount')}</p>
            </form>
          )}

          {mode === 'forgot' && (
            <form onSubmit={onForgot} className="stack">
              {emailField('email', '')}
              <button className="btn btn-primary btn-lg btn-block" disabled={busy}>{busy ? t('login.sending') : t('login.sendCode')}</button>
              <button type="button" className="link-btn center" onClick={() => go('login')}>{t('login.back')}</button>
            </form>
          )}

          {mode === 'reset' && (
            <form onSubmit={onReset} className="stack">
              {codeField}
              {passwordField('login.newPassword', 'new-password')}
              <button className="btn btn-primary btn-lg btn-block" disabled={busy}>{busy ? t('login.savingPw') : t('login.changePassword')}</button>
              <button type="button" className="link-btn center" onClick={() => go('login')}>{t('login.back')}</button>
            </form>
          )}

          {mode === 'otp' && (
            <form onSubmit={onOtp} className="stack">
              {codeField}
              <button className="btn btn-primary btn-lg btn-block" disabled={busy}>{busy ? t('login.checking') : t('login.verify')}</button>
              <button type="button" className="link-btn center" onClick={() => go('login')}>{t('login.back')}</button>
            </form>
          )}
        </div>
        <p className="auth-foot">© SS Europa — Sostegno e Soluzioni per l'Europa</p>
      </section>
    </div>
  );
}

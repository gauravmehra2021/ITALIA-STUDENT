import { useState, type FormEvent } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { authApi } from '../services/api';
import { Logo } from '../components/ui';
import { Icon } from '../components/Icons';
import './login.css';

type Mode = 'login' | 'register' | 'forgot' | 'reset' | 'otp';

export function LoginPage() {
  const { user, login, register, verifyOtp } = useAuth();
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
      setError(e instanceof Error ? e.message : 'Something went wrong. Please try again.');
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
        setInfo('We sent a 6-digit code to your email.');
        return;
      }
      navigate('/');
    });
  };

  const onRegister = (e: FormEvent) => {
    e.preventDefault();
    void run(async () => {
      await register({ email, password, firstName: firstName.trim(), lastName: lastName.trim() });
      navigate('/courses');
    });
  };

  const onForgot = (e: FormEvent) => {
    e.preventDefault();
    void run(async () => {
      const res = await authApi.forgotPassword(email.trim());
      setChallengeId(res.challengeId);
      go('reset');
      setInfo('If this email has an account, we sent a 6-digit code to it.');
    });
  };

  const onReset = (e: FormEvent) => {
    e.preventDefault();
    if (!challengeId) return;
    void run(async () => {
      await authApi.resetPassword({ challengeId, code: code.trim(), newPassword: password });
      go('login');
      setCode('');
      setInfo('Your password has been changed. You can sign in now.');
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

  const title = {
    login: 'Welcome back',
    register: 'Create your free account',
    forgot: 'Forgot your password?',
    reset: 'Choose a new password',
    otp: 'Check your email',
  }[mode];

  const subtitle = {
    login: 'Sign in to continue learning Italian.',
    register: 'Start learning Italian today — it takes one minute.',
    forgot: 'Enter your email and we\'ll send you a code to reset it.',
    reset: 'Enter the code from the email and your new password.',
    otp: 'Enter the 6-digit code we sent you.',
  }[mode];

  const passwordField = (label: string, autoComplete: string) => (
    <div className="field">
      <label htmlFor="password">{label}</label>
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
          placeholder={mode === 'login' ? 'Your password' : 'At least 8 characters'}
        />
        <button type="button" className="password-toggle" onClick={() => setShowPassword((v) => !v)} aria-label={showPassword ? 'Hide password' : 'Show password'}>
          <Icon.Eye size={18} />
        </button>
      </div>
    </div>
  );

  return (
    <div className="auth">
      <section className="auth-hero" aria-hidden>
        <div className="auth-hero-overlay" />
        <div className="auth-hero-content">
          <Logo size={56} light />
          <div>
            <h1>Learn the Italian you need for life in Italy.</h1>
            <p>Short lessons with pictures and audio, live classes with real teachers, and a course built for work, study and everyday life.</p>
          </div>
          <ul className="auth-points">
            <li><span>📸</span> Words with pictures & native audio</li>
            <li><span>🎥</span> Weekly live speaking classes</li>
            <li><span>🏅</span> Prepare for the CILS A1 & A2 exams</li>
          </ul>
          <div className="auth-flag"><span /><span /><span /></div>
        </div>
      </section>

      <section className="auth-panel">
        <div className="auth-card">
          <div className="auth-mobile-logo"><Logo size={48} /></div>

          {(mode === 'login' || mode === 'register') && (
            <div className="auth-tabs" role="tablist">
              <button role="tab" aria-selected={mode === 'login'} className={mode === 'login' ? 'active' : ''} onClick={() => go('login')}>Sign in</button>
              <button role="tab" aria-selected={mode === 'register'} className={mode === 'register' ? 'active' : ''} onClick={() => go('register')}>Create account</button>
            </div>
          )}

          <div className="auth-head">
            <h2>{title}</h2>
            <p>{subtitle}</p>
          </div>

          {error && <div className="alert alert-error" role="alert">{error}</div>}
          {info && <div className="alert alert-success" role="status">{info}</div>}

          {mode === 'login' && (
            <form onSubmit={onLogin} className="stack">
              <div className="field">
                <label htmlFor="email">Email</label>
                <input id="email" className="input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" placeholder="you@example.com" />
              </div>
              {passwordField('Password', 'current-password')}
              <button type="button" className="link-btn" onClick={() => go('forgot')}>Forgot password?</button>
              <button className="btn btn-primary btn-lg btn-block" disabled={busy}>{busy ? 'Signing in…' : 'Sign in'}</button>
            </form>
          )}

          {mode === 'register' && (
            <form onSubmit={onRegister} className="stack">
              <div className="auth-row">
                <div className="field">
                  <label htmlFor="first">First name</label>
                  <input id="first" className="input" value={firstName} onChange={(e) => setFirstName(e.target.value)} required autoComplete="given-name" />
                </div>
                <div className="field">
                  <label htmlFor="last">Surname</label>
                  <input id="last" className="input" value={lastName} onChange={(e) => setLastName(e.target.value)} required autoComplete="family-name" />
                </div>
              </div>
              <div className="field">
                <label htmlFor="email">Email</label>
                <input id="email" className="input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" placeholder="you@example.com" />
              </div>
              {passwordField('Password', 'new-password')}
              <button className="btn btn-success btn-lg btn-block" disabled={busy}>{busy ? 'Creating your account…' : 'Create account'}</button>
              <p className="muted small" style={{ textAlign: 'center' }}>The same account works on the website and in the SS Europa app.</p>
            </form>
          )}

          {mode === 'forgot' && (
            <form onSubmit={onForgot} className="stack">
              <div className="field">
                <label htmlFor="email">Email</label>
                <input id="email" className="input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" />
              </div>
              <button className="btn btn-primary btn-lg btn-block" disabled={busy}>{busy ? 'Sending…' : 'Send code'}</button>
              <button type="button" className="link-btn center" onClick={() => go('login')}>← Back to sign in</button>
            </form>
          )}

          {mode === 'reset' && (
            <form onSubmit={onReset} className="stack">
              <div className="field">
                <label htmlFor="code">6-digit code</label>
                <input id="code" className="input code-input" inputMode="numeric" maxLength={6} value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))} required autoComplete="one-time-code" />
              </div>
              {passwordField('New password', 'new-password')}
              <button className="btn btn-primary btn-lg btn-block" disabled={busy}>{busy ? 'Saving…' : 'Change password'}</button>
              <button type="button" className="link-btn center" onClick={() => go('login')}>← Back to sign in</button>
            </form>
          )}

          {mode === 'otp' && (
            <form onSubmit={onOtp} className="stack">
              <div className="field">
                <label htmlFor="code">6-digit code</label>
                <input id="code" className="input code-input" inputMode="numeric" maxLength={6} value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))} required autoComplete="one-time-code" />
              </div>
              <button className="btn btn-primary btn-lg btn-block" disabled={busy}>{busy ? 'Checking…' : 'Verify and continue'}</button>
              <button type="button" className="link-btn center" onClick={() => go('login')}>← Back to sign in</button>
            </form>
          )}
        </div>
        <p className="auth-foot">© SS Europa — Sostegno e Soluzioni per l'Europa</p>
      </section>
    </div>
  );
}

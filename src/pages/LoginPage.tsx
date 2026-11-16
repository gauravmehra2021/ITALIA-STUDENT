import type { FormEvent } from 'react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ErrorBox, SuccessBox } from '../components/StateBlock';
import { useAuth } from '../hooks/useAuth';
import { authApi } from '../services/api';

export function LoginPage() {
  const { login, register, verifyOtp, loading } = useAuth();
  const navigate = useNavigate();

  const [mode, setMode] = useState<'login' | 'register' | 'otp' | 'forgot' | 'reset'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [pendingUserId, setPendingUserId] = useState<string | null>(null);
  const [demoOtpHint, setDemoOtpHint] = useState<string | null>(null);

  // Forgot password state
  const [forgotEmail, setForgotEmail] = useState('');
  const [resetChallengeId, setResetChallengeId] = useState<string | null>(null);
  const [resetCode, setResetCode] = useState('');
  const [newPassword, setNewPassword] = useState('');

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  function fillDemoStudent() {
    setEmail('student@sseuropa.demo');
    setPassword('Demo@12345');
    setError(null);
    setSuccess('Demo credentials filled. Click "Sign In" to continue!');
  }

  async function handleLogin(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    try {
      const res = await login(email.trim(), password);
      if (res.requiresOtp && res.pendingUserId) {
        setPendingUserId(res.pendingUserId);
        setDemoOtpHint(res.demoOtpHint ?? null);
        setMode('otp');
        setSuccess('Verification code sent to your email. Enter OTP below to continue.');
        return;
      }
      navigate('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Invalid email or password.');
    }
  }

  async function handleRegister(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    try {
      const user = await register({
        fullName: fullName.trim(),
        email: email.trim(),
        password,
      });
      setPendingUserId(user.id);
      setMode('otp');
      setSuccess('Account created! Verification code sent to your email via Brevo.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed. Email might already be taken.');
    }
  }

  async function handleVerifyOtp(e: FormEvent) {
    e.preventDefault();
    if (!pendingUserId) return;
    setError(null);
    try {
      await verifyOtp(pendingUserId, otpCode.trim());
      navigate('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Invalid or expired OTP code.');
    }
  }

  async function handleForgotPassword(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    try {
      const res = await authApi.forgotPassword(forgotEmail.trim());
      setResetChallengeId(res.challengeId);
      setMode('reset');
      setSuccess('Reset code sent to your email. Enter 6-digit code and new password.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not request password reset.');
    }
  }

  async function handleResetPassword(e: FormEvent) {
    e.preventDefault();
    if (!resetChallengeId) return;
    setError(null);
    setSuccess(null);
    try {
      await authApi.resetPassword({
        challengeId: resetChallengeId,
        code: resetCode.trim(),
        newPassword,
      });
      setMode('login');
      setEmail(forgotEmail);
      setPassword(newPassword);
      setSuccess('Password updated successfully! Sign in with your new password.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Password reset failed.');
    }
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #083c4d 0%, #0D5C75 50%, #0077b6 100%)', padding: '1.5rem' }}>
      <div style={{ width: '100%', maxWidth: '440px', background: '#ffffff', borderRadius: '16px', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2), 0 10px 10px -5px rgba(0, 0, 0, 0.1)', overflow: 'hidden' }}>
        
        {/* Header */}
        <div style={{ background: '#ffffff', padding: '2rem 2rem 1.25rem 2rem', textAlign: 'center', borderBottom: '1px solid #f1f5f9' }}>
          <img
            src="/images/updated-logo.png"
            alt="SS EUROPA"
            style={{ height: '54px', width: 'auto', margin: '0 auto 10px', display: 'block', objectFit: 'contain' }}
          />
          <p style={{ color: 'var(--muted)', fontSize: '0.88rem', margin: '0', fontWeight: 600 }}>Official Student Learning Portal</p>
        </div>

        <div style={{ padding: '1.75rem 2rem 2rem' }}>
          {error && <ErrorBox message={error} />}
          {success && <SuccessBox message={success} />}

          {/* Quick Demo Fill Button */}
          {mode === 'login' && (
            <button
              type="button"
              className="btn btn-secondary"
              onClick={fillDemoStudent}
              style={{ width: '100%', marginBottom: '1.25rem', borderColor: 'var(--accent)', background: '#fffbeb', color: '#92400e', fontSize: '0.88rem' }}
            >
              ⚡ Fill Demo Student (student@sseuropa.demo)
            </button>
          )}

          {/* LOGIN FORM */}
          {mode === 'login' && (
            <form onSubmit={handleLogin}>
              <div className="field">
                <label>Email Address</label>
                <input
                  type="email"
                  placeholder="student@sseuropa.demo"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="field">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <label>Password</label>
                  <button
                    type="button"
                    onClick={() => { setMode('forgot'); setForgotEmail(email); setError(null); setSuccess(null); }}
                    style={{ background: 'none', border: 'none', color: 'var(--azure)', fontSize: '0.8rem', padding: 0 }}
                  >
                    Forgot password?
                  </button>
                </div>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              <button className="btn btn-primary" type="submit" disabled={loading} style={{ width: '100%', marginTop: '0.5rem' }}>
                {loading ? 'Signing in…' : 'Sign In to Portal'}
              </button>

              <div style={{ marginTop: '1.25rem', textAlign: 'center', fontSize: '0.88rem', color: 'var(--muted)' }}>
                New student?{' '}
                <button
                  type="button"
                  onClick={() => { setMode('register'); setError(null); setSuccess(null); }}
                  style={{ background: 'none', border: 'none', color: 'var(--primary)', fontWeight: 700, cursor: 'pointer' }}
                >
                  Create Account
                </button>
              </div>
            </form>
          )}

          {/* REGISTER FORM */}
          {mode === 'register' && (
            <form onSubmit={handleRegister}>
              <div className="field">
                <label>Full Name</label>
                <input
                  placeholder="Marco Rossi"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                />
              </div>

              <div className="field">
                <label>Email Address</label>
                <input
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="field">
                <label>Choose Password</label>
                <input
                  type="password"
                  placeholder="Minimum 6 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                />
              </div>

              <button className="btn btn-primary" type="submit" disabled={loading} style={{ width: '100%', marginTop: '0.5rem' }}>
                {loading ? 'Creating account…' : 'Register & Receive Code'}
              </button>

              <div style={{ marginTop: '1.25rem', textAlign: 'center', fontSize: '0.88rem', color: 'var(--muted)' }}>
                Already registered?{' '}
                <button
                  type="button"
                  onClick={() => { setMode('login'); setError(null); setSuccess(null); }}
                  style={{ background: 'none', border: 'none', color: 'var(--primary)', fontWeight: 700, cursor: 'pointer' }}
                >
                  Sign In
                </button>
              </div>
            </form>
          )}

          {/* OTP VERIFICATION */}
          {mode === 'otp' && (
            <form onSubmit={handleVerifyOtp}>
              <p style={{ fontSize: '0.88rem', color: 'var(--muted)', marginBottom: '1rem' }}>
                Enter the 6-digit code sent to your registered email to activate your student workspace.
              </p>
              {demoOtpHint && <SuccessBox message={`Demo verification code: ${demoOtpHint}`} />}

              <div className="field">
                <label>Verification Code (OTP)</label>
                <input
                  placeholder="123456"
                  maxLength={6}
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value)}
                  required
                  style={{ textAlign: 'center', fontSize: '1.25rem', letterSpacing: '4px' }}
                />
              </div>

              <button className="btn btn-primary" type="submit" disabled={loading} style={{ width: '100%', marginTop: '0.5rem' }}>
                {loading ? 'Verifying…' : 'Verify & Enter Workspace'}
              </button>

              <div style={{ marginTop: '1rem', textAlign: 'center' }}>
                <button
                  type="button"
                  onClick={() => { setMode('login'); setError(null); }}
                  style={{ background: 'none', border: 'none', color: 'var(--muted)', fontSize: '0.85rem', cursor: 'pointer' }}
                >
                  Back to login
                </button>
              </div>
            </form>
          )}

          {/* FORGOT PASSWORD */}
          {mode === 'forgot' && (
            <form onSubmit={handleForgotPassword}>
              <p style={{ fontSize: '0.88rem', color: 'var(--muted)', marginBottom: '1rem' }}>
                Enter your email address and we'll send you a password reset verification code.
              </p>

              <div className="field">
                <label>Registered Email</label>
                <input
                  type="email"
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  required
                />
              </div>

              <button className="btn btn-primary" type="submit" disabled={loading} style={{ width: '100%', marginTop: '0.5rem' }}>
                {loading ? 'Sending code…' : 'Send Reset Code'}
              </button>

              <div style={{ marginTop: '1rem', textAlign: 'center' }}>
                <button
                  type="button"
                  onClick={() => setMode('login')}
                  style={{ background: 'none', border: 'none', color: 'var(--muted)', fontSize: '0.85rem' }}
                >
                  Back to login
                </button>
              </div>
            </form>
          )}

          {/* RESET PASSWORD */}
          {mode === 'reset' && (
            <form onSubmit={handleResetPassword}>
              <div className="field">
                <label>6-Digit Reset Code</label>
                <input
                  placeholder="123456"
                  maxLength={6}
                  value={resetCode}
                  onChange={(e) => setResetCode(e.target.value)}
                  required
                />
              </div>

              <div className="field">
                <label>New Strong Password</label>
                <input
                  type="password"
                  placeholder="Minimum 6 characters"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  minLength={6}
                />
              </div>

              <button className="btn btn-primary" type="submit" disabled={loading} style={{ width: '100%', marginTop: '0.5rem' }}>
                {loading ? 'Updating password…' : 'Save New Password & Sign In'}
              </button>
            </form>
          )}

        </div>
      </div>
    </div>
  );
}


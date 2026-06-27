import { useState, useEffect } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { Lock, User, Mail } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../api';

export default function Login() {
  const { account, login } = useAuth();
  const navigate = useNavigate();

  const [mode, setMode] = useState('login'); // login | request-reset | confirm-reset
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [devCode, setDevCode] = useState('');
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    // If no controller account exists yet, send first-time visitors to setup
    // instead of a login form they can't possibly use.
    api
      .checkSetupStatus()
      .then((res) => {
        if (res.needs_setup) navigate('/setup', { replace: true });
      })
      .catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (account) return <Navigate to="/" replace />;

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await login(username, password);
      navigate('/');
    } catch (err) {
      setError(err.message || 'Invalid username or password');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRequestReset = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const result = await api.requestPasswordReset(email);
      setInfo(result.message);
      // dev_code is only present because no email service is connected yet -
      // it lets you test the reset flow today; remove once email sending is wired up.
      if (result.dev_code) setDevCode(result.dev_code);
      setMode('confirm-reset');
    } catch (err) {
      setError(err.message || 'Could not request a reset code.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleConfirmReset = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await api.confirmPasswordReset(email, code, newPassword);
      setInfo('Password updated. You can now log in.');
      setMode('login');
      setPassword('');
    } catch (err) {
      setError(err.message || 'Could not reset password.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card fade-in">
        <div className="auth-brand">
          <span className="brand-mark">GS</span>
          <div>
            <p className="brand-title">GS Hotel</p>
            <p className="brand-sub">Controller Panel</p>
          </div>
        </div>

        {mode === 'login' && (
          <form onSubmit={handleLogin}>
            <label className="field">
              <span><User size={14} /> Username</span>
              <input value={username} onChange={(e) => setUsername(e.target.value)} required />
            </label>
            <label className="field">
              <span><Lock size={14} /> Password</span>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
            </label>

            {error && <p className="field-error">{error}</p>}

            <button className="btn btn-primary auth-submit" disabled={submitting}>
              {submitting ? 'Signing in…' : 'Sign in'}
            </button>

            <button type="button" className="auth-link" onClick={() => { setMode('request-reset'); setError(''); }}>
              Forgot your password?
            </button>
          </form>
        )}

        {mode === 'request-reset' && (
          <form onSubmit={handleRequestReset}>
            <p className="auth-hint">Enter the email linked to your account and we'll send a reset code.</p>
            <label className="field">
              <span><Mail size={14} /> Email</span>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </label>

            {error && <p className="field-error">{error}</p>}

            <button className="btn btn-primary auth-submit" disabled={submitting}>
              {submitting ? 'Sending…' : 'Send reset code'}
            </button>

            <button type="button" className="auth-link" onClick={() => { setMode('login'); setError(''); }}>
              Back to sign in
            </button>
          </form>
        )}

        {mode === 'confirm-reset' && (
          <form onSubmit={handleConfirmReset}>
            <p className="auth-hint">{info}</p>
            {devCode && (
              <p className="auth-dev-code">
                No email service is connected yet, so here's your code directly: <strong>{devCode}</strong>
              </p>
            )}
            <label className="field">
              <span>Reset code</span>
              <input value={code} onChange={(e) => setCode(e.target.value)} required />
            </label>
            <label className="field">
              <span><Lock size={14} /> New password</span>
              <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required minLength={8} />
            </label>

            {error && <p className="field-error">{error}</p>}

            <button className="btn btn-primary auth-submit" disabled={submitting}>
              {submitting ? 'Saving…' : 'Reset password'}
            </button>

            <button type="button" className="auth-link" onClick={() => { setMode('login'); setError(''); }}>
              Back to sign in
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

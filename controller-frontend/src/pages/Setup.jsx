import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, User, Mail, Lock } from 'lucide-react';
import { api } from '../api';
import { useAuth } from '../context/AuthContext';

export default function Setup() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [checking, setChecking] = useState(true);
  const [allowed, setAllowed] = useState(false);

  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    api
      .checkSetupStatus()
      .then((res) => {
        if (!res.needs_setup) {
          // A controller already exists - this page is no longer usable.
          navigate('/login', { replace: true });
        } else {
          setAllowed(true);
        }
      })
      .catch(() => setAllowed(true)) // fail open to the form rather than locking the owner out
      .finally(() => setChecking(false));
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }

    setSubmitting(true);
    try {
      await api.bootstrapController({ username, email, password, full_name: fullName });
      // Log straight in with the account we just created
      await login(username, password);
      navigate('/', { replace: true });
    } catch (err) {
      setError(err.message || 'Could not complete setup.');
    } finally {
      setSubmitting(false);
    }
  };

  if (checking) return null;
  if (!allowed) return null;

  return (
    <div className="auth-page">
      <div className="auth-card fade-in">
        <div className="auth-brand">
          <span className="brand-mark">GS</span>
          <div>
            <p className="brand-title">GS Hotel</p>
            <p className="brand-sub">First-time setup</p>
          </div>
        </div>

        <p className="auth-hint">
          <ShieldCheck size={14} style={{ verticalAlign: 'middle', marginRight: 6 }} />
          This page creates the very first Controller account for GS Hotel. It only works
          once — after this, new staff accounts are created from inside the Controller panel.
        </p>

        <form onSubmit={handleSubmit}>
          <label className="field">
            <span><User size={14} /> Username</span>
            <input value={username} onChange={(e) => setUsername(e.target.value)} required />
          </label>
          <label className="field">
            <span><User size={14} /> Full name</span>
            <input value={fullName} onChange={(e) => setFullName(e.target.value)} />
          </label>
          <label className="field">
            <span><Mail size={14} /> Email</span>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </label>
          <label className="field">
            <span><Lock size={14} /> Password</span>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              minLength={8}
              required
            />
          </label>
          <label className="field">
            <span><Lock size={14} /> Confirm password</span>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              minLength={8}
              required
            />
          </label>

          {error && <p className="field-error">{error}</p>}

          <button className="btn btn-primary auth-submit" disabled={submitting}>
            {submitting ? 'Creating account…' : 'Create controller account'}
          </button>
        </form>
      </div>
    </div>
  );
}

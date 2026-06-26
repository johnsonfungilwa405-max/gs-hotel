import { useState } from 'react';
import { UserRound, Phone, Mail, Lock, LogOut } from 'lucide-react';
import { useCustomer } from '../context/CustomerContext';
import { useReveal } from '../hooks/useReveal';
import './Profile.css';

export default function Profile() {
  const { customer, identify, register, logout } = useCustomer();
  const [phone, setPhone] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mode, setMode] = useState('identify');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const containerRef = useReveal();

  const handleIdentify = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await identify(phone, name);
    } catch (err) {
      setError(err.message || 'Could not identify you. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await register({ phone_number: phone, full_name: name, email, password });
    } catch (err) {
      setError(err.message || 'Could not create your account. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoogleStub = () => {
    window.alert('Continue with Google will be available once Google sign-in is connected.');
  };

  if (customer) {
    return (
      <div ref={containerRef}>
        <section className="page-banner">
          <div className="container">
            <p className="eyebrow">Your account</p>
            <h1>Profile</h1>
          </div>
        </section>

        <section className="section">
          <div className="container profile-card-wrap">
            <div className="profile-card reveal">
              <div className="profile-avatar">
                <UserRound size={28} />
              </div>
              <h2>{customer.full_name || 'Guest'}</h2>
              <p className="profile-code">ID: {customer.customer_code}</p>

              <div className="profile-detail">
                <Phone size={16} /> {customer.phone_number}
              </div>
              {customer.email && (
                <div className="profile-detail">
                  <Mail size={16} /> {customer.email}
                </div>
              )}

              <button className="btn btn-secondary profile-logout" onClick={logout}>
                <LogOut size={15} /> Sign out
              </button>
            </div>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div ref={containerRef}>
      <section className="page-banner">
        <div className="container">
          <p className="eyebrow">Identify yourself</p>
          <h1>Profile</h1>
        </div>
      </section>

      <section className="section">
        <div className="container profile-form-wrap">
          <div className="profile-form-card reveal">
            <div className="profile-mode-switch">
              <button
                className={mode === 'identify' ? 'is-active' : ''}
                onClick={() => setMode('identify')}
              >
                Quick check-in
              </button>
              <button className={mode === 'register' ? 'is-active' : ''} onClick={() => setMode('register')}>
                Create account
              </button>
            </div>

            {mode === 'identify' ? (
              <form onSubmit={handleIdentify}>
                <p className="profile-form-hint">
                  Creating an account is optional. Enter your phone number to get a guest ID and start
                  ordering.
                </p>
                <label className="modal-field">
                  <span><Phone size={14} /> Phone number</span>
                  <input type="tel" required value={phone} onChange={(e) => setPhone(e.target.value)} />
                </label>
                <label className="modal-field">
                  <span><UserRound size={14} /> Name (optional)</span>
                  <input type="text" value={name} onChange={(e) => setName(e.target.value)} />
                </label>
                {error && <p className="modal-error">{error}</p>}
                <button className="btn btn-primary profile-submit" disabled={submitting}>
                  {submitting ? 'Please wait…' : 'Continue'}
                </button>
              </form>
            ) : (
              <form onSubmit={handleRegister}>
                <button type="button" className="btn btn-secondary google-btn" onClick={handleGoogleStub}>
                  Continue with Google
                </button>
                <div className="profile-divider">or</div>

                <label className="modal-field">
                  <span><Phone size={14} /> Phone number</span>
                  <input type="tel" required value={phone} onChange={(e) => setPhone(e.target.value)} />
                </label>
                <label className="modal-field">
                  <span><UserRound size={14} /> Full name</span>
                  <input type="text" value={name} onChange={(e) => setName(e.target.value)} />
                </label>
                <label className="modal-field">
                  <span><Mail size={14} /> Email</span>
                  <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
                </label>
                <label className="modal-field">
                  <span><Lock size={14} /> Password</span>
                  <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
                </label>
                {error && <p className="modal-error">{error}</p>}
                <button className="btn btn-primary profile-submit" disabled={submitting}>
                  {submitting ? 'Please wait…' : 'Create account'}
                </button>
              </form>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}

import { useEffect, useState } from 'react';
import { Plus, Trash2, UserPlus } from 'lucide-react';
import { api } from '../api';

export default function ManageAdmins() {
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const load = () => {
    setLoading(true);
    api.getAdmins().then(setAdmins).catch(() => setAdmins([])).finally(() => setLoading(false));
  };

  useEffect(load, []);

  const resetForm = () => {
    setUsername('');
    setEmail('');
    setFullName('');
    setPassword('');
    setError('');
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await api.createAdmin({ username, email, password, full_name: fullName });
      resetForm();
      setShowForm(false);
      load();
    } catch (err) {
      setError(err.message || 'Could not create admin account.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRemove = async (admin) => {
    if (!window.confirm(`Remove admin account "${admin.username}"? They will no longer be able to log in.`)) return;
    await api.removeAdmin(admin.id);
    load();
  };

  return (
    <div className="fade-in">
      <div className="page-head">
        <div>
          <p className="eyebrow">Staff access</p>
          <h1>Manage admins</h1>
        </div>
        <button className="btn btn-primary" onClick={() => setShowForm((s) => !s)}>
          <Plus size={16} /> {showForm ? 'Cancel' : 'New admin account'}
        </button>
      </div>

      {showForm && (
        <form className="card admin-create-form" onSubmit={handleCreate}>
          <div className="admin-form-grid">
            <label className="field">
              <span>Username</span>
              <input value={username} onChange={(e) => setUsername(e.target.value)} required />
            </label>
            <label className="field">
              <span>Email</span>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </label>
            <label className="field">
              <span>Full name</span>
              <input value={fullName} onChange={(e) => setFullName(e.target.value)} />
            </label>
            <label className="field">
              <span>Temporary password</span>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                minLength={8}
                required
              />
            </label>
          </div>

          {error && <p className="field-error">{error}</p>}

          <button className="btn btn-success" disabled={submitting}>
            <UserPlus size={16} /> {submitting ? 'Creating…' : 'Create admin account'}
          </button>
        </form>
      )}

      {loading ? (
        <p className="state-msg">Loading admin accounts…</p>
      ) : (
        <div className="card table-card">
          <table className="data-table">
            <thead>
              <tr>
                <th>Username</th>
                <th>Full name</th>
                <th>Email</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {admins.map((a) => (
                <tr key={a.id}>
                  <td className="cell-strong">{a.username}</td>
                  <td>{a.full_name || '—'}</td>
                  <td>{a.email}</td>
                  <td>{new Date(a.created_at).toLocaleDateString()}</td>
                  <td>
                    <button className="icon-btn icon-btn-danger" title="Remove admin" onClick={() => handleRemove(a)}>
                      <Trash2 size={15} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {admins.length === 0 && <p className="state-msg">No admin accounts yet — create the first one.</p>}
        </div>
      )}
    </div>
  );
}

import { useEffect, useState } from 'react';
import { Plus } from 'lucide-react';
import { api } from '../api';

export default function News() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const load = () => {
    setLoading(true);
    api.getNews().then(setPosts).catch(() => setPosts([])).finally(() => setLoading(false));
  };

  useEffect(load, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !body.trim()) return;
    setSubmitting(true);
    try {
      await api.postNews({ title, body });
      setTitle('');
      setBody('');
      load();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fade-in">
      <div className="page-head">
        <div>
          <p className="eyebrow">Communicate</p>
          <h1>News &amp; Updates</h1>
        </div>
      </div>

      <form className="card news-form" onSubmit={handleSubmit}>
        <label className="field">
          <span>Title</span>
          <input value={title} onChange={(e) => setTitle(e.target.value)} required />
        </label>
        <label className="field">
          <span>Body</span>
          <textarea rows={3} value={body} onChange={(e) => setBody(e.target.value)} required />
        </label>
        <button className="btn btn-primary" disabled={submitting}>
          <Plus size={16} /> {submitting ? 'Posting…' : 'Post update'}
        </button>
      </form>

      {loading ? (
        <p className="state-msg">Loading posts…</p>
      ) : (
        <div className="news-admin-list">
          {posts.map((p) => (
            <div key={p.id} className="card news-admin-item">
              <p className="feedback-date">{new Date(p.created_at).toLocaleDateString()}</p>
              <h3>{p.title}</h3>
              <p>{p.body}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

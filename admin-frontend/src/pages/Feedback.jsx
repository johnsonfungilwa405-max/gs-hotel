import { useEffect, useState } from 'react';
import { Send } from 'lucide-react';
import { api } from '../api';

export default function Feedback() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [drafts, setDrafts] = useState({});

  const load = () => {
    setLoading(true);
    api.getFeedback().then(setItems).catch(() => setItems([])).finally(() => setLoading(false));
  };

  useEffect(load, []);

  const handleRespond = async (id) => {
    const text = drafts[id];
    if (!text?.trim()) return;
    await api.respondFeedback(id, text);
    setDrafts((d) => ({ ...d, [id]: '' }));
    load();
  };

  return (
    <div className="fade-in">
      <div className="page-head">
        <div>
          <p className="eyebrow">Listening</p>
          <h1>Feedback</h1>
        </div>
      </div>

      {loading ? (
        <p className="state-msg">Loading feedback…</p>
      ) : items.length === 0 ? (
        <p className="state-msg">No feedback submitted yet.</p>
      ) : (
        <div className="feedback-list">
          {items.map((f) => (
            <div key={f.id} className="card feedback-item">
              <div className="feedback-meta">
                <span className="cell-strong">{f.customer_code || 'Anonymous guest'}</span>
                <span className="feedback-date">{new Date(f.created_at).toLocaleDateString()}</span>
              </div>
              <p className="feedback-message">{f.message}</p>

              {f.admin_response ? (
                <div className="feedback-response">
                  <strong>Your response:</strong> {f.admin_response}
                </div>
              ) : (
                <div className="feedback-reply-row">
                  <input
                    placeholder="Write a response…"
                    value={drafts[f.id] || ''}
                    onChange={(e) => setDrafts((d) => ({ ...d, [f.id]: e.target.value }))}
                  />
                  <button className="btn btn-primary btn-sm" onClick={() => handleRespond(f.id)}>
                    <Send size={14} /> Reply
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

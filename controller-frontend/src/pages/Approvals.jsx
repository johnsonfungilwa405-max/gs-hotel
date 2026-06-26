import { useEffect, useState } from 'react';
import { Check, X, Clock } from 'lucide-react';
import { api } from '../api';

const TYPE_LABELS = {
  new_room: 'New room',
  price_change: 'Price change',
  remove_room: 'Remove room',
};

export default function Approvals() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('pending');

  const load = (status) => {
    setLoading(true);
    api.getApprovals(status).then(setRequests).catch(() => setRequests([])).finally(() => setLoading(false));
  };

  useEffect(() => load(filter), [filter]);

  const handleApprove = async (id) => {
    await api.approve(id);
    load(filter);
  };

  const handleReject = async (id) => {
    await api.reject(id);
    load(filter);
  };

  const describePayload = (req) => {
    const p = req.payload;
    if (req.request_type === 'new_room') return `Room ${p.room_number} at TZS ${Number(p.price).toLocaleString()}/night`;
    if (req.request_type === 'price_change') return `New price: TZS ${Number(p.price).toLocaleString()}/night`;
    if (req.request_type === 'remove_room') return `Room ${p.room_number}`;
    return JSON.stringify(p);
  };

  return (
    <div className="fade-in">
      <div className="page-head">
        <div>
          <p className="eyebrow">Gatekeeper</p>
          <h1>Approval requests</h1>
        </div>
      </div>

      <div className="tab-row">
        {['pending', 'approved', 'rejected'].map((s) => (
          <button key={s} className={filter === s ? 'is-active' : ''} onClick={() => setFilter(s)}>
            {s[0].toUpperCase() + s.slice(1)}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="state-msg">Loading requests…</p>
      ) : requests.length === 0 ? (
        <p className="state-msg">No {filter} requests.</p>
      ) : (
        <div className="card table-card">
          <table className="data-table">
            <thead>
              <tr>
                <th>Type</th>
                <th>Details</th>
                <th>Submitted</th>
                {filter === 'pending' && <th>Actions</th>}
              </tr>
            </thead>
            <tbody>
              {requests.map((req) => (
                <tr key={req.id}>
                  <td className="cell-strong">{TYPE_LABELS[req.request_type] || req.request_type}</td>
                  <td>{describePayload(req)}</td>
                  <td>
                    <span className="feedback-date">
                      <Clock size={13} style={{ marginRight: 4, verticalAlign: 'middle' }} />
                      {new Date(req.created_at).toLocaleString()}
                    </span>
                  </td>
                  {filter === 'pending' && (
                    <td className="cell-actions">
                      <button className="btn btn-success btn-sm" onClick={() => handleApprove(req.id)}>
                        <Check size={14} /> Approve
                      </button>
                      <button className="btn btn-outline btn-sm" onClick={() => handleReject(req.id)}>
                        <X size={14} /> Reject
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

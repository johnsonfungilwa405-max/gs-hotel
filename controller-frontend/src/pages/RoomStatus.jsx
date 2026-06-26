import { useEffect, useState } from 'react';
import { api } from '../api';

const STATUS_LABELS = { free: 'Free', ordered: 'Ordered', paid: 'Paid' };

export default function RoomStatus() {
  const [counts, setCounts] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getRoomsOverview().then((rows) => {
      const map = {};
      rows.forEach((r) => (map[r.status] = Number(r.count)));
      setCounts(map);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const total = Object.values(counts).reduce((a, b) => a + b, 0) || 1;

  return (
    <div className="fade-in">
      <div className="page-head">
        <div>
          <p className="eyebrow">Capacity</p>
          <h1>Room status</h1>
        </div>
      </div>

      {loading ? (
        <p className="state-msg">Loading…</p>
      ) : (
        <div className="card room-status-card">
          {Object.entries(STATUS_LABELS).map(([key, label]) => {
            const count = counts[key] || 0;
            const pct = Math.round((count / total) * 100);
            return (
              <div key={key} className="room-status-row">
                <div className="room-status-row-head">
                  <span className={`status-pill status-${key}`}>{label}</span>
                  <span className="cell-strong">{count} rooms</span>
                </div>
                <div className="room-status-bar">
                  <div className={`room-status-bar-fill fill-${key}`} style={{ width: `${pct}%` }} />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

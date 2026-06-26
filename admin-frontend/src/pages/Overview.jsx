import { useEffect, useState } from 'react';
import { BedDouble, Users, ClipboardList, MessageSquare } from 'lucide-react';
import { api } from '../api';

export default function Overview() {
  const [stats, setStats] = useState({ rooms: 0, free: 0, customers: 0, orders: 0, feedback: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.getRooms(), api.getInHouseCustomers(), api.getOrders(), api.getFeedback()])
      .then(([rooms, customers, orders, feedback]) => {
        setStats({
          rooms: rooms.length,
          free: rooms.filter((r) => r.status === 'free').length,
          customers: customers.length,
          orders: orders.length,
          feedback: feedback.length,
        });
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const cards = [
    { label: 'Total rooms', value: stats.rooms, icon: BedDouble },
    { label: 'Free rooms', value: stats.free, icon: BedDouble },
    { label: 'Guests in-house', value: stats.customers, icon: Users },
    { label: 'Total orders', value: stats.orders, icon: ClipboardList },
    { label: 'Feedback received', value: stats.feedback, icon: MessageSquare },
  ];

  return (
    <div className="fade-in">
      <div className="page-head">
        <div>
          <p className="eyebrow">Admin panel</p>
          <h1>Overview</h1>
        </div>
      </div>

      {loading ? (
        <p className="state-msg">Loading dashboard…</p>
      ) : (
        <div className="stat-grid">
          {cards.map((c) => (
            <div key={c.label} className="card stat-card">
              <div className="stat-icon">
                <c.icon size={20} />
              </div>
              <p className="stat-value">{c.value}</p>
              <p className="stat-label">{c.label}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

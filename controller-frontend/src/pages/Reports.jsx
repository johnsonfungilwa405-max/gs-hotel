import { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { api } from '../api';

export default function Reports() {
  const [profit, setProfit] = useState(null);
  const [traffic, setTraffic] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.getProfit(), api.getTraffic()])
      .then(([p, t]) => {
        setProfit(p);
        setTraffic(t);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const chartData = profit
    ? [
        { name: 'Rooms', revenue: Number(profit.room_revenue) },
        { name: 'Drinks & Food', revenue: Number(profit.service_revenue) },
      ]
    : [];

  const trafficMap = {};
  traffic.forEach((t) => {
    const key = `${t.visitor_type}_${t.event_type}`;
    trafficMap[key] = Number(t.count);
  });

  return (
    <div className="fade-in">
      <div className="page-head">
        <div>
          <p className="eyebrow">Insights</p>
          <h1>Reports</h1>
        </div>
      </div>

      {loading ? (
        <p className="state-msg">Loading reports…</p>
      ) : (
        <>
          <div className="card report-chart-card">
            <h3 className="report-card-title">Revenue by source (TZS)</h3>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ece0d4" />
                <XAxis dataKey="name" stroke="#685e5b" fontSize={13} />
                <YAxis stroke="#685e5b" fontSize={13} />
                <Tooltip formatter={(v) => Number(v).toLocaleString()} />
                <Bar dataKey="revenue" fill="#b4122a" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="stat-grid traffic-grid">
            <div className="card stat-card">
              <p className="stat-value">{trafficMap.customer_enter || 0}</p>
              <p className="stat-label">Customers entered</p>
            </div>
            <div className="card stat-card">
              <p className="stat-value">{trafficMap.customer_exit || 0}</p>
              <p className="stat-label">Customers exited</p>
            </div>
            <div className="card stat-card">
              <p className="stat-value">{trafficMap.worker_enter || 0}</p>
              <p className="stat-label">Workers entered</p>
            </div>
            <div className="card stat-card">
              <p className="stat-value">{trafficMap.worker_exit || 0}</p>
              <p className="stat-label">Workers exited</p>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { BedDouble, Wallet, ShieldCheck, ArrowRight } from 'lucide-react';
import { api } from '../api';

export default function Overview() {
  const [rooms, setRooms] = useState({});
  const [profit, setProfit] = useState(null);
  const [pendingCount, setPendingCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.getRoomsOverview(), api.getProfit(), api.getApprovals('pending')])
      .then(([roomsData, profitData, approvals]) => {
        const map = {};
        roomsData.forEach((r) => (map[r.status] = Number(r.count)));
        setRooms(map);
        setProfit(profitData);
        setPendingCount(approvals.length);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const totalRooms = Object.values(rooms).reduce((a, b) => a + b, 0);

  return (
    <div className="fade-in">
      <div className="page-head">
        <div>
          <p className="eyebrow">Controller panel</p>
          <h1>Overview</h1>
        </div>
      </div>

      {loading ? (
        <p className="state-msg">Loading dashboard…</p>
      ) : (
        <>
          <div className="stat-grid">
            <div className="card stat-card">
              <div className="stat-icon"><BedDouble size={20} /></div>
              <p className="stat-value">{totalRooms}</p>
              <p className="stat-label">Total rooms</p>
            </div>
            <div className="card stat-card">
              <div className="stat-icon"><BedDouble size={20} /></div>
              <p className="stat-value">{rooms.free || 0}</p>
              <p className="stat-label">Free rooms</p>
            </div>
            <div className="card stat-card">
              <div className="stat-icon"><Wallet size={20} /></div>
              <p className="stat-value">{profit ? Number(profit.total_revenue).toLocaleString() : 0}</p>
              <p className="stat-label">Total revenue (TZS)</p>
            </div>
            <div className="card stat-card">
              <div className="stat-icon"><ShieldCheck size={20} /></div>
              <p className="stat-value">{pendingCount}</p>
              <p className="stat-label">Pending approvals</p>
            </div>
          </div>

          {pendingCount > 0 && (
            <Link to="/approvals" className="approval-banner">
              <ShieldCheck size={18} />
              <span>{pendingCount} request{pendingCount > 1 ? 's' : ''} waiting for your approval</span>
              <ArrowRight size={16} />
            </Link>
          )}
        </>
      )}
    </div>
  );
}

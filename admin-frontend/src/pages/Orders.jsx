import { useEffect, useState } from 'react';
import { api } from '../api';

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    api.getOrders().then(setOrders).catch(() => setOrders([])).finally(() => setLoading(false));
  };

  useEffect(load, []);

  const handlePay = async (id) => {
    await api.payOrder(id);
    load();
  };

  const handleComplete = async (id) => {
    await api.completeOrder(id);
    load();
  };

  return (
    <div className="fade-in">
      <div className="page-head">
        <div>
          <p className="eyebrow">Bookings</p>
          <h1>Orders</h1>
        </div>
      </div>

      {loading ? (
        <p className="state-msg">Loading orders…</p>
      ) : (
        <div className="card table-card">
          <table className="data-table">
            <thead>
              <tr>
                <th>Guest</th>
                <th>Room</th>
                <th>Type</th>
                <th>Nights</th>
                <th>Total (TZS)</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o.id}>
                  <td className="cell-strong">{o.customer_code}</td>
                  <td>{o.room_number ? `No. ${o.room_number}` : '—'}</td>
                  <td>{o.order_type === 'pre_order' ? 'Pre-order' : 'Order now'}</td>
                  <td>{o.stay_duration_nights}</td>
                  <td>{Number(o.total_price).toLocaleString()}</td>
                  <td>
                    <span className={`status-pill status-${o.status}`}>{o.status}</span>
                  </td>
                  <td className="cell-actions">
                    {o.status === 'ordered' && (
                      <button className="btn btn-success btn-sm" onClick={() => handlePay(o.id)}>
                        Mark paid
                      </button>
                    )}
                    {o.status === 'paid' && (
                      <button className="btn btn-outline btn-sm" onClick={() => handleComplete(o.id)}>
                        Check out
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {orders.length === 0 && <p className="state-msg">No orders yet.</p>}
        </div>
      )}
    </div>
  );
}

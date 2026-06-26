import { useEffect, useState } from 'react';

import { api } from '../api';

export default function Customers() {
  const [inHouse, setInHouse] = useState([]);
  const [all, setAll] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('in-house');

  useEffect(() => {
    Promise.all([api.getInHouseCustomers(), api.getAllCustomers()])
      .then(([ih, a]) => {
        setInHouse(ih);
        setAll(a);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const rows = tab === 'in-house' ? inHouse : all;

  return (
    <div className="fade-in">
      <div className="page-head">
        <div>
          <p className="eyebrow">Guests</p>
          <h1>Customers</h1>
        </div>
      </div>

      <div className="tab-row">
        <button className={tab === 'in-house' ? 'is-active' : ''} onClick={() => setTab('in-house')}>
          Currently in hotel ({inHouse.length})
        </button>
        <button className={tab === 'all' ? 'is-active' : ''} onClick={() => setTab('all')}>
          All registered ({all.length})
        </button>
      </div>

      {loading ? (
        <p className="state-msg">Loading…</p>
      ) : (
        <div className="card table-card">
          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Phone</th>
                {tab === 'in-house' && <th>Room</th>}
                {tab === 'in-house' && <th>Order status</th>}
                {tab === 'all' && <th>Has account</th>}
              </tr>
            </thead>
            <tbody>
              {rows.map((c) => (
                <tr key={c.id}>
                  <td className="cell-strong">{c.customer_code}</td>
                  <td>{c.full_name || '—'}</td>
                  <td>{c.phone_number}</td>
                  {tab === 'in-house' && <td>{c.room_number ? `No. ${c.room_number}` : '—'}</td>}
                  {tab === 'in-house' && (
                    <td>
                      <span className={`status-pill status-${c.order_status}`}>{c.order_status}</span>
                    </td>
                  )}
                  {tab === 'all' && <td>{c.has_account ? 'Yes' : 'No'}</td>}
                </tr>
              ))}
            </tbody>
          </table>
          {rows.length === 0 && <p className="state-msg">No customers to show.</p>}
        </div>
      )}
    </div>
  );
}

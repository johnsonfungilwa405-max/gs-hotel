import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, ShieldAlert } from 'lucide-react';
import { api } from '../api';
import RoomFormModal from '../components/RoomFormModal';

export default function Rooms() {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null); // { mode: 'add' | 'edit' | 'price', room? }
  const [toast, setToast] = useState('');

  const load = () => {
    setLoading(true);
    api.getRooms().then(setRooms).catch(() => setRooms([])).finally(() => setLoading(false));
  };

  useEffect(load, []);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3500);
  };

  const handleRemove = async (room) => {
    if (!window.confirm(`Submit Room ${room.room_number} for removal? This needs controller approval.`)) return;
    try {
      await api.removeRoom(room.id);
      showToast('Removal submitted for controller approval.');
    } catch (err) {
      showToast(err.message);
    }
  };

  return (
    <div className="fade-in">
      <div className="page-head">
        <div>
          <p className="eyebrow">Manage</p>
          <h1>Rooms</h1>
        </div>
        <button className="btn btn-primary" onClick={() => setModal({ mode: 'add' })}>
          <Plus size={16} /> Add room
        </button>
      </div>

      {toast && (
        <div className="approval-toast">
          <ShieldAlert size={16} /> {toast}
        </div>
      )}

      {loading ? (
        <p className="state-msg">Loading rooms…</p>
      ) : (
        <div className="card table-card">
          <table className="data-table">
            <thead>
              <tr>
                <th>Room</th>
                <th>Status</th>
                <th>Price (TZS)</th>
                <th>Pending price</th>
                <th>Approved</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {rooms.map((room) => (
                <tr key={room.id}>
                  <td className="cell-strong">No. {room.room_number}</td>
                  <td>
                    <span className={`status-pill status-${room.status}`}>{room.status}</span>
                  </td>
                  <td>{Number(room.price).toLocaleString()}</td>
                  <td>{room.pending_price ? Number(room.pending_price).toLocaleString() + ' (awaiting approval)' : '—'}</td>
                  <td>{room.is_approved ? 'Yes' : 'Pending'}</td>
                  <td className="cell-actions">
                    <button className="icon-btn" title="Edit photos/description" onClick={() => setModal({ mode: 'edit', room })}>
                      <Pencil size={15} />
                    </button>
                    <button className="icon-btn" title="Propose price change" onClick={() => setModal({ mode: 'price', room })}>
                      TZS
                    </button>
                    <button className="icon-btn icon-btn-danger" title="Remove room" onClick={() => handleRemove(room)}>
                      <Trash2 size={15} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {rooms.length === 0 && <p className="state-msg">No rooms yet — add the first one.</p>}
        </div>
      )}

      {modal && (
        <RoomFormModal
          mode={modal.mode}
          room={modal.room}
          onClose={() => setModal(null)}
          onDone={(msg) => {
            setModal(null);
            showToast(msg);
            load();
          }}
        />
      )}
    </div>
  );
}

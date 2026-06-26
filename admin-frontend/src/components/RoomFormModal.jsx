import { useState } from 'react';
import { X } from 'lucide-react';
import { api } from '../api';

export default function RoomFormModal({ mode, room, onClose, onDone }) {
  const [roomNumber, setRoomNumber] = useState(room?.room_number || '');
  const [price, setPrice] = useState(room?.price || '');
  const [description, setDescription] = useState(room?.description || '');
  const [photoUrls, setPhotoUrls] = useState((room?.photo_urls || []).join(', '));
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const titles = {
    add: 'Add a new room',
    edit: 'Edit room details',
    price: `Propose new price — Room ${room?.room_number}`,
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      if (mode === 'add') {
        await api.addRoom({
          room_number: roomNumber,
          price: Number(price),
          description,
          photo_urls: photoUrls.split(',').map((s) => s.trim()).filter(Boolean),
        });
        onDone('New room submitted for controller approval.');
      } else if (mode === 'edit') {
        await api.updateRoom(room.id, {
          description,
          photo_urls: photoUrls.split(',').map((s) => s.trim()).filter(Boolean),
        });
        onDone('Room details updated.');
      } else if (mode === 'price') {
        await api.proposeRoomPrice(room.id, Number(price));
        onDone('Price change submitted for controller approval.');
      }
    } catch (err) {
      setError(err.message || 'Something went wrong.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose} aria-label="Close">
          <X size={18} />
        </button>
        <h3 className="modal-title">{titles[mode]}</h3>

        <form className="modal-form" onSubmit={handleSubmit}>
          {mode === 'add' && (
            <label className="field">
              <span>Room number</span>
              <input value={roomNumber} onChange={(e) => setRoomNumber(e.target.value)} required />
            </label>
          )}

          {(mode === 'add' || mode === 'price') && (
            <label className="field">
              <span>Price per night (TZS)</span>
              <input type="number" min="0" value={price} onChange={(e) => setPrice(e.target.value)} required />
            </label>
          )}

          {(mode === 'add' || mode === 'edit') && (
            <>
              <label className="field">
                <span>Description</span>
                <textarea rows={3} value={description} onChange={(e) => setDescription(e.target.value)} />
              </label>
              <label className="field">
                <span>Photo URLs (comma-separated)</span>
                <textarea rows={2} value={photoUrls} onChange={(e) => setPhotoUrls(e.target.value)} />
              </label>
            </>
          )}

          {error && <p className="field-error">{error}</p>}

          <button className="btn btn-primary" disabled={submitting}>
            {submitting ? 'Submitting…' : mode === 'edit' ? 'Save changes' : 'Submit for approval'}
          </button>
        </form>
      </div>
    </div>
  );
}

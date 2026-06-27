import { useState } from 'react';
import { X, Plus, Trash2 } from 'lucide-react';
import { api } from '../api';

const MAX_PHOTOS = 7;

export default function RoomFormModal({ mode, room, onClose, onDone }) {
  const [roomNumber, setRoomNumber] = useState(room?.room_number || '');
  const [price, setPrice] = useState(room?.price || '');
  const [description, setDescription] = useState(room?.description || '');
  const [photoUrls, setPhotoUrls] = useState(
    room?.photo_urls && room.photo_urls.length > 0 ? room.photo_urls : ['']
  );
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const titles = {
    add: 'Add a new room',
    edit: 'Edit room details',
    price: `Propose new price — Room ${room?.room_number}`,
  };

  const updatePhoto = (index, value) => {
    setPhotoUrls((urls) => urls.map((u, i) => (i === index ? value : u)));
  };

  const addPhotoField = () => {
    if (photoUrls.length >= MAX_PHOTOS) return;
    setPhotoUrls((urls) => [...urls, '']);
  };

  const removePhotoField = (index) => {
    setPhotoUrls((urls) => urls.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const cleanedPhotos = photoUrls.map((u) => u.trim()).filter(Boolean);
    if (cleanedPhotos.length > MAX_PHOTOS) {
      setError(`You can add a maximum of ${MAX_PHOTOS} photos per room.`);
      return;
    }

    setSubmitting(true);
    try {
      if (mode === 'add') {
        await api.addRoom({
          room_number: roomNumber,
          price: Number(price),
          description,
          photo_urls: cleanedPhotos,
        });
        onDone('New room submitted for controller approval.');
      } else if (mode === 'edit') {
        await api.updateRoom(room.id, {
          description,
          photo_urls: cleanedPhotos,
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

              <div className="field">
                <span>
                  Room photos ({photoUrls.filter((u) => u.trim()).length}/{MAX_PHOTOS})
                </span>
                <div className="photo-input-list">
                  {photoUrls.map((url, index) => (
                    <div key={index} className="photo-input-row">
                      <input
                        type="text"
                        placeholder={`Photo URL ${index + 1}`}
                        value={url}
                        onChange={(e) => updatePhoto(index, e.target.value)}
                      />
                      {photoUrls.length > 1 && (
                        <button
                          type="button"
                          className="icon-btn icon-btn-danger"
                          onClick={() => removePhotoField(index)}
                          aria-label="Remove photo"
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>

                {photoUrls.length < MAX_PHOTOS && (
                  <button type="button" className="btn btn-outline btn-sm photo-add-btn" onClick={addPhotoField}>
                    <Plus size={14} /> Add another photo
                  </button>
                )}
                <p className="photo-hint">Up to {MAX_PHOTOS} photos so guests can see every part of the room.</p>
              </div>
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

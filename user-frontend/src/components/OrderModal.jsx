import { useState } from 'react';
import { X, Phone, CalendarRange } from 'lucide-react';
import { useCustomer } from '../context/CustomerContext';
import { api } from '../api';
import './OrderModal.css';

export default function OrderModal({ room, onClose, onSuccess }) {
  const { customer, identify } = useCustomer();
  const [phone, setPhone] = useState(customer?.phone_number || '');
  const [nights, setNights] = useState(1);
  const [checkIn, setCheckIn] = useState('');
  const [step, setStep] = useState('form');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const isPreOrder = room.status !== 'free';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!phone.trim()) {
      setError('A phone number is required to place an order.');
      return;
    }
    setSubmitting(true);
    try {
      const guest = customer && customer.phone_number === phone ? customer : await identify(phone);
      await api.createOrder({
        customer_id: guest.id,
        room_id: room.id,
        stay_duration_nights: nights,
        check_in_date: checkIn || null,
      });
      setStep('success');
      onSuccess?.();
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose} aria-label="Close">
          <X size={20} />
        </button>

        {step === 'form' ? (
          <>
            <p className="eyebrow">Room No. {room.room_number}</p>
            <h3 className="modal-title">{isPreOrder ? 'Pre-order this room' : 'Order this room'}</h3>
            <p className="modal-sub">
              {isPreOrder
                ? 'This room is currently in use. You can reserve it for after the current guest checks out.'
                : 'TZS ' + Number(room.price).toLocaleString() + ' per night'}
            </p>

            <form onSubmit={handleSubmit} className="modal-form">
              <label className="modal-field">
                <span><Phone size={14} /> Phone number</span>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="e.g. 0712 345 678"
                  required
                />
              </label>

              <label className="modal-field">
                <span><CalendarRange size={14} /> Number of nights</span>
                <input
                  type="number"
                  min="1"
                  value={nights}
                  onChange={(e) => setNights(Number(e.target.value))}
                  required
                />
              </label>

              <label className="modal-field">
                <span><CalendarRange size={14} /> Check-in date</span>
                <input type="date" value={checkIn} onChange={(e) => setCheckIn(e.target.value)} />
              </label>

              {error && <p className="modal-error">{error}</p>}

              <button type="submit" className="btn btn-primary" disabled={submitting}>
                {submitting ? 'Placing order…' : isPreOrder ? 'Confirm Pre-order' : 'Confirm Order'}
              </button>
            </form>
          </>
        ) : (
          <div className="modal-success">
            <h3 className="modal-title">{isPreOrder ? 'Pre-order confirmed' : 'Order confirmed'}</h3>
            <p className="modal-sub">
              Your customer ID is <strong>{customer?.customer_code}</strong>. Our front desk will be in touch
              shortly to confirm payment for Room {room.room_number}.
            </p>
            <button className="btn btn-secondary" onClick={onClose}>
              Done
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

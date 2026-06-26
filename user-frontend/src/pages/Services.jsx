import { useEffect, useState } from 'react';
import { BedDouble, CupSoda, UtensilsCrossed, Heart } from 'lucide-react';
import RoomCard from '../components/RoomCard';
import OrderModal from '../components/OrderModal';
import { api } from '../api';
import { useReveal } from '../hooks/useReveal';
import './Services.css';

const TABS = [
  { key: 'rooms', label: 'Rooms', icon: BedDouble },
  { key: 'drink', label: 'Drinks', icon: CupSoda },
  { key: 'food', label: 'Food', icon: UtensilsCrossed },
];

export default function Services() {
  const [tab, setTab] = useState('rooms');
  const [rooms, setRooms] = useState([]);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeRoom, setActiveRoom] = useState(null);
  const containerRef = useReveal([tab, rooms, items]);

  const loadRooms = () => {
    setLoading(true);
    api.getRooms().then(setRooms).catch(() => setRooms([])).finally(() => setLoading(false));
  };

  useEffect(() => {
    if (tab === 'rooms') {
      loadRooms();
    } else {
      setLoading(true);
      api.getServices(tab).then(setItems).catch(() => setItems([])).finally(() => setLoading(false));
    }
  }, [tab]);

  const handleLike = async (id) => {
    try {
      await api.likeService(id);
      setItems((prev) => prev.map((it) => (it.id === id ? { ...it, likes_count: it.likes_count + 1 } : it)));
    } catch {
      // ignore - optimistic enough already handled in UI state above
    }
  };

  const handleOrder = async (id) => {
    const phone = window.prompt('Enter your phone number to place this order:');
    if (!phone) return;
    try {
      const customer = await api.identifyCustomer({ phone_number: phone });
      await api.orderService(id, { customer_id: customer.id, quantity: 1 });
      window.alert('Order placed! Our staff will bring it to you shortly.');
    } catch (err) {
      window.alert(err.message || 'Could not place the order. Please try again.');
    }
  };

  return (
    <div ref={containerRef}>
      <section className="page-banner">
        <div className="container">
          <p className="eyebrow">What we offer</p>
          <h1>Services at GS Hotel</h1>
        </div>
      </section>

      <section className="section services-section">
        <div className="container">
          <div className="services-tabs reveal">
            {TABS.map((t) => (
              <button
                key={t.key}
                className={`services-tab ${tab === t.key ? 'is-active' : ''}`}
                onClick={() => setTab(t.key)}
              >
                <t.icon size={16} /> {t.label}
              </button>
            ))}
          </div>

          {loading ? (
            <p className="state-msg">Loading…</p>
          ) : tab === 'rooms' ? (
            rooms.length === 0 ? (
              <p className="state-msg">No rooms available right now.</p>
            ) : (
              <div className="room-grid">
                {rooms.map((room) => (
                  <RoomCard key={room.id} room={room} onOrder={setActiveRoom} />
                ))}
              </div>
            )
          ) : items.length === 0 ? (
            <p className="state-msg">Nothing here yet.</p>
          ) : (
            <div className="service-grid">
              {items.map((item) => (
                <div key={item.id} className="service-card reveal">
                  <div className="service-card-top">
                    <h3>{item.name}</h3>
                    <span className="service-price">TZS {Number(item.price).toLocaleString()}</span>
                  </div>
                  {item.description && <p>{item.description}</p>}
                  <div className="service-card-actions">
                    <button className="like-btn" onClick={() => handleLike(item.id)}>
                      <Heart size={15} /> {item.likes_count}
                    </button>
                    <button className="btn btn-primary" onClick={() => handleOrder(item.id)}>
                      Order Now
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {activeRoom && (
        <OrderModal room={activeRoom} onClose={() => setActiveRoom(null)} onSuccess={loadRooms} />
      )}
    </div>
  );
}

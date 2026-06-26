import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Wifi, UtensilsCrossed, ShieldCheck } from 'lucide-react';
import Hero from '../components/Hero';
import RoomCard from '../components/RoomCard';
import OrderModal from '../components/OrderModal';
import { api } from '../api';
import { useReveal } from '../hooks/useReveal';

const HIGHLIGHTS = [
  { icon: Wifi, title: 'Free high-speed Wi-Fi', desc: 'Stay connected in every room and common area.' },
  { icon: UtensilsCrossed, title: 'Room service, day or night', desc: 'Order food and drinks straight to your room.' },
  { icon: ShieldCheck, title: '24-hour front desk', desc: 'Help is always one call away, whatever the hour.' },
];

export default function Home() {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeRoom, setActiveRoom] = useState(null);
  const containerRef = useReveal([rooms]);

  const loadRooms = () => {
    api
      .getRooms()
      .then((data) => setRooms(data.slice(0, 6)))
      .catch(() => setRooms([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadRooms();
  }, []);

  return (
    <div ref={containerRef}>
      <Hero />

      <section className="section">
        <div className="container">
          <div className="section-head reveal">
            <p className="eyebrow">Featured rooms</p>
            <h2>Find your room for this stay</h2>
            <p className="section-sub">
              Real-time availability — see the price, like a room you fancy, and order it in one tap.
            </p>
          </div>

          {loading ? (
            <p className="state-msg">Loading rooms…</p>
          ) : rooms.length === 0 ? (
            <p className="state-msg">No rooms to show right now — please check back shortly.</p>
          ) : (
            <div className="room-grid">
              {rooms.map((room) => (
                <RoomCard key={room.id} room={room} onOrder={setActiveRoom} />
              ))}
            </div>
          )}

          <div className="section-cta reveal">
            <Link to="/services" className="btn btn-ghost">
              See all rooms &amp; services <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      <section className="section section-milk">
        <div className="container">
          <div className="highlight-grid">
            {HIGHLIGHTS.map((h) => (
              <div key={h.title} className="highlight-card reveal">
                <div className="highlight-icon">
                  <h.icon size={22} strokeWidth={1.8} />
                </div>
                <h3>{h.title}</h3>
                <p>{h.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {activeRoom && (
        <OrderModal
          room={activeRoom}
          onClose={() => setActiveRoom(null)}
          onSuccess={loadRooms}
        />
      )}
    </div>
  );
}

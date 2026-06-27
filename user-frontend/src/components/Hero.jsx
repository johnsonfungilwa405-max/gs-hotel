import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import './Hero.css';

const HERO_PHOTOS = [
  'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1800&q=80',
  'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=1800&q=80',
  'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=1800&q=80',
];

export default function Hero() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setIndex((i) => (i + 1) % HERO_PHOTOS.length), 5000);
    return () => clearInterval(id);
  }, []);

  return (
    <section className="hero">
      <div className="hero-media">
        {HERO_PHOTOS.map((src, i) => (
          <img key={src} src={src} alt="GS Hotel" style={{ opacity: i === index ? 1 : 0 }} />
        ))}
        <div className="hero-overlay" />
      </div>

      <div className="container hero-content">
        <p className="eyebrow hero-eyebrow">Chunya, Mbeya</p>
        <h1 className="hero-title">
          Welcome to <span>GS Hotel</span>
        </h1>
        <p className="hero-sub">
          A room for every reason to stay — book in moments, settle in, and let the rest take care of itself.
        </p>
        <div className="hero-actions">
          <Link to="/services" className="btn btn-primary">
            Browse Rooms <ArrowRight size={16} />
          </Link>
          <Link to="/about" className="btn btn-ghost hero-ghost">
            About the hotel
          </Link>
        </div>
      </div>

      <div className="hero-dots">
        {HERO_PHOTOS.map((_, i) => (
          <span key={i} className={i === index ? 'is-active' : ''} />
        ))}
      </div>
    </section>
  );
}

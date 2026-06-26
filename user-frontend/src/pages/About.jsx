import { Globe } from 'lucide-react';
import { useReveal } from '../hooks/useReveal';

const LANGUAGES = ['English', 'Kiswahili'];

export default function About() {
  const containerRef = useReveal();

  return (
    <div ref={containerRef}>
      <section className="page-banner">
        <div className="container">
          <p className="eyebrow">About us</p>
          <h1>The story behind GS Hotel</h1>
        </div>
      </section>

      <section className="section">
        <div className="container about-grid">
          <div className="reveal">
            <h2>A place built around rest</h2>
            <p className="about-copy">
              GS Hotel was built on one idea: a stay should feel easy from the moment you arrive to the
              moment you leave. Every room is kept simple and comfortable, every order — a room, a
              meal, a drink — is a tap away, and every member of staff is here to make your visit smooth.
            </p>
            <p className="about-copy">
              Whether you're here for a night or a longer stay, we keep things straightforward: clear
              pricing, real-time room availability, and a team that responds quickly to whatever you need.
            </p>
          </div>

          <div className="about-card reveal">
            <div className="about-card-icon">
              <Globe size={22} />
            </div>
            <h3>Available in</h3>
            <ul className="about-lang-list">
              {LANGUAGES.map((lang) => (
                <li key={lang}>{lang}</li>
              ))}
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
}

import { Phone, MapPin } from 'lucide-react';
import './Footer.css';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container footer-inner">
        <div className="footer-brand">
          <span className="navbar-brand-mark">GS</span>
          <div>
            <p className="footer-name">GS Hotel</p>
            <p className="footer-tag">Rest well, stay well.</p>
          </div>
        </div>

        <div className="footer-contact">
          <span><Phone size={15} /> +255 700 000 000</span>
          <span><MapPin size={15} /> Chunya, Mbeya, Tanzania</span>
        </div>

        <p className="footer-copy">&copy; {new Date().getFullYear()} GS Hotel. All rights reserved.</p>
      </div>
    </footer>
  );
}

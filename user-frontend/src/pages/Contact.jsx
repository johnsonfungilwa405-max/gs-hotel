import { useState } from 'react';
import { Phone, MapPin, Send } from 'lucide-react';
import { useCustomer } from '../context/CustomerContext';
import { api } from '../api';
import { useReveal } from '../hooks/useReveal';
import './Contact.css';

export default function Contact() {
  const { customer } = useCustomer();
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState('idle');
  const containerRef = useReveal();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!message.trim()) return;
    setStatus('sending');
    try {
      await api.submitFeedback({ customer_id: customer?.id, message });
      setMessage('');
      setStatus('sent');
    } catch {
      setStatus('error');
    }
  };

  return (
    <div ref={containerRef}>
      <section className="page-banner">
        <div className="container">
          <p className="eyebrow">Get in touch</p>
          <h1>Contact GS Hotel</h1>
        </div>
      </section>

      <section className="section">
        <div className="container contact-grid">
          <div className="contact-info reveal">
            <h2>We'd love to hear from you</h2>
            <p className="about-copy">
              Questions about a booking, a service, or anything else — reach out and our team will
              respond as soon as possible.
            </p>
            <div className="contact-detail">
              <Phone size={18} />
              <span>+255 700 000 000</span>
            </div>
            <div className="contact-detail">
              <MapPin size={18} />
              <span>Chunya, Mbeya, Tanzania</span>
            </div>
          </div>

          <form className="contact-form reveal" onSubmit={handleSubmit}>
            <label className="modal-field">
              <span>Your message</span>
              <textarea
                rows={6}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Tell us how we can help..."
                required
              />
            </label>

            {status === 'sent' && <p className="contact-success">Thank you — your message has been sent.</p>}
            {status === 'error' && <p className="modal-error">Something went wrong. Please try again.</p>}

            <button type="submit" className="btn btn-primary" disabled={status === 'sending'}>
              {status === 'sending' ? 'Sending…' : <>Send message <Send size={15} /></>}
            </button>
          </form>
        </div>
      </section>
    </div>
  );
}

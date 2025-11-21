import React from 'react';
import { motion } from 'framer-motion';
import { MapPin, Phone, Mail, Instagram, Facebook, Twitter } from 'lucide-react';

const contactPoints = [
  { icon: MapPin, title: 'Maison Flagship', detail: '12 Rue de l’Ambre, Paris' },
  { icon: Phone, title: 'Concierge', detail: '+33 (0)1 83 92 54 20' },
  { icon: Mail, title: 'Atelier Appointments', detail: 'concierge@luxeparfum.com' },
];

const social = [
  { icon: Instagram, label: 'Instagram' },
  { icon: Facebook, label: 'Facebook' },
  { icon: Twitter, label: 'Twitter' },
];

const Contact = () => (
  <section id="contact" className="section contact">
    <div className="container">
      <div className="contact__grid">
        <motion.div
          className="contact__details"
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7 }}
        >
          <span className="eyebrow">Visit the Maison</span>
          <h2>Arrange a Private Encounter</h2>
          <p>
            Our concierges curate fragrance wardrobes for collectors and style private unveilings for
            special occasions.
          </p>

          <ul className="contact__list">
            {contactPoints.map((item) => {
              const Icon = item.icon;
              return (
                <li key={item.title}>
                  <Icon className="icon" aria-hidden="true" />
                  <div>
                    <span>{item.title}</span>
                    <small>{item.detail}</small>
                  </div>
                </li>
              );
            })}
          </ul>

          <div className="contact__social">
            {social.map((item) => {
              const Icon = item.icon;
              return (
                <motion.a
                  key={item.label}
                  href="#"
                  aria-label={item.label}
                  whileHover={{ scale: 1.06 }}
                  className="contact__social-link"
                >
                  <Icon className="icon" />
                </motion.a>
              );
            })}
          </div>
        </motion.div>

        <motion.form
          className="contact__form"
          initial={{ opacity: 0, x: 30 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7 }}
        >
          <div className="contact__row">
            <label>
              First Name
              <input type="text" placeholder="Amélie" required />
            </label>
            <label>
              Last Name
              <input type="text" placeholder="Moreau" required />
            </label>
          </div>

          <label>
            Email
            <input type="email" placeholder="amelie@maison.fr" required />
          </label>

          <label>
            Consultation Focus
            <select defaultValue="Maison Tour">
              <option>Maison Tour</option>
              <option>Signature Scent Design</option>
              <option>Bespoke Event Fragrance</option>
              <option>Press & Collaboration</option>
            </select>
          </label>

          <label>
            Message
            <textarea rows={4} placeholder="Tell us about the experience you would like to create." />
          </label>

          <motion.button
            type="submit"
            className="button button--primary"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
          >
            Reserve My Consultation
          </motion.button>
        </motion.form>
      </div>
    </div>

    <footer className="footer">
      <div className="container footer__grid">
        <div className="footer__brand">
          <span className="footer__logo">Luxe Parfum</span>
          <p>
            Crafting olfactory heirlooms for modern collectors. Each bottle is numbered, refillable and
            designed to be treasured for generations.
          </p>
        </div>

        <div className="footer__links">
          <strong>Maison</strong>
          <a href="#home">Home</a>
          <a href="#collection">Collection</a>
          <a href="#about">Our Story</a>
          <a href="#contact">Contact</a>
        </div>

        <div className="footer__links">
          <strong>Support</strong>
          <a href="#">Shipping</a>
          <a href="#">Returns</a>
          <a href="#">Care Guide</a>
          <a href="#">Privacy</a>
        </div>
      </div>

      <div className="footer__legal">
        <span>© {new Date().getFullYear()} Luxe Parfum. All rights reserved.</span>
        <div className="footer__legal-links">
          <a href="#">Privacy Policy</a>
          <a href="#">Terms of Service</a>
        </div>
      </div>
    </footer>
  </section>
);

export default Contact;
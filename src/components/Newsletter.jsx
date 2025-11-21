import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Gift, Sparkles, Check } from 'lucide-react';

const benefits = [
  { icon: Gift, label: 'Members-only unveilings' },
  { icon: Sparkles, label: 'Advance access to ateliers' },
  { icon: Mail, label: 'Seasonal ritual guides' },
];

const Newsletter = () => {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!email) return;
    setSubmitted(true);
    setEmail('');
    setTimeout(() => setSubmitted(false), 3200);
  };

  return (
    <section className="section newsletter">
      <div className="container">
        <div className="newsletter__content">
          <motion.div
            className="newsletter__copy"
            initial={{ opacity: 0, x: -32 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7 }}
          >
            <span className="eyebrow">The Parfum Society</span>
            <h2>Reserve Your Place Within the Circle</h2>
            <p>
              Curated letters announcing capsule releases, aromatic pairings and private events far in
              advance of public launches.
            </p>

            <ul className="newsletter__benefits">
              {benefits.map((benefit) => {
                const Icon = benefit.icon;
                return (
                  <li key={benefit.label}>
                    <Icon className="icon" aria-hidden="true" />
                    <span>{benefit.label}</span>
                  </li>
                );
              })}
            </ul>
          </motion.div>

          <motion.form
            className="newsletter__form"
            onSubmit={handleSubmit}
            initial={{ opacity: 0, x: 32 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
          >
            <label className="newsletter__label" htmlFor="email">
              <Mail className="icon" aria-hidden="true" />
              Email Address
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@maison.com"
              required
            />
            <motion.button
              type="submit"
              className="button button--primary"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              disabled={submitted}
            >
              {submitted ? (
                <span className="newsletter__status">
                  <Check className="icon" aria-hidden="true" />
                  You’re Confirmed
                </span>
              ) : (
                'Join the Society'
              )}
            </motion.button>
            <p className="newsletter__hint">No spam. Just handcrafted stories, four times a year.</p>
          </motion.form>
        </div>
      </div>
    </section>
  );
};

export default Newsletter;
import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const atelierPillars = [
  {
    title: 'Atelier Craft',
    description: 'Every composition is blended by hand in limited batches and rested for thirty days to deepen character.',
  },
  {
    title: 'Fine Origin',
    description: 'We source rose de mai, oud, orris butter and Madagascan vanilla from long-standing family growers.',
  },
  {
    title: 'Sustainable Luxury',
    description: 'Our refill program and recycled glass vessels honour the planet without compromising indulgence.',
  },
];

const maisonStats = [
  { value: 25, suffix: ' yrs', label: 'Maison lineage' },
  { value: 18, suffix: ' ateliers', label: 'Global salons' },
  { value: 92, suffix: '%', label: 'Naturally derived' },
  { value: 12000, suffix: '+', label: 'Private clients' },
];

const About = () => {
  const statsRef = useRef(null);

  useEffect(() => {
    const statsElement = statsRef.current;
    if (!statsElement) return;

    const figures = statsElement.querySelectorAll('[data-stat]');

    const trigger = ScrollTrigger.create({
      trigger: statsElement,
      start: 'top 80%',
      once: true,
      onEnter: () => {
        gsap.utils.toArray(figures).forEach((figure) => {
          const target = Number(figure.dataset.stat);
          const suffix = figure.dataset.suffix || '';
          gsap.fromTo(
            figure,
            { innerText: 0 },
            {
              innerText: target,
              duration: 1.8,
              ease: 'power2.out',
              snap: { innerText: target > 100 ? 10 : 1 },
              onUpdate: function onUpdate() {
                const value = Math.floor(figure.innerText);
                figure.textContent = `${value}${suffix}`;
              },
            }
          );
        });
      },
    });

    return () => trigger.kill();
  }, []);

  return (
    <section id="about" className="section section--muted">
      <div className="container">
        <div className="section__header">
          <span className="eyebrow">Maison Narrative</span>
          <h2 className="section__title">The Artisans Behind the Aura</h2>
          <p className="section__subtitle">
            Founded in Grasse and now poured around the world, our maison composes fragrances that
            honour memory, place and poetry. Each bottle is a keepsake, designed to live as part of
            your daily ritual.
          </p>
        </div>

        <div className="about__grid">
          <motion.div
            className="about__story"
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h3 className="about__heading">Our Maison</h3>
            <p>
              Lead perfumer Isabella Moreau apprenticed among master noses in Paris before opening our
              atelier in 1999. Her philosophy—perfume as modern heirloom—guides every composition we
              release. From maceration to hand-labelled bottling, nothing is rushed.
            </p>
            <p>
              We work with generational growers and fair-trade suppliers to secure the rarest natural
              extractions. Every formulation is balanced with cutting-edge molecules that extend wear
              without overpowering the wearer.
            </p>
            <div className="about__signature">
              <span>Isabella Moreau</span>
              <small>Master Perfumer & Founder</small>
            </div>
          </motion.div>

          <motion.div
            className="about__visual"
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="about__mood">
              <div className="about__mood-card about__mood-card--primary">
                <span>Rose de Mai</span>
                <span>Oud Royale</span>
                <span>Orris Butter</span>
              </div>
              <div className="about__mood-card about__mood-card--secondary">
                <p>Fragrance as keepsake</p>
                <p>Hand-blown vessels</p>
              </div>
              <div className="about__mood-card about__mood-card--accent">
                <p>Paris · London · Kyoto</p>
              </div>
            </div>
          </motion.div>
        </div>

        <div className="feature-grid">
          {atelierPillars.map((pillar) => (
            <motion.div
              key={pillar.title}
              className="feature-card"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7 }}
            >
              <div className="feature-card__glyph" aria-hidden="true" />
              <h4>{pillar.title}</h4>
              <p>{pillar.description}</p>
            </motion.div>
          ))}
        </div>

        <div ref={statsRef} className="about__stats">
          {maisonStats.map((stat) => (
            <div key={stat.label} className="stat-card">
              <span className="stat-card__value" data-stat={stat.value} data-suffix={stat.suffix}>
                0{stat.suffix}
              </span>
              <span className="stat-card__label">{stat.label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default About;
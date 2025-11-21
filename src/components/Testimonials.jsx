import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Star } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

const voices = [
  {
    name: 'Sophia Laurent',
    role: 'Fashion Editor, Paris',
    rating: 5,
    quote:
      'Golden Dawn has become my signature. It unfurls from sparkling citrus to a sensual amber glow that lasts until the evening show closes.',
  },
  {
    name: 'James Mitchell',
    role: 'Creative Director, NYC',
    rating: 5,
    quote:
      'The bespoke consultation felt like couture for scent. Midnight Elegance mirrors the mood of my studio—moody, confident, undeniable.',
  },
  {
    name: 'Isabella Chen',
    role: 'Luxury Lifestyle Writer',
    rating: 5,
    quote:
      'Each bottle is a work of art. From the hand-polished glass to the fragrance narrative, Luxe Parfum treats perfume as poetry.',
  },
  {
    name: 'Marcus Thompson',
    role: 'Restaurateur, London',
    rating: 5,
    quote:
      'Smoky Noir is the final detail before service each evening. Guests lean in to ask what I am wearing—every single night.',
  },
  {
    name: 'Emma Rodríguez',
    role: 'Interior Curator',
    rating: 5,
    quote:
      'Rose Mystique captures the blush palette of my studio. It is soft yet commanding, a bouquet that never wilts.',
  },
  {
    name: 'Alexander Kim',
    role: 'Photographer, Seoul',
    rating: 5,
    quote:
      'Ocean Breeze is my travel companion—crisp, mineral, uplifting. It turns every shoot location into a coastal sunrise.',
  },
];

const Testimonials = () => {
  const sectionRef = useRef(null);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const cards = section.querySelectorAll('.testimonial-card');

    const animation = gsap.from(cards, {
      opacity: 0,
      y: 40,
      duration: 0.8,
      stagger: 0.15,
      ease: 'power2.out',
      scrollTrigger: {
        trigger: section,
        start: 'top 70%',
      },
    });

    return () => animation.scrollTrigger?.kill();
  }, []);

  return (
    <section ref={sectionRef} className="section testimonials">
      <div className="container">
        <div className="section__header section__header--center">
          <span className="eyebrow">Collector Voices</span>
          <h2 className="section__title">Whispers from the Inner Circle</h2>
          <p className="section__subtitle">
            Our clients collect memories through scent. Their words reflect the intimate rituals and
            confidence these compositions unlock each day.
          </p>
        </div>

        <div className="testimonials__grid">
          {voices.map((voice) => (
            <motion.blockquote key={voice.name} className="testimonial-card">
              <div className="testimonial-card__header">
                <div className="rating">
                  {[...Array(5)].map((_, index) => (
                    <Star key={index} className="icon rating__star rating__star--filled" aria-hidden="true" />
                  ))}
                </div>
                <span className="testimonial-card__role">{voice.role}</span>
              </div>
              <p className="testimonial-card__quote">“{voice.quote}”</p>
              <footer className="testimonial-card__footer">{voice.name}</footer>
            </motion.blockquote>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
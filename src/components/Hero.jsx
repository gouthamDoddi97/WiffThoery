import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ChevronDown } from 'lucide-react';
import { getAssetPath } from '../utils/assetPath';

gsap.registerPlugin(ScrollTrigger);

const perfumes = [
  {
    id: 1,
    name: 'Golden Dawn',
    notes: 'Bergamot · Amber · Cedarwood',
    accent: 'rgba(212, 184, 119, 0.25)',
    image: getAssetPath('images/golden-dawn.png'),
  },
  {
    id: 2,
    name: 'Midnight Elegance',
    notes: 'Black Currant · Vanilla · Sandalwood',
    accent: 'rgba(84, 84, 123, 0.25)',
    image: getAssetPath('images/midnight-elegance.png'),
  },
  {
    id: 3,
    name: 'Rose Mystique',
    notes: 'Rose · Jasmine · White Musk',
    accent: 'rgba(184, 134, 150, 0.25)',
    image: getAssetPath('images/rose-mystique.png'),
  },
];

const Hero = () => {
  const heroRef = useRef(null);
  const copyRef = useRef(null);
  const visualRef = useRef(null);

  useEffect(() => {
    const hero = heroRef.current;
    const copy = copyRef.current;
    const visual = visualRef.current;

    if (!hero || !copy || !visual) return undefined;

    const revealTargets = copy.querySelectorAll('[data-animate]');
    const tiles = visual.querySelectorAll('.hero__tile');
    const tileArray = gsap.utils.toArray(tiles);

    const timeline = gsap.timeline({ defaults: { ease: 'power3.out' } });

    timeline
      .from(revealTargets, {
        y: 60,
        opacity: 0,
        duration: 1,
        stagger: 0.15,
      })
      .from(
        visual,
        {
          opacity: 0,
          y: 40,
          duration: 1,
        },
        '-=0.6'
      );

    if (tileArray.length) {
      timeline.from(
        tileArray,
        {
          y: 40,
          opacity: 0,
          rotateX: -10,
          duration: 0.9,
          stagger: 0.12,
        },
        '-=0.6'
      );
    }

    const parallax = tileArray.length
      ? ScrollTrigger.create({
        trigger: hero,
        start: 'top top',
        end: 'bottom top',
        scrub: true,
        onUpdate: (self) => {
          tileArray.forEach((tile, index) => {
            gsap.set(tile, {
              y: self.progress * (index % 2 === 0 ? 30 : 60),
              rotate: self.progress * (index % 2 === 0 ? -3 : 4),
            });
          });
        },
      })
      : null;

    return () => {
      timeline.kill();
      parallax?.kill();
    };
  }, []);

  const stats = [
    { value: '25', label: 'Years of craft' },
    { value: '12', suffix: 'K', label: 'Bespoke clients' },
    { value: '68', label: 'Global boutiques' },
  ];

  return (
    <section ref={heroRef} id="home" className="hero">
      <div className="hero__orb hero__orb--left" aria-hidden="true" />
      <div className="hero__orb hero__orb--right" aria-hidden="true" />

      <div className="container hero__grid">
        <div ref={copyRef} className="hero__copy">
          <span data-animate className="eyebrow hero__eyebrow">
            Maison de Parfum
          </span>
          <h1 data-animate className="hero__title">
            A Ritual of
            <span className="text-gradient"> Timeless Fragrance</span>
          </h1>
          <p data-animate className="hero__subtitle">
            Hand-crafted essences composed in Grasse and bottled in limited releases. Discover
            perfume as an objet d’art, designed for connoisseurs who collect stories, not just
            scents.
          </p>

          <div data-animate className="hero__actions">
            <motion.a
              href="#collection"
              className="button button--primary"
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
            >
              Explore the Collection
            </motion.a>
            <motion.a
              href="#about"
              className="button button--outline"
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
            >
              Our Heritage
            </motion.a>
          </div>

          <div data-animate className="hero__stats">
            {stats.map((stat) => (
              <div key={stat.label} className="hero__stat">
                <span className="hero__stat-value">
                  {stat.value}
                  {stat.suffix && <span>{stat.suffix}</span>}
                </span>
                <span className="hero__stat-label">{stat.label}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="hero__visual" ref={visualRef}>
          <div className="hero__gallery">
            {heroShots.map((shot) => (
              <div
                key={shot.name}
                className="hero__tile"
                style={{ '--accent': shot.accent }}
              >
                <div className="hero__tile-media">
                  <img src={shot.image} alt={`${shot.name} bottle`} />
                </div>
                <div className="hero__tile-info">
                  <span className="hero__tile-name">{shot.name}</span>
                  <span className="hero__tile-notes">{shot.notes}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <motion.div
        className="hero__scroll"
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 2.8, repeat: Infinity, ease: 'easeInOut' }}
      >
        <ChevronDown className="icon" aria-hidden="true" />
        <span>Scroll</span>
      </motion.div>
    </section>
  );
};

export default Hero;
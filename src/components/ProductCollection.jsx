import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Star } from 'lucide-react';
import { cn } from '../lib/utils';
import { getAssetPath } from '../utils/assetPath';

gsap.registerPlugin(ScrollTrigger);

const products = [
  {
    id: 1,
    name: 'Midnight Elegance',
    price: '$150',
    description: 'Black currant velvet paired with Madagascan vanilla and smokey sandalwood.',
    rating: 4.8,
    image: getAssetPath('images/midnight-elegance.png'),
    category: 'Nocturne',
    notes: ['Black Currant', 'Vanilla', 'Sandalwood'],
  },
  {
    id: 2,
    name: 'Golden Dawn',
    price: '$180',
    description: 'A luminous accord of bergamot, sun-warmed amber and polished cedarwood.',
    rating: 4.9,
    image: getAssetPath('images/golden-dawn.png'),
    category: 'Signature',
    notes: ['Bergamot', 'Amber', 'Cedarwood'],
  },
  {
    id: 3,
    name: 'Rose Mystique',
    price: '$200',
    description: 'Damask rose immersed in jasmine absolute and whisper-soft white musk.',
    rating: 4.7,
    image: getAssetPath('images/rose-mystique.png'),
    category: 'Atelier',
    notes: ['Rose', 'Jasmine', 'White Musk'],
  },
  {
    id: 4,
    name: 'Ocean Breeze',
    price: '$160',
    description: 'Sea salt, mineral breeze and driftwood for an invigorating coastal trail.',
    rating: 4.6,
    image: getAssetPath('images/ocean-breeze.png'),
    category: 'Voyage',
    notes: ['Sea Salt', 'Aquatic Accord', 'Driftwood'],
  },
  {
    id: 5,
    name: 'Vanilla Dreams',
    price: '$170',
    description: 'Slow-steeped vanilla bean layered with caramel praline and blush peony.',
    rating: 4.8,
    image: getAssetPath('images/vanilla-dreams.png'),
    category: 'Gourmand',
    notes: ['Vanilla', 'Caramel', 'Peony'],
  },
  {
    id: 6,
    name: 'Smoky Noir',
    price: '$220',
    description: 'A rich tapestry of cured tobacco, spiced leather and black peppercorn.',
    rating: 4.5,
    image: getAssetPath('images/smoky-noir.png'),
    category: 'Private Blend',
    notes: ['Leather', 'Tobacco', 'Black Pepper'],
  },
];

const ProductCollection = () => {
  const sectionRef = useRef(null);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const cards = section.querySelectorAll('.product-card');

    const trigger = ScrollTrigger.create({
      trigger: section,
      start: 'top 80%',
      onEnter: () => {
        gsap.fromTo(
          cards,
          { y: 60, opacity: 0, rotateX: -8 },
          {
            y: 0,
            opacity: 1,
            rotateX: 0,
            duration: 1,
            stagger: 0.18,
            ease: 'power3.out',
          }
        );
      },
    });

    return () => trigger.kill();
  }, []);

  const ProductCard = ({ product }) => {
    const fullStars = Math.floor(product.rating);
    const hasHalfStar = product.rating - fullStars >= 0.5;

    return (
      <motion.article whileHover={{ y: -12 }} className="product-card">
        <div className="product-card__media">
          <span className="product-card__badge">{product.category}</span>
          <img src={product.image} alt={product.name} className="product-card__image" />
        </div>

        <div className="product-card__info">
          <h3 className="product-card__title">{product.name}</h3>
          <p className="product-card__description">{product.description}</p>

          <div className="product-card__notes">
            {product.notes.map((note) => (
              <span key={note} className="chip">
                {note}
              </span>
            ))}
          </div>

          <div className="product-card__rating">
            <div className="rating">
              {[...Array(5)].map((_, index) => (
                <Star
                  key={index}
                  className={cn('icon rating__star', {
                    'rating__star--filled': index < fullStars,
                    'rating__star--half': index === fullStars && hasHalfStar,
                  })}
                />
              ))}
            </div>
            <span className="product-card__rating-value">{product.rating.toFixed(1)}</span>
          </div>

          <div className="product-card__footer">
            <span className="product-card__price">{product.price}</span>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.96 }}
              className="button button--soft button--small"
            >
              Add to Ritual
            </motion.button>
          </div>
        </div>
      </motion.article>
    );
  };

  return (
    <section ref={sectionRef} id="collection" className="section collection">
      <div className="container">
        <div className="section__header section__header--center">
          <span className="eyebrow">Signature Compositions</span>
          <h2 className="section__title">An Edit of House Favorites</h2>
          <p className="section__subtitle">
            Each extrait is blended in micro-batches to ensure impeccable balance. Explore blends that
            evolve from first spray to the final whisper on skin.
          </p>
        </div>

        <div className="collection__grid">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

        <div className="collection__cta">
          <motion.a
            href="#contact"
            className="button button--outline"
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.97 }}
          >
            Arrange a Private Consultation
          </motion.a>
        </div>
      </div>
    </section>
  );
};

export default ProductCollection;
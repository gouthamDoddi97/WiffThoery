import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Star } from 'lucide-react';
import { cn } from '../lib/utils';
import { getAssetPath } from '../utils/assetPath';
import { getProducts } from '../lib/supabase';

gsap.registerPlugin(ScrollTrigger);

const fallbackProducts = [
  {
    id: '1',
    name: 'Golden Dawn',
    price: 129.99,
    description: 'A luminous fragrance that captures the essence of a Mediterranean sunrise. Bergamot and amber blend seamlessly with cedarwood, creating a warm and inviting aroma perfect for any occasion.',
    rating: 4.9,
    quality_rating: 4.9,
    product_images: ['/images/golden-dawn.png'],
    background_image: '/images/golden-dawn-bg.jpg',
    classification: 'edp',
    notes: ['Bergamot', 'Amber', 'Cedarwood'],
    stock_quantity: 50,
    low_stock_threshold: 20,
  },
  {
    id: '2',
    name: 'Midnight Elegance',
    price: 149.99,
    description: 'Embrace the mystery of the night with this sophisticated blend. Black currant and vanilla create a rich base, while sandalwood adds depth and sensuality to this captivating evening fragrance.',
    rating: 4.8,
    quality_rating: 4.8,
    product_images: ['/images/midnight-elegance.png'],
    background_image: '/images/midnight-elegance-bg.jpg',
    classification: 'edp',
    notes: ['Black Currant', 'Vanilla', 'Sandalwood'],
    stock_quantity: 15,
    low_stock_threshold: 20,
  },
  {
    id: '3',
    name: 'Rose Mystique',
    price: 139.99,
    description: 'An enchanting floral composition that celebrates the timeless elegance of rose. Enhanced with jasmine and white musk, this fragrance embodies romance and femininity in its purest form.',
    rating: 4.7,
    quality_rating: 4.7,
    product_images: ['/images/rose-mystique.png'],
    background_image: '/images/rose-mystique-bg.jpg',
    classification: 'edt',
    notes: ['Rose', 'Jasmine', 'White Musk'],
    stock_quantity: 45,
    low_stock_threshold: 20,
  },
  {
    id: '4',
    name: 'GIT',
    price: 159.99,
    description: 'A bold and captivating Eau de Parfum that commands attention. Complex layers unfold with every wear, revealing a sophisticated blend of rare ingredients.',
    rating: 4.8,
    quality_rating: 4.8,
    product_images: ['/images/git.png'],
    background_image: '/images/git-bg.jpg',
    classification: 'edp',
    notes: ['Bergamot', 'Leather', 'Oud'],
    stock_quantity: 30,
    low_stock_threshold: 20,
  },
  {
    id: '5',
    name: 'Ganamyde',
    price: 249.99,
    description: 'An extraordinary Parfum Extrait of unparalleled intensity. A masterful composition reserved for true connoisseurs who appreciate the finest raw materials.',
    rating: 4.9,
    quality_rating: 4.9,
    product_images: ['/images/ganamyde.png'],
    background_image: '/images/ganamyde-bg.jpg',
    classification: 'extrait',
    notes: ['Iris', 'Ambergris', 'Vetiver'],
    stock_quantity: 12,
    low_stock_threshold: 15,
  },
  {
    id: '6',
    name: 'Guidance',
    price: 269.99,
    description: 'A luxurious Parfum Extrait that leads you through an olfactory journey. Rich, profound, and enduring with exceptional longevity and sillage.',
    rating: 5.0,
    quality_rating: 5.0,
    product_images: ['/images/guidance.png'],
    background_image: '/images/guidance-bg.jpg',
    classification: 'extrait',
    notes: ['Saffron', 'Patchouli', 'Musk'],
    stock_quantity: 8,
    low_stock_threshold: 10,
  },
];

const ProductCollection = () => {
  const sectionRef = useRef(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const data = await getProducts();
        setProducts(data.length > 0 ? data : fallbackProducts);
      } catch (err) {
        console.error('Error fetching products:', err);
        setError(err.message);
        setProducts(fallbackProducts);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section || products.length === 0) return;

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
  }, [products]);

  const formatPrice = (price) => {
    return `$${parseFloat(price).toFixed(2)}`;
  };

  const getClassificationLabel = (classification) => {
    const labels = {
      edp: 'Eau de Parfum',
      edt: 'Eau de Toilette',
      extrait: 'Parfum Extrait',
    };
    return labels[classification] || classification.toUpperCase();
  };

  const ProductCard = ({ product }) => {
    const rating = product.quality_rating || product.rating || 4.8;
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating - fullStars >= 0.5;
    const productImage = product.product_images?.[0] || '/images/placeholder.png';
    const categoryLabel = getClassificationLabel(product.classification);
    const isLowStock = product.is_low_stock || product.stock_quantity <= 20;

    return (
      <motion.article whileHover={{ y: -12 }} className="product-card">
        <div className="product-card__media">
          <span className="product-card__badge">{categoryLabel}</span>
          {isLowStock && product.stock_quantity > 0 && (
            <span className="product-card__badge product-card__badge--warning" style={{
              position: 'absolute',
              top: '3.5rem',
              right: '1rem',
              background: 'rgba(255, 152, 0, 0.9)',
              color: 'white'
            }}>
              Only {product.stock_quantity} left
            </span>
          )}
          {product.stock_quantity === 0 && (
            <span className="product-card__badge product-card__badge--danger" style={{
              position: 'absolute',
              top: '3.5rem',
              right: '1rem',
              background: 'rgba(244, 67, 54, 0.9)',
              color: 'white'
            }}>
              Out of Stock
            </span>
          )}
          <img src={productImage} alt={product.name} className="product-card__image" />
        </div>

        <div className="product-card__info">
          <h3 className="product-card__title">{product.name}</h3>
          <p className="product-card__description">{product.description}</p>

          <div className="product-card__notes">
            {product.notes?.map((note) => (
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
            <span className="product-card__rating-value">{rating.toFixed(1)}</span>
          </div>

          <div className="product-card__footer">
            <span className="product-card__price">{formatPrice(product.price)}</span>
            <motion.button
              whileHover={{ scale: product.stock_quantity > 0 ? 1.05 : 1 }}
              whileTap={{ scale: product.stock_quantity > 0 ? 0.96 : 1 }}
              className="button button--soft button--small"
              disabled={product.stock_quantity === 0}
              style={product.stock_quantity === 0 ? { opacity: 0.5, cursor: 'not-allowed' } : {}}
            >
              {product.stock_quantity === 0 ? 'Out of Stock' : 'Add to Ritual'}
            </motion.button>
          </div>
        </div>
      </motion.article>
    );
  };

  if (loading) {
    return (
      <section id="collection" className="section collection">
        <div className="container">
          <div className="section__header section__header--center">
            <span className="eyebrow">Loading...</span>
            <h2 className="section__title">Fetching Our Collection</h2>
          </div>
        </div>
      </section>
    );
  }

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

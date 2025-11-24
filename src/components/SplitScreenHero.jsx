import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import AddToCartAnimation from './AddToCartAnimation';
import { getAssetPath } from '../utils/assetPath';
import './SplitScreenHero.css';

const perfumes = [
  {
    id: 1,
    name: 'GIT',
    notes: 'Fresh · Citrus · Woody',
    color: '#2a5f4d',
    image: getAssetPath('images/GIT_bottle.png'),
    background: getAssetPath('images/GIT-bg.png'),
    price: '$299'
  },
  {
    id: 2,
    name: 'Ganymede',
    notes: 'Mineral · Suede · Mandarin',
    color: '#4a5568',
    image: getAssetPath('images/Ganymede_bottle.png'),
    background: getAssetPath('images/Ganymede-bg.png'),
    price: '$349'
  },
  {
    id: 3,
    name: 'Guidance',
    notes: 'Floral · Amber · Musk',
    color: '#8b5a3c',
    image: getAssetPath('images/Guidance_bottle.png'),
    background: getAssetPath('images/Guidance-bg.png'),
    price: '$329'
  }
];

const SplitScreenHero = ({ addToCart, cart }) => {
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const [expandedIndex, setExpandedIndex] = useState(null);
  const [showCartAnimation, setShowCartAnimation] = useState(false);
  const [selectedPerfume, setSelectedPerfume] = useState(null);
  const [startPosition, setStartPosition] = useState(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  React.useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleSectionClick = (index) => {
    if (isMobile) {
      setExpandedIndex(expandedIndex === index ? null : index);
    }
  };

  const handleAddToCart = (e, perfume) => {
    e.stopPropagation(); // Prevent section click when clicking buttons
    // Get the image element for this perfume to use as start position
    // We'll assume the image is within the same container or find it relative to the button
    // For simplicity, let's use the button click coordinates or try to find the image
    const button = e.currentTarget;
    const section = button.closest('.perfume-section');
    const image = section.querySelector('.perfume-bottle');

    if (image) {
      const rect = image.getBoundingClientRect();
      setStartPosition({
        x: rect.left,
        y: rect.top,
        width: rect.width,
        height: rect.height
      });
    } else {
      // Fallback to button position if image not found
      const rect = button.getBoundingClientRect();
      setStartPosition({
        x: rect.left,
        y: rect.top,
        width: rect.width,
        height: rect.height
      });
    }

    setSelectedPerfume(perfume);
    setShowCartAnimation(true);
  };

  const handleAnimationComplete = () => {
    if (selectedPerfume) {
      addToCart(selectedPerfume);
    }
    setShowCartAnimation(false);
    setSelectedPerfume(null);
    setStartPosition(null);
  };

  const getWidth = (index) => {
    if (isMobile) return '100%';
    if (hoveredIndex === null) {
      return '33.333%';
    }
    if (hoveredIndex === index) {
      return '50%';
    }
    return '25%';
  };

  const getHeight = (index) => {
    if (!isMobile) return '100%';
    if (expandedIndex === null) return '33.333vh';
    if (expandedIndex === index) return '100vh';
    return '0vh';
  };

  return (
    <div className="split-screen-hero" id="home">
      {perfumes.map((perfume, index) => (
        <motion.div
          key={perfume.id}
          className="perfume-section"
          style={{
            '--perfume-color': perfume.color,
            '--rotation': `${75 * index}deg`,
            backgroundImage: `url(${perfume.background})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
          animate={{
            width: getWidth(index),
            height: getHeight(index)
          }}
          transition={{
            duration: 0.6,
            ease: [0.43, 0.13, 0.23, 0.96]
          }}
          onMouseEnter={() => !isMobile && setHoveredIndex(index)}
          onMouseLeave={() => !isMobile && setHoveredIndex(null)}
          onClick={() => handleSectionClick(index)}
        >
          <div className="perfume-content">
            <motion.div
              className="perfume-image-container"
              animate={{
                scale: (isMobile ? (expandedIndex === index ? 1.1 : 0.9) : (hoveredIndex === index ? 1.1 : 1)),
                y: (isMobile ? (expandedIndex === index ? -20 : 140) : (hoveredIndex === index ? -20 : 0)),
                zIndex: (isMobile && expandedIndex !== index) ? 1 : 2
              }}
              transition={{ duration: 0.4 }}
            >
              <img
                src={perfume.image}
                alt={perfume.name}
                className="perfume-bottle"
                style={{
                  opacity: selectedPerfume?.id === perfume.id ? 0 : 1
                }}
              />
            </motion.div>

            <motion.div
              className="perfume-info"
              initial={{ opacity: 0, y: 20 }}
              animate={{
                opacity: (isMobile ? (expandedIndex === index || expandedIndex === null) : (hoveredIndex === index || hoveredIndex === null)) ? 1 : 0.5,
                y: (isMobile ? expandedIndex === index : hoveredIndex === index) ? -10 : 0,
                zIndex: 10
              }}
              transition={{ duration: 0.3 }}
            >
              <h2 className="perfume-name">{perfume.name}</h2>
              <p className="perfume-notes">{perfume.notes}</p>
              <p className="perfume-price">{perfume.price}</p>

              <motion.div
                className="perfume-actions"
                initial={{ opacity: 0, y: 10 }}
                animate={{
                  opacity: (isMobile ? expandedIndex === index : hoveredIndex === index) ? 1 : 0,
                  y: (isMobile ? expandedIndex === index : hoveredIndex === index) ? 0 : 10,
                  pointerEvents: (isMobile ? expandedIndex === index : hoveredIndex === index) ? 'auto' : 'none'
                }}
                transition={{ duration: 0.3, delay: 0.1 }}
              >
                <button
                  className="btn-buy"
                  onClick={(e) => handleAddToCart(e, perfume)}
                >
                  Buy Now
                </button>
                <button
                  className="btn-cart"
                  onClick={(e) => handleAddToCart(e, perfume)}
                >
                  Add to Cart
                </button>
              </motion.div>
            </motion.div>
          </div>

          {/* Decorative angled line */}
          <div className="angle-line" />
        </motion.div>
      ))}

      <AnimatePresence>
        {showCartAnimation && selectedPerfume && startPosition && (
          <AddToCartAnimation
            perfume={selectedPerfume}
            startPosition={startPosition}
            existingItems={cart}
            onComplete={handleAnimationComplete}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default SplitScreenHero;

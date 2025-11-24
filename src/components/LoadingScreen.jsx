import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { gsap } from 'gsap';

const LoadingScreen = ({ onLoadComplete }) => {
  const [progress, setProgress] = useState(0);
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    // Simulate loading progress
    const timer = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(timer);
          setIsComplete(true);
          setTimeout(() => onLoadComplete(), 800);
          return 100;
        }
        return prev + Math.random() * 15;
      });
    }, 200);

    return () => clearInterval(timer);
  }, [onLoadComplete]);

  const bottleVariants = {
    initial: { scale: 0.8, opacity: 0, rotateY: -180 },
    animate: {
      scale: 1,
      opacity: 1,
      rotateY: 0,
      transition: {
        duration: 2,
        ease: "backOut",
        rotateY: { duration: 1.5 }
      }
    }
  };

  const liquidVariants = {
    initial: { height: 0 },
    animate: {
      height: `${progress}%`,
      transition: { duration: 0.3, ease: "easeOut" }
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 1 }}
        exit={{ opacity: 0, scale: 1.1 }}
        transition={{ duration: 0.8 }}
        className="loading"
      >
        <div className="loading__backdrop" aria-hidden="true">
          <motion.div
            className="loading__orb loading__orb--left"
            animate={{ rotate: 360, scale: [1, 1.05, 1] }}
            transition={{ rotate: { duration: 18, repeat: Infinity, ease: 'linear' }, scale: { duration: 6, repeat: Infinity, ease: 'easeInOut' } }}
          />
          <motion.div
            className="loading__orb loading__orb--right"
            animate={{ rotate: -360, scale: [1.1, 0.95, 1.1] }}
            transition={{ rotate: { duration: 22, repeat: Infinity, ease: 'linear' }, scale: { duration: 7, repeat: Infinity, ease: 'easeInOut' } }}
          />
        </div>

        <div className="loading__content">
          <motion.div
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="loading__brand"
          >
            <h1>Whiff Theory</h1>
            <p>The Art of Fragrance</p>
          </motion.div>

          <motion.div
            variants={bottleVariants}
            initial="initial"
            animate="animate"
            className="loading__bottle"
          >
            <div className="loading__bottle-body">
              <div className="loading__cap" />
              <motion.div
                variants={liquidVariants}
                initial="initial"
                animate="animate"
                className="loading__liquid"
              />
              <div className="loading__label">
                <span>Whiff</span>
                <i />
                <span>Theory</span>
              </div>
              <motion.div
                animate={{ x: [-100, 100] }}
                transition={{ duration: 3, repeat: Infinity, repeatType: 'reverse', ease: 'easeInOut' }}
                className="loading__shine"
              />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, width: 0 }}
            animate={{ opacity: 1, width: 200 }}
            transition={{ duration: 0.8, delay: 1 }}
            className="loading__progress"
          >
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.3 }}
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 1.2 }}
            className="loading__copy"
          >
            <p>Preparing your experience…</p>
            <motion.p
              animate={{ opacity: [1, 0.5, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              {Math.round(progress)}%
            </motion.p>
          </motion.div>

          {[...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              animate={{
                y: [-20, -60, -20],
                opacity: [0, 1, 0],
                scale: [0, 1, 0]
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                delay: i * 0.5,
                ease: "easeOut"
              }}
              className="loading__particle"
              style={{
                left: `${20 + i * 10}%`,
                top: `${40 + Math.sin(i) * 10}%`
              }}
            />
          ))}
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default LoadingScreen;
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import './AddToCartAnimation.css';

const AddToCartAnimation = ({ perfume, startPosition, existingItems = [], onComplete }) => {
    const [stage, setStage] = useState('box-opening');

    useEffect(() => {
        const timers = [
            setTimeout(() => setStage('box-opening'), 0),
            setTimeout(() => setStage('bottle-falling'), 800),
            setTimeout(() => setStage('box-closing'), 2200),  // Increased delay to let bottle fully enter
            setTimeout(() => setStage('celebration'), 3000),
            setTimeout(() => onComplete(), 5200)
        ];

        return () => timers.forEach(timer => clearTimeout(timer));
    }, [onComplete]);

    // Generate confetti particles
    const confettiCount = 100;
    const confettiColors = ['#FFD700', '#FF69B4', '#00CED1', '#FF6347', '#9370DB', '#32CD32', '#FFFFFF'];

    // Calculate bottle animation variants
    // We need to animate from startPosition (fixed) to the box position (fixed/centered bottom)
    // The box is centered horizontally and at the bottom.
    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;

    // Box center position (approximate based on CSS)
    // Box is 200px wide, centered. Bottom is ~100px from bottom (due to padding/margin)
    const boxCenterX = windowWidth / 2;
    const boxCenterY = windowHeight - 150; // Adjust based on where the box actually sits

    const bottleVariants = {
        initial: {
            position: 'fixed',
            top: startPosition.y,
            left: startPosition.x,
            width: startPosition.width,
            height: startPosition.height,
            opacity: 1,
            zIndex: 1000,
            rotate: 0
        },
        falling: {
            top: boxCenterY - 100, // Fall into the box
            left: boxCenterX - 110, // Center in box (width is 220px)
            width: 220,
            height: 300,
            rotate: 0,
            transition: {
                duration: 0.8,
                ease: [0.6, -0.05, 0.01, 0.99] // Ease in back-ish
            }
        },
        inBox: {
            top: boxCenterY + 50, // Deeper in box
            opacity: 0,
            scale: 0.5,
            transition: {
                duration: 0.4
            }
        }
    };

    return (
        <motion.div
            className="cart-animation-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
        >
            {/* Box Container */}
            <div className="box-container">
                {/* Box Bottom */}
                <motion.div
                    className="box-bottom"
                    initial={{ y: 100, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.5 }}
                >
                    <div className="box-face box-front" />
                    <div className="box-face box-back" />
                    <div className="box-face box-left" />
                    <div className="box-face box-right" />
                    <div className="box-face box-bottom-face" />

                    {/* Existing Bottles inside the box */}
                    <div className="existing-bottles-container">
                        {existingItems.map((item, index) => {
                            // Simple distribution logic
                            const offset = (index - (existingItems.length - 1) / 2) * 30;
                            const zOffset = (index % 2) * 20 - 20;
                            const rotation = (Math.random() - 0.5) * 30;

                            return (
                                <div
                                    key={`${item.id}-${index}`}
                                    className="existing-bottle"
                                    style={{
                                        transform: `translateX(${offset}px) translateZ(${zOffset}px) rotateY(${rotation}deg)`
                                    }}
                                >
                                    <img src={item.image} alt="Existing item" />
                                </div>
                            );
                        })}
                    </div>
                </motion.div>

                {/* Box Lid */}
                <motion.div
                    className="box-lid"
                    initial={{ y: 100, rotateX: 0 }}
                    animate={{
                        y: stage === 'box-opening' || stage === 'bottle-falling' ? -50 : 0,
                        rotateX: stage === 'box-opening' || stage === 'bottle-falling' ? -120 : 0
                    }}
                    transition={{ duration: 0.6, ease: 'easeInOut' }}
                >
                    <div className="box-face box-lid-top" />
                    <div className="box-face box-lid-front" />
                    <div className="box-face box-lid-back" />
                    <div className="box-face box-lid-left" />
                    <div className="box-face box-lid-right" />
                </motion.div>



            </div>

            {/* Falling Bottle - Now animated from source and outside box container for correct positioning */}
            {(stage === 'box-opening' || stage === 'bottle-falling' || stage === 'box-closing') && (
                <motion.img
                    src={perfume.image}
                    alt={perfume.name}
                    className="falling-bottle-fixed"
                    variants={bottleVariants}
                    initial="initial"
                    animate={stage === 'bottle-falling' ? 'falling' : (stage === 'box-closing' ? 'inBox' : 'initial')}
                />
            )}

            {/* Success Notification */}
            {
                stage === 'celebration' && (
                    <>
                        <motion.div
                            className="success-notification"
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0, opacity: 0 }}
                            transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                        >
                            <div className="success-icon">✓</div>
                            <h3>Added to Cart!</h3>
                            <p>{perfume.name}</p>
                        </motion.div>

                        {/* Party Poppers / Confetti */}
                        <div className="confetti-container">
                            {[...Array(confettiCount)].map((_, i) => (
                                <motion.div
                                    key={i}
                                    className="confetti"
                                    style={{
                                        backgroundColor: confettiColors[i % confettiColors.length],
                                        left: `${Math.random() * 100}%`,
                                    }}
                                    initial={{
                                        y: -20,
                                        x: 0,
                                        rotate: 0,
                                        opacity: 1
                                    }}
                                    animate={{
                                        y: window.innerHeight,
                                        x: (Math.random() - 0.5) * 400,
                                        rotate: Math.random() * 720,
                                        opacity: 0
                                    }}
                                    transition={{
                                        duration: 2 + Math.random() * 1,
                                        ease: 'easeOut',
                                        delay: Math.random() * 0.3
                                    }}
                                />
                            ))}
                        </div>

                        {/* Party Popper Elements removed as per request */}
                    </>
                )
            }
        </motion.div >
    );
};

export default AddToCartAnimation;

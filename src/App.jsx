import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import LoadingScreen from './components/LoadingScreen';
import Navigation from './components/Navigation';
import SplitScreenHero from './components/SplitScreenHero';
import ProductCollection from './components/ProductCollection';
import About from './components/About';
import Testimonials from './components/Testimonials';
import Newsletter from './components/Newsletter';
import Contact from './components/Contact';
import ScrollToTop from './components/ScrollToTop';
import CursorTrail from './components/CursorTrail';
import CartDrawer from './components/CartDrawer';
import './App.css';

function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);

    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleLoadComplete = () => {
    setIsLoading(false);
  };

  const [cart, setCart] = useState([]);

  const addToCart = (product) => {
    setCart([...cart, product]);
  };

  const clearCart = () => {
    setCart([]);
  };

  const [isCartOpen, setIsCartOpen] = useState(false);

  const removeFromCart = (indexToRemove) => {
    setCart(cart.filter((_, index) => index !== indexToRemove));
  };

  const [theme, setTheme] = useState('dark');

  useEffect(() => {
    // Check system preference
    const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    setTheme(systemTheme);
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  return (
    <div className="App">
      <AnimatePresence>
        {isLoading ? (
          <LoadingScreen onLoadComplete={handleLoadComplete} />
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            {!isMobile && <CursorTrail />}
            <Navigation
              cartCount={cart.length}
              onClearCart={clearCart}
              onCartClick={() => setIsCartOpen(true)}
              theme={theme}
              toggleTheme={toggleTheme}
            />
            <SplitScreenHero addToCart={addToCart} cart={cart} />
            <ProductCollection />
            <About />
            <Testimonials />
            <Newsletter />
            <Contact />
            <ScrollToTop />
            <CartDrawer
              isOpen={isCartOpen}
              onClose={() => setIsCartOpen(false)}
              cart={cart}
              onRemoveItem={removeFromCart}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default App;

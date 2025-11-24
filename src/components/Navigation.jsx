import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, ShoppingBag, Sun, Moon } from 'lucide-react';
import { cn } from '../lib/utils';
import { scroller } from 'react-scroll';

const navItems = [
  { name: 'Home', href: '#home' },
  { name: 'Collection', href: '#collection' },
  { name: 'About', href: '#about' },
  { name: 'Contact', href: '#contact' },
];

const Navigation = ({ cartCount = 0, onClearCart, onCartClick, theme, toggleTheme }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 24);
    handleScroll();
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Unified navigation click handler using react-scroll
  const handleNavClick = (href, isMobile = false) => {
    // Close mobile menu if needed
    if (isMobile) {
      setIsOpen(false);
      document.body.style.overflow = '';
    }

    const target = href.replace('#', '');

    // Special case for Home: scroll to top
    if (target === 'home') {
      scroller.scrollTo('home', {
        duration: 800,
        delay: 0,
        smooth: 'easeInOutQuart',
        offset: -70, // Offset for fixed header
      });
    } else {
      // Use react-scroll for other sections
      scroller.scrollTo(target, {
        duration: 800,
        delay: 0,
        smooth: 'easeInOutQuart',
        offset: -70, // Offset for fixed header
      });
    }

    // Update URL hash for consistency without causing jump
    if (typeof history !== 'undefined') {
      history.pushState(null, '', href);
    }
  };


  return (
    <motion.nav
      className={cn('site-nav', scrolled && 'site-nav--scrolled')}
      initial={{ y: -60, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
    >
      <div className="container site-nav__inner">
        <a href="#home" className="site-nav__brand" aria-label="Whiff Theory home" onClick={(e) => { e.preventDefault(); handleNavClick('#home'); }}>
          Whiff Theory
        </a>

        <div className="site-nav__links" role="menubar">
          {navItems.map((item) => (
            <motion.a
              key={item.name}
              href={item.href}
              className="site-nav__link"
              role="menuitem"
              whileHover={{ y: -4 }}
              whileTap={{ scale: 0.96 }}
              onClick={(e) => { e.preventDefault(); handleNavClick(item.href); }}
            >
              {item.name}
            </motion.a>
          ))}
        </div>

        <div className="site-nav__actions">
          {cartCount > 0 && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.96 }}
              className="button button--ghost site-nav__clear"
              onClick={onClearCart}
              style={{ marginRight: '0.5rem', fontSize: '0.8rem', opacity: 0.7 }}
            >
              Clear Cart
            </motion.button>
          )}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.96 }}
            className="button button--ghost site-nav__cart"
            onClick={onCartClick}
          >
            <ShoppingBag className="icon" aria-hidden="true" />
            <span>Cart</span>
            <span className="pill pill--count">{cartCount}</span>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.96 }}
            className="button button--ghost site-nav__theme-toggle"
            onClick={toggleTheme}
            aria-label="Toggle theme"
            style={{ marginLeft: '0.5rem', padding: '0.5rem' }}
          >
            {theme === 'dark' ? <Sun className="icon" /> : <Moon className="icon" />}
          </motion.button>
        </div>

        <button
          className="site-nav__toggle"
          onClick={() => setIsOpen((prev) => !prev)}
          aria-expanded={isOpen}
          aria-controls="mobile-navigation"
        >
          {isOpen ? <X className="icon" /> : <Menu className="icon" />}
          <span className="sr-only">Toggle navigation</span>
        </button>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            id="mobile-navigation"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="site-nav__mobile"
          >
            <div className="site-nav__mobile-inner">
              {navItems.map((item) => (
                <motion.a
                  key={item.name}
                  href={item.href}
                  className="site-nav__mobile-link"
                  onClick={(e) => { e.preventDefault(); handleNavClick(item.href, true); }}
                  whileHover={{ x: 8 }}
                  whileTap={{ scale: 0.97 }}
                >
                  {item.name}
                </motion.a>
              ))}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                className="button button--light"
                onClick={() => {
                  setIsOpen(false);
                  onCartClick();
                }}
              >
                <ShoppingBag className="icon" aria-hidden="true" />
                View Cart
              </motion.button>
              {/* Theme toggle button for mobile */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.96 }}
                className="button button--ghost site-nav__theme-toggle"
                onClick={toggleTheme}
                aria-label="Toggle theme"
                style={{ marginLeft: '0.5rem', padding: '0.5rem' }}
              >
                {theme === 'dark' ? <Sun className="icon" /> : <Moon className="icon" />}
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
};

export default Navigation;
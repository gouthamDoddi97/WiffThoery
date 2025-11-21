import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

// Reveal animation component
export const RevealOnScroll = ({ children, direction = 'up', delay = 0, className = '' }) => {
  const elementRef = useRef(null);

  useEffect(() => {
    const element = elementRef.current;
    
    const directions = {
      up: { y: 100, x: 0 },
      down: { y: -100, x: 0 },
      left: { y: 0, x: -100 },
      right: { y: 0, x: 100 }
    };

    gsap.fromTo(element, 
      { 
        opacity: 0, 
        ...directions[direction]
      },
      {
        opacity: 1,
        x: 0,
        y: 0,
        duration: 1,
        delay: delay,
        ease: "power3.out",
        scrollTrigger: {
          trigger: element,
          start: "top 85%",
          toggleActions: "play none none reverse"
        }
      }
    );

    return () => {
      ScrollTrigger.getAll().forEach(trigger => trigger.kill());
    };
  }, [direction, delay]);

  return (
    <div ref={elementRef} className={className}>
      {children}
    </div>
  );
};

// Stagger animation for multiple elements
export const StaggerReveal = ({ children, stagger = 0.2, className = '' }) => {
  const containerRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    const elements = container.children;

    gsap.fromTo(elements,
      { opacity: 0, y: 50 },
      {
        opacity: 1,
        y: 0,
        duration: 0.8,
        stagger: stagger,
        ease: "power3.out",
        scrollTrigger: {
          trigger: container,
          start: "top 85%",
          toggleActions: "play none none reverse"
        }
      }
    );

    return () => {
      ScrollTrigger.getAll().forEach(trigger => trigger.kill());
    };
  }, [stagger]);

  return (
    <div ref={containerRef} className={className}>
      {children}
    </div>
  );
};

// Text reveal animation
export const TextReveal = ({ text, className = '', delay = 0 }) => {
  const textRef = useRef(null);

  useEffect(() => {
    const element = textRef.current;
    const chars = element.querySelectorAll('.char');

    gsap.fromTo(chars,
      { opacity: 0, y: 100 },
      {
        opacity: 1,
        y: 0,
        duration: 0.8,
        stagger: 0.02,
        delay: delay,
        ease: "power3.out",
        scrollTrigger: {
          trigger: element,
          start: "top 85%",
          toggleActions: "play none none reverse"
        }
      }
    );

    return () => {
      ScrollTrigger.getAll().forEach(trigger => trigger.kill());
    };
  }, [delay]);

  const splitText = text.split('').map((char, index) => (
    <span key={index} className="char inline-block">
      {char === ' ' ? '\u00A0' : char}
    </span>
  ));

  return (
    <div ref={textRef} className={className}>
      {splitText}
    </div>
  );
};

// Parallax component
export const ParallaxElement = ({ children, speed = 0.5, className = '' }) => {
  const elementRef = useRef(null);

  useEffect(() => {
    const element = elementRef.current;

    ScrollTrigger.create({
      trigger: element,
      start: "top bottom",
      end: "bottom top",
      scrub: true,
      onUpdate: (self) => {
        const y = self.progress * speed * 100;
        gsap.set(element, { y: y });
      }
    });

    return () => {
      ScrollTrigger.getAll().forEach(trigger => trigger.kill());
    };
  }, [speed]);

  return (
    <div ref={elementRef} className={className}>
      {children}
    </div>
  );
};

export default {
  RevealOnScroll,
  StaggerReveal,
  TextReveal,
  ParallaxElement
};
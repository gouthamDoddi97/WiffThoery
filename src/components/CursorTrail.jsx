import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';

const CursorTrail = () => {
  const cursorRef = useRef(null);
  const followerRef = useRef(null);

  useEffect(() => {
    const cursor = cursorRef.current;
    const follower = followerRef.current;

    const moveCursor = (e) => {
      gsap.to(cursor, {
        x: e.clientX,
        y: e.clientY,
        duration: 0.1,
        ease: "power2.out"
      });
      
      gsap.to(follower, {
        x: e.clientX,
        y: e.clientY,
        duration: 0.3,
        ease: "power2.out"
      });
    };

    const hideCursor = () => {
      gsap.to([cursor, follower], {
        opacity: 0,
        duration: 0.2
      });
    };

    const showCursor = () => {
      gsap.to([cursor, follower], {
        opacity: 1,
        duration: 0.2
      });
    };

    // Add hover effects for interactive elements
    const interactiveElements = document.querySelectorAll('a, button, [role="button"]');
    
    const growCursor = () => {
      gsap.to(cursor, {
        scale: 0.5,
        duration: 0.2
      });
      gsap.to(follower, {
        scale: 2,
        duration: 0.2
      });
    };

    const shrinkCursor = () => {
      gsap.to(cursor, {
        scale: 1,
        duration: 0.2
      });
      gsap.to(follower, {
        scale: 1,
        duration: 0.2
      });
    };

    document.addEventListener('mousemove', moveCursor);
    document.addEventListener('mouseleave', hideCursor);
    document.addEventListener('mouseenter', showCursor);

    interactiveElements.forEach(el => {
      el.addEventListener('mouseenter', growCursor);
      el.addEventListener('mouseleave', shrinkCursor);
    });

    return () => {
      document.removeEventListener('mousemove', moveCursor);
      document.removeEventListener('mouseleave', hideCursor);
      document.removeEventListener('mouseenter', showCursor);
      
      interactiveElements.forEach(el => {
        el.removeEventListener('mouseenter', growCursor);
        el.removeEventListener('mouseleave', shrinkCursor);
      });
    };
  }, []);

  return (
    <>
      <div
        ref={cursorRef}
        className="cursor-dot"
        style={{ transform: 'translate(-50%, -50%)' }}
      />
      <div
        ref={followerRef}
        className="cursor-ring"
        style={{ transform: 'translate(-50%, -50%)' }}
      />
    </>
  );
};

export default CursorTrail;
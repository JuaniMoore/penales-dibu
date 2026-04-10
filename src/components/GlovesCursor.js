'use client';
import { useState, useEffect, forwardRef, useImperativeHandle, useRef } from 'react';

const GlovesCursor = forwardRef(({ caught }, ref) => {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const internalRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    // Starting position: Center of the screen
    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight / 2;
    setPosition({ x: centerX, y: centerY });
    internalRef.current = { x: centerX, y: centerY };

    const onMove = (x, y) => {
      setPosition({ x, y });
      internalRef.current = { x, y };
    };

    const onMouseMove = (e) => onMove(e.clientX, e.clientY);
    
    const onTouchMove = (e) => {
      if (e.touches.length > 0) {
        const touch = e.touches[0];
        onMove(touch.clientX, touch.clientY);
        // Prevent scrolling while playing
        if (e.cancelable) e.preventDefault();
      }
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('touchstart', onTouchMove);
    window.addEventListener('touchmove', onTouchMove, { passive: false });

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('touchstart', onTouchMove);
      window.removeEventListener('touchmove', onTouchMove);
    };
  }, []);

  // Expose the current position to the parent via ref
  useImperativeHandle(ref, () => ({
    getPosition: () => internalRef.current,
  }));

  return (
    <div
      style={{
        position: 'fixed',
        left: position.x,
        top: position.y,
        transform: `translate(-50%, -50%) scale(${caught ? 0.9 : 1})`,
        pointerEvents: 'none', // Critical so it doesn't block clicks
        zIndex: 9999,
        display: 'flex',
        gap: caught ? '5px' : '40px',
        opacity: 0.95,
        transition: 'gap 0.1s ease-out, transform 0.1s ease-out'
      }}
    >
      {/* Left Glove */}
      <img 
        src="/dibu_glove.png" 
        alt="Glove Left" 
        style={{ 
          width: '180px', 
          height: '180px', 
          transform: `scaleX(-1) rotate(${caught ? '10deg' : '-15deg'})`, // Flipped and angled outward, or straight down if caught
          filter: 'drop-shadow(0px 10px 10px rgba(0,0,0,0.5))',
          transition: 'transform 0.1s ease-out'
        }} 
      />
      {/* Right Glove */}
      <img 
        src="/dibu_glove.png" 
        alt="Glove Right" 
        style={{ 
          width: '180px', 
          height: '180px',
          transform: `rotate(${caught ? '10deg' : '-15deg'})`,
          filter: 'drop-shadow(0px 10px 10px rgba(0,0,0,0.5))',
          transition: 'transform 0.1s ease-out'
        }} 
      />
    </div>
  );
});

GlovesCursor.displayName = 'GlovesCursor';

export default GlovesCursor;

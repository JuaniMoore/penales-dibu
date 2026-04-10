'use client';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

export default function Ball({ duration, targetX, targetY, onReachGoal }) {
  const [windowSize, setWindowSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    setWindowSize({ width: window.innerWidth, height: window.innerHeight });
  }, []);

  if (!windowSize.width) return null;

  const startX = windowSize.width / 2;
  const startY = windowSize.height / 2 + 100; // slightly lower than center, simulating ground

  return (
    <motion.div
      initial={{ 
        x: startX, 
        y: startY, 
        scale: 0.2, // Small in the distance
        opacity: 1
      }}
      animate={{ 
        x: targetX, 
        y: targetY, 
        scale: 1, // Big when it reaches the goal
        rotate: 720 // Realistic spin
      }}
      transition={{ 
        duration: duration / 1000, 
        ease: "easeIn" // Accelerates as it gets closer
      }}
      onAnimationComplete={onReachGoal}
      style={{
        position: 'absolute',
        top: 0, left: 0,
        width: '140px', // Slightly smaller
        height: '140px',
        marginLeft: '-70px',
        marginTop: '-70px',
        zIndex: 5,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: '50%',
        background: 'url("/match_ball_custom.png") no-repeat center center',
        backgroundSize: '105%', // Crop white fringes
        overflow: 'hidden',
        filter: 'drop-shadow(0 20px 30px rgba(0,0,0,0.8))',
      }}
    />
  );
}

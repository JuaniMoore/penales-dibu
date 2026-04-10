'use client';
import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';

export default function TrashTalkTrivia({ onResult }) {
  const [timeLeft, setTimeLeft] = useState(100); // 100%
  const [selected, setSelected] = useState(false);

  const PHRASE_POOL = [
    "¡Mirá que te como, hermano!",
    "¡Estás nervioso, eh!",
    "Te gusta esperar, ¿no?",
    "Hacete el boludo, yo te conozco",
    "¡Mirame a la cara!",
    "Yo ya te conozco a vos",
    "¡Patealo si tenés huevos!",
    "Mirá el arco que chiquito está",
    "¡Te gusta mirar!",
    "¡Estás cagado!",
    "¡Te como, hermano, te como!",
    "¡Dale, patealo!",
    "¡Lo siento pero te como!"
  ];

  const colors = ['btn-red', 'btn-blue', 'btn-yellow', 'btn-green'];

  const [options, setOptions] = useState([]);
  const [correctIndex, setCorrectIndex] = useState(0);

  const handleTimeOut = useCallback(() => {
    setSelected(true);
    onResult(false);
  }, [onResult]);

  const handleSelect = useCallback((index) => {
    if (selected) return;
    setSelected(true);
    if (index === correctIndex) {
      onResult(true);
    } else {
      onResult(false);
    }
  }, [selected, correctIndex, onResult]);

  useEffect(() => {
    // Shuffle pool and pick 4
    const shuffled = [...PHRASE_POOL].sort(() => 0.5 - Math.random());
    const selectedPhrases = shuffled.slice(0, 4);

    const newOptions = selectedPhrases.map((phrase, index) => ({
      text: phrase,
      color: colors[index % colors.length]
    }));

    setOptions(newOptions);
    setCorrectIndex(Math.floor(Math.random() * 4));

    // Timer starts: drops to 0 in 6000ms
    const intervalTime = 30; // ms
    const dropAmount = (100 / 6000) * intervalTime;

    const interval = setInterval(() => {
      setTimeLeft(prev => {
        const next = prev - dropAmount;
        if (next <= 0) {
          clearInterval(interval);
          return 0;
        }
        return next;
      });
    }, intervalTime);

    return () => clearInterval(interval);
  }, [selected]);

  useEffect(() => {
    if (timeLeft <= 0 && !selected) {
      handleTimeOut();
    }
  }, [timeLeft, selected, handleTimeOut]);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 10, width: '100%' }}
    >
      <div className="timer-bar-container">
        <div className="timer-bar" style={{ width: `${timeLeft}%` }} />
      </div>

      <div className="kahoot-grid">
        {options.length > 0 && options.map((opt, i) => (
          <button
            key={i}
            className={`kahoot-btn ${opt.color}`}
            onClick={() => handleSelect(i)}
            disabled={selected}
          >
            {opt.text}
          </button>
        ))}
      </div>
    </motion.div>
  );
}

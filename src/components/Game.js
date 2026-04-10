'use client';
import { useState, useRef, useEffect } from 'react';
import TrashTalkTrivia from './TrashTalkTrivia';
import GlovesCursor from './GlovesCursor';
import Ball from './Ball';

export default function Game() {
  const [phase, setPhase] = useState('LOBBY');
  const [round, setRound] = useState(1);
  const [points, setPoints] = useState(0);
  const [saves, setSaves] = useState(0);
  const [feedbackMsg, setFeedbackMsg] = useState('');

  // Ball states
  const [ballSpeed, setBallSpeed] = useState(1800);
  const [ballTarget, setBallTarget] = useState({ x: 0, y: 0 });

  const glovesRef = useRef();

  useEffect(() => {
    if (phase === 'PATEANDO') {
      // Calculate random target for ball
      const winW = window.innerWidth;
      const winH = window.innerHeight;

      let tx, ty;
      if (ballSpeed === 1800) {
        // Slow ball -> center area
        tx = winW / 2 + (Math.random() * 200 - 100);
        ty = winH / 2 + (Math.random() * 100 - 50);
      } else {
        // Fast ball -> corners, sometimes going out!
        const cornerX = Math.random() > 0.5 ? winW * 0.15 : winW * 0.85;
        const cornerY = Math.random() > 0.5 ? winH * 0.25 : winH * 0.75;
        tx = cornerX + (Math.random() * 200 - 100); // 100px variance can put it OUTSIDE
        ty = cornerY + (Math.random() * 150 - 75);
      }
      setBallTarget({ x: tx, y: ty });
    }
  }, [phase, ballSpeed]);

  const [isNetHitting, setIsNetHitting] = useState(false);

  useEffect(() => {
    if (feedbackMsg === '¡GOL!') {
      setIsNetHitting(true);
      const timer = setTimeout(() => setIsNetHitting(false), 800);
      return () => clearTimeout(timer);
    }
  }, [feedbackMsg]);

  const handleTriviaResult = (isCorrect) => {
    if (isCorrect) {
      setFeedbackMsg('¡LO ACHICASTE!');
      setBallSpeed(1800); // Lenta
    } else {
      setFeedbackMsg('¡SE AGRANDÓ!');
      setBallSpeed(600); // Rápida
    }

    // Show feedback, then proceed to kick
    setTimeout(() => {
      setFeedbackMsg('');
      setPhase('PATEANDO');
    }, 1500);
  };

  const handleReachGoal = () => {
    const glovesPos = glovesRef.current?.getPosition() || { x: 0, y: 0 };
    setPhase('COLISION');

    // Calculate distance
    const dist = Math.sqrt(
      Math.pow(glovesPos.x - ballTarget.x, 2) + Math.pow(glovesPos.y - ballTarget.y, 2)
    );

    // Hitbox circular logic: If within 150px = saved (atajada)
    const HITBOX_RADIUS = 150;
    let atajada = dist <= HITBOX_RADIUS;

    // Bounds check for the physical goal
    const winW = window.innerWidth;
    const winH = window.innerHeight;
    const goalLeft = winW * 0.15;
    const goalRight = winW * 0.85;
    const goalTop = winH * 0.5 - (winH * 0.6) / 2;
    const goalBottom = winH * 0.5 + (winH * 0.6) / 2;

    // Decrease radius manually to adjust the center vs edge of the ball
    const isInsideGoal =
      ballTarget.x >= goalLeft &&
      ballTarget.x <= goalRight &&
      ballTarget.y >= goalTop &&
      ballTarget.y <= goalBottom;

    if (atajada) {
      setFeedbackMsg('¡ATAJADA!');
      setSaves(s => s + 1);
      // Fixed points for any save
      setPoints(p => p + 500);
    } else if (!isInsideGoal) {
      setFeedbackMsg('¡AFUERA!');
      // 0 points, lucky but not caught
    } else {
      setFeedbackMsg('¡GOL!');
    }

    setTimeout(() => {
      setFeedbackMsg('');
      // Proceed to next round or finish
      if (round < 3) {
        setRound(r => r + 1);
        setPhase('KAHOOT_TRASH_TALK');
      } else {
        setPhase('FIN');
      }
    }, 2000);
  };

  const handleFinish = () => {
    window.parent.postMessage({ type: 'SUMAR_PUNTOS', payload: points }, '*');
    // Just in case we also reset UI locally
    setPhase('KAHOOT_TRASH_TALK');
    setRound(1);
    setPoints(0);
    setSaves(0);
  };

  const resetGame = () => {
    setPhase('LOBBY');
    setRound(1);
    setPoints(0);
    setSaves(0);
  };

  return (
    <div className={`game-area ${phase !== 'FIN' && phase !== 'LOBBY' ? 'hide-cursor' : ''}`}>
      {/* Background Goal View */}
      <div className="goal-frame">
        <div className="post left-post"></div>
        <div className="post right-post"></div>
        <div className="crossbar"></div>
        <div className={`net ${isNetHitting ? 'hit' : ''}`}></div>
      </div>

      <div className="hud-container">
        <div className="hud-badge points-badge">
          <span className="hud-label">PUNTOS</span>
          <span className="hud-value" key={points}>{points}</span>
        </div>
        <div className="hud-badge round-badge">
          <span className="hud-label">PENAL</span>
          <span className="hud-value">{round} / 3</span>
        </div>
      </div>

      {feedbackMsg && (
        <div className="feedback">
          {feedbackMsg}
        </div>
      )}

      {/* Gloves follow cursor everywhere */}
      {phase !== 'FIN' && phase !== 'LOBBY' && <GlovesCursor ref={glovesRef} caught={feedbackMsg === '¡ATAJADA!'} />}

      {/* Phase Render */}
      {phase === 'LOBBY' && (
        <div className="lobby-screen">
          <h1>Mirá que te como</h1>
          <p className="rules-text">
            Elegí rápido la frase correcta para "achicar" al rival. ¡Luego usá el mouse para mover los guantes y atajar el tiro antes de que sea gol!
          </p>
          <button className="play-btn" onClick={() => setPhase('KAHOOT_TRASH_TALK')}>
            JUGAR
          </button>
        </div>
      )}

      {/* Phase Render */}
      {phase === 'KAHOOT_TRASH_TALK' && !feedbackMsg && (
        <TrashTalkTrivia onResult={handleTriviaResult} />
      )}

      {(phase === 'PATEANDO' || phase === 'COLISION') && (
        <Ball
          duration={ballSpeed}
          targetX={ballTarget.x}
          targetY={ballTarget.y}
          onReachGoal={phase === 'PATEANDO' ? handleReachGoal : undefined}
        />
      )}

      {phase === 'FIN' && <div className="end-overlay" />}

      {phase === 'FIN' && (
        <div className="end-screen">
          <h1 className="end-title">¡Terminaron los Penales!</h1>
          
          <div className="final-score-container">
            <span className="score-label">Puntaje Total</span>
            <div className="score-value">{points}</div>
            <div className="saves-summary">
              {saves} de 3 penales atajados
            </div>
          </div>

          <div className="end-actions">
            <button className="carnet-btn" onClick={handleFinish}>
              Enviar al Carnet
            </button>
            <button className="restart-btn" onClick={resetGame}>
              Volver a Jugar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

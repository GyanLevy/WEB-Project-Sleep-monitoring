import { useMemo } from 'react';

/**
 * Confetti Component
 * Animated confetti overlay for celebratory screens.
 */

// Pre-generate confetti data for consistent rendering
const generateConfettiData = () => {
  const colors = ['#4F46E5', '#7C3AED', '#EC4899', '#F59E0B', '#10B981'];
  return Array.from({ length: 50 }, (_, i) => ({
    id: i,
    left: `${Math.random() * 100}%`,
    animationDelay: `${Math.random() * 2}s`,
    animationDuration: `${3 + Math.random() * 2}s`,
    backgroundColor: colors[Math.floor(Math.random() * 5)],
    rotation: `rotate(${Math.random() * 360}deg)`,
  }));
};

export default function Confetti({ show }) {
  // Generate confetti data once using useMemo
  const confettiData = useMemo(() => generateConfettiData(), []);

  if (!show) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-50">
      {confettiData.map((confetti) => (
        <div
          key={confetti.id}
          className="absolute animate-confetti"
          style={{
            left: confetti.left,
            top: '-20px',
            animationDelay: confetti.animationDelay,
            animationDuration: confetti.animationDuration,
          }}
        >
          <div
            className="w-3 h-3 rounded-sm"
            style={{
              backgroundColor: confetti.backgroundColor,
              transform: confetti.rotation,
            }}
          />
        </div>
      ))}
    </div>
  );
}

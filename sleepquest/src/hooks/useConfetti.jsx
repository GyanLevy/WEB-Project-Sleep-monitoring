import { useState, useEffect } from 'react';

/**
 * useConfetti Hook
 * Manages confetti animation state with automatic cleanup.
 * @param {number} duration - Duration in ms before hiding confetti (default: 5000)
 * @returns {boolean} - Whether confetti should be shown
 */
export function useConfetti(duration = 5000) {
  const [showConfetti, setShowConfetti] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setShowConfetti(false), duration);
    return () => clearTimeout(timer);
  }, [duration]);

  return showConfetti;
}

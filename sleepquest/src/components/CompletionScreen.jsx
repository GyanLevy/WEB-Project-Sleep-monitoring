import { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import StreakDisplay from './StreakDisplay';

// Pre-generate confetti data outside of render
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

export default function CompletionScreen() {
  const { token, streak, completedDays, isAuthenticated, hasSubmittedToday } = useAuth();
  const navigate = useNavigate();
  const [showConfetti, setShowConfetti] = useState(true);
  
  // Generate confetti data once using useMemo
  const confettiData = useMemo(() => generateConfettiData(), []);

  useEffect(() => {
    // Redirect if not authenticated or hasn't submitted today
    if (!isAuthenticated) {
      navigate('/');
      return;
    }

    if (!hasSubmittedToday()) {
      navigate('/diary');
      return;
    }

    // Hide confetti after animation
    const timer = setTimeout(() => setShowConfetti(false), 5000);
    return () => clearTimeout(timer);
  }, [isAuthenticated, hasSubmittedToday, navigate]);

  const handleGameAccess = () => {
    // Redirect to external game URL with token
    const gameUrl = `https://sleepquest.game/start/${token}`;
    window.open(gameUrl, '_blank', 'noopener,noreferrer');
  };

  const isCompleted = completedDays >= 10;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Confetti Animation */}
      {showConfetti && (
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
      )}

      {/* Background glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-indigo-500/20 to-purple-500/20 rounded-full blur-3xl animate-pulse-slow" />
      </div>

      <div className="relative z-10 w-full max-w-md text-center">
        {/* Success Icon */}
        <div className="mb-8">
          <div className="inline-flex items-center justify-center w-28 h-28 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 shadow-2xl shadow-green-500/40 animate-bounce-slow">
            <svg className="w-14 h-14 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          </div>
        </div>

        {/* Congratulations Message */}
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
          {isCompleted ? '🏆 אלוף!' : '🎉 כל הכבוד!'}
        </h1>
        
        <p className="text-xl text-slate-300 mb-8">
          {isCompleted 
            ? "סיימת את כל 10 ימי האתגר!"
            : "סיימת את יומן השינה להיום!"
          }
        </p>

        {/* Streak Display */}
        <div className="mb-8">
          <StreakDisplay />
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="bg-slate-800/50 backdrop-blur-xl rounded-xl border border-slate-700/50 p-4">
            <div className="text-3xl font-bold text-white">{completedDays}</div>
            <div className="text-slate-400 text-sm">ימים שהושלמו</div>
          </div>
          <div className="bg-slate-800/50 backdrop-blur-xl rounded-xl border border-slate-700/50 p-4">
            <div className="text-3xl font-bold text-white">{streak}</div>
            <div className="text-slate-400 text-sm">ימים ברצף 🔥</div>
          </div>
        </div>

        {/* Game Access Button */}
        <button
          onClick={handleGameAccess}
          className="w-full py-5 px-6 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-white font-bold text-lg rounded-xl shadow-lg shadow-amber-500/30 hover:shadow-amber-500/50 transition-all duration-300 transform hover:scale-[1.02] mb-4 flex items-center justify-center gap-3"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          כניסה למשחק היומי
        </button>

        <p className="text-slate-500 text-sm">
          שחק את משחק הפרס היומי שלך וצבור נקודות בונוס!
        </p>

        {/* Come back tomorrow message */}
        {!isCompleted && (
          <div className="mt-8 p-4 bg-indigo-500/10 border border-indigo-500/30 rounded-xl">
            <p className="text-indigo-300 text-sm">
              ⏰ חזור מחר כדי להמשיך את הרצף שלך!<br/>
              <span className="text-indigo-400/70">היומן הבא יהיה זמין לאחר חצות.</span>
            </p>
          </div>
        )}

        {/* Token reminder */}
        <div className="mt-6 text-slate-600 text-xs" style={{ direction: 'ltr' }}>
          קוד הגישה שלך: <span className="font-mono">{token}</span>
        </div>
      </div>
    </div>
  );
}

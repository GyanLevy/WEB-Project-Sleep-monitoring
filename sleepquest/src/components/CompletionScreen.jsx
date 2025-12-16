import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useConfetti } from '../hooks/useConfetti';
import { Confetti, StatsCard } from './ui';
import StreakDisplay from './StreakDisplay';

/**
 * CompletionScreen Component
 * Displayed after successfully submitting a daily sleep diary.
 * Shows celebration animation, stats, and game access.
 */
export default function CompletionScreen() {
  const { token, streak, completedDays, isAuthenticated, hasSubmittedToday } = useAuth();
  const navigate = useNavigate();
  const showConfetti = useConfetti(5000);

  // Redirect if not authenticated or hasn't submitted today
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/');
      return;
    }

    if (!hasSubmittedToday()) {
      navigate('/diary');
      return;
    }
  }, [isAuthenticated, hasSubmittedToday, navigate]);

  const handleGameAccess = () => {
    const gameUrl = `https://sleepquest.game/start/${token}`;
    window.open(gameUrl, '_blank', 'noopener,noreferrer');
  };

  const isCompleted = completedDays >= 10;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Confetti Animation */}
      <Confetti show={showConfetti} />

      {/* Background glow */}
      <BackgroundGlow />

      <div className="relative z-10 w-full max-w-md text-center">
        {/* Success Icon */}
        <SuccessIcon />

        {/* Congratulations Message */}
        <CongratulationsMessage isCompleted={isCompleted} />

        {/* Streak Display */}
        <div className="mb-8">
          <StreakDisplay />
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          <StatsCard value={completedDays} label="ימים שהושלמו" />
          <StatsCard value={streak} label="ימים ברצף 🔥" />
        </div>

        {/* Game Access Button */}
        <GameAccessButton onClick={handleGameAccess} />

        <p className="text-slate-500 text-sm">
          שחק את משחק הפרס היומי שלך וצבור נקודות בונוס!
        </p>

        {/* Come back tomorrow message */}
        {!isCompleted && <ComeBackMessage />}

        {/* Token reminder */}
        <div className="mt-6 text-slate-600 text-xs" style={{ direction: 'ltr' }}>
          קוד הגישה שלך: <span className="font-mono">{token}</span>
        </div>
      </div>
    </div>
  );
}

/**
 * BackgroundGlow Component
 * Animated background glow effect.
 */
function BackgroundGlow() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-indigo-500/20 to-purple-500/20 rounded-full blur-3xl animate-pulse-slow" />
    </div>
  );
}

/**
 * SuccessIcon Component
 * Animated checkmark icon for success state.
 */
function SuccessIcon() {
  return (
    <div className="mb-8">
      <div className="inline-flex items-center justify-center w-28 h-28 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 shadow-2xl shadow-green-500/40 animate-bounce-slow">
        <svg className="w-14 h-14 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
        </svg>
      </div>
    </div>
  );
}

/**
 * CongratulationsMessage Component
 * Dynamic message based on completion status.
 */
function CongratulationsMessage({ isCompleted }) {
  return (
    <>
      <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
        {isCompleted ? '🏆 אלוף!' : '🎉 כל הכבוד!'}
      </h1>
      
      <p className="text-xl text-slate-300 mb-8">
        {isCompleted 
          ? "סיימת את כל 10 ימי האתגר!"
          : "סיימת את יומן השינה להיום!"
        }
      </p>
    </>
  );
}

/**
 * GameAccessButton Component
 * Button to access the daily game reward.
 */
function GameAccessButton({ onClick }) {
  return (
    <button
      onClick={onClick}
      className="w-full py-5 px-6 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-white font-bold text-lg rounded-xl shadow-lg shadow-amber-500/30 hover:shadow-amber-500/50 transition-all duration-300 transform hover:scale-[1.02] mb-4 flex items-center justify-center gap-3"
    >
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      כניסה למשחק היומי
    </button>
  );
}

/**
 * ComeBackMessage Component
 * Reminder to return tomorrow when challenge not complete.
 */
function ComeBackMessage() {
  return (
    <div className="mt-8 p-4 bg-indigo-500/10 border border-indigo-500/30 rounded-xl">
      <p className="text-indigo-300 text-sm">
        ⏰ חזור מחר כדי להמשיך את הרצף שלך!<br/>
        <span className="text-indigo-400/70">היומן הבא יהיה זמין לאחר חצות.</span>
      </p>
    </div>
  );
}

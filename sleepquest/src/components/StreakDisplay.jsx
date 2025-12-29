import { useAuth } from '../context/AuthContext';

export default function StreakDisplay({ compact = false }) {
  const { streak, totalDays, completedDays } = useAuth();

  const progressPercent = (completedDays / totalDays) * 100;

  if (compact) {
    return (
      <div className="flex items-center gap-2 px-4 py-2 bg-white/80 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700/50 transition-colors duration-300">
        <span className="text-2xl">🔥</span>
        <div className="text-slate-900 dark:text-white font-bold transition-colors duration-300">{streak}</div>
        <span className="text-slate-500 dark:text-slate-400 text-sm transition-colors duration-300">ימים</span>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-white/80 to-slate-50/80 dark:from-slate-800/80 dark:to-slate-900/80 backdrop-blur-xl rounded-2xl border border-slate-200 dark:border-slate-700/50 p-6 shadow-lg dark:shadow-xl transition-colors duration-300">
      {/* Streak counter */}
      <div className="flex items-center justify-center gap-4 mb-6">
        <div className="relative">
          <div className="text-6xl animate-bounce-slow">🔥</div>
          <div className="absolute -top-1 -left-1 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs font-bold px-2 py-1 rounded-full">
            {streak}
          </div>
        </div>
        <div className="text-right">
          <div className="text-3xl font-bold text-slate-900 dark:text-white transition-colors duration-300">יום {completedDays + 1}</div>
          <div className="text-slate-500 dark:text-slate-400 transition-colors duration-300">מתוך {totalDays}</div>
        </div>
      </div>

      {/* Progress bar */}
      <div className="relative">
        <div className="h-4 bg-slate-200 dark:bg-slate-700/50 rounded-full overflow-hidden transition-colors duration-300">
          <div
            className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-full transition-all duration-1000 ease-out relative"
            style={{ width: `${progressPercent}%` }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer"></div>
          </div>
        </div>

        {/* Day markers */}
        <div className="flex justify-between mt-2">
          {Array.from({ length: totalDays }, (_, i) => (
            <div
              key={i}
              className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${
                i < completedDays
                  ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-lg shadow-indigo-500/30'
                  : i === completedDays
                  ? 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-white ring-2 ring-indigo-500 ring-offset-2 ring-offset-white dark:ring-offset-slate-900'
                  : 'bg-slate-100 dark:bg-slate-700/50 text-slate-400 dark:text-slate-500'
              }`}
            >
              {i + 1}
            </div>
          ))}
        </div>
      </div>

      {/* Motivational message */}
      <div className="mt-6 text-center">
        <p className="text-slate-600 dark:text-slate-300 text-sm transition-colors duration-300">
          {streak === 0 && "התחל את המסע שלך היום! 🌙"}
          {streak === 1 && "התחלה מצוינת! המשך כך! ⭐"}
          {streak >= 2 && streak < 5 && "אתה בונה הרגל נהדר! 🌟"}
          {streak >= 5 && streak < 8 && "עקביות מדהימה! כמעט שם! 🏆"}
          {streak >= 8 && streak < 10 && "מדהים! אתה אלוף שינה! 👑"}
          {streak >= 10 && "אגדה! השלמת את האתגר! 🎉"}
        </p>
      </div>
    </div>
  );
}

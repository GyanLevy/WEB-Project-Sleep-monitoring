/**
 * StatsCard Component
 * Reusable statistics display card with consistent styling.
 */
export default function StatsCard({ value, label }) {
  return (
    <div className="bg-white/80 dark:bg-slate-800/50 backdrop-blur-xl rounded-xl border border-slate-200 dark:border-slate-700/50 p-4 transition-colors duration-300">
      <div className="text-3xl font-bold text-slate-900 dark:text-white transition-colors duration-300">{value}</div>
      <div className="text-slate-500 dark:text-slate-400 text-sm transition-colors duration-300">{label}</div>
    </div>
  );
}

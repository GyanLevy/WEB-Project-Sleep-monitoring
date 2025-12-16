/**
 * StatsCard Component
 * Reusable statistics display card with consistent styling.
 */
export default function StatsCard({ value, label }) {
  return (
    <div className="bg-slate-800/50 backdrop-blur-xl rounded-xl border border-slate-700/50 p-4">
      <div className="text-3xl font-bold text-white">{value}</div>
      <div className="text-slate-400 text-sm">{label}</div>
    </div>
  );
}

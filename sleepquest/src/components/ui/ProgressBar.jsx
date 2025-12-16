/**
 * ProgressBar Component
 * Displays questionnaire progress with percentage and question count.
 */
export default function ProgressBar({ 
  currentIndex, 
  totalQuestions, 
  progress 
}) {
  return (
    <div className="px-4 mb-6">
      <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>
      <div className="flex justify-between mt-2 text-xs text-slate-500">
        <span>שאלה {currentIndex + 1} מתוך {totalQuestions}</span>
        <span>{Math.round(progress)}%</span>
      </div>
    </div>
  );
}

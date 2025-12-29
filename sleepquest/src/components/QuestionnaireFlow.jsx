import { useQuestionnaireLogic } from '../hooks/useQuestionnaireLogic';
import { LoadingSpinner, ProgressBar, QuestionInput, ThemeToggle } from './ui';
import StreakDisplay from './StreakDisplay';

/**
 * QuestionnaireFlow Component
 * Main questionnaire screen that guides users through sleep diary questions.
 * Logic extracted to useQuestionnaireLogic hook for separation of concerns.
 */
export default function QuestionnaireFlow() {
  const {
    currentQuestion,
    currentIndex,
    answers,
    isTransitioning,
    direction,
    isSubmitting,
    questions,
    progress,
    isLastQuestion,
    canProceed,
    completedDays,
    totalDays,
    handleAnswer,
    handleNext,
    handleBack
  } = useQuestionnaireLogic();

  // Loading state when no question available
  if (!currentQuestion) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50 to-slate-100 dark:from-slate-900 dark:via-indigo-950 dark:to-slate-900 flex items-center justify-center transition-colors duration-300">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50 to-slate-100 dark:from-slate-900 dark:via-indigo-950 dark:to-slate-900 flex flex-col transition-colors duration-300">
      {/* Header */}
      <QuestionnaireHeader 
        currentIndex={currentIndex}
        completedDays={completedDays}
        totalDays={totalDays}
        onBack={handleBack}
      />

      {/* Progress bar */}
      <ProgressBar 
        currentIndex={currentIndex}
        totalQuestions={questions.length}
        progress={progress}
      />

      {/* Question Card */}
      <div className="flex-1 px-4 flex flex-col">
        <QuestionCard
          question={currentQuestion}
          answer={answers[currentQuestion.id]}
          isTransitioning={isTransitioning}
          direction={direction}
          onAnswer={handleAnswer}
        />

        {/* Navigation */}
        <NavigationButton
          isLastQuestion={isLastQuestion}
          isSubmitting={isSubmitting}
          canProceed={canProceed}
          onNext={handleNext}
        />
      </div>
    </div>
  );
}

/**
 * QuestionnaireHeader Component
 * Header with back button, title, and streak display.
 */
function QuestionnaireHeader({ currentIndex, completedDays, totalDays, onBack }) {
  return (
    <header className="p-4 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <button
          onClick={onBack}
          disabled={currentIndex === 0}
          className="p-2 text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
        <ThemeToggle />
      </div>
      
      <div className="text-center">
        <h1 className="text-slate-900 dark:text-white font-bold transition-colors duration-300">יומן שינה</h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm transition-colors duration-300">יום {completedDays + 1} מתוך {totalDays}</p>
      </div>

      <StreakDisplay compact />
    </header>
  );
}

/**
 * QuestionCard Component
 * Displays the current question with transition animations.
 */
function QuestionCard({ question, answer, isTransitioning, direction, onAnswer }) {
  return (
    <div
      className={`flex-1 flex flex-col transition-all duration-300 ${
        isTransitioning
          ? direction === 'next'
            ? 'opacity-0 -translate-x-8'
            : 'opacity-0 translate-x-8'
          : 'opacity-100 translate-x-0'
      }`}
    >
      {/* Question Text */}
      <div className="mb-8">
        <span className="inline-block px-4 py-2 bg-indigo-100 dark:bg-indigo-500/20 text-2xl rounded-full mb-4 transition-colors duration-300">
          {question.emoji || '📝'}
        </span>
        <h2 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white leading-relaxed transition-colors duration-300">
          {question.text_he}
        </h2>
      </div>

      {/* Input Area */}
      <div className="flex-1">
        <QuestionInput
          question={question}
          value={answer}
          onChange={onAnswer}
        />
      </div>
    </div>
  );
}

/**
 * NavigationButton Component
 * Submit/Next button with loading state.
 */
function NavigationButton({ isLastQuestion, isSubmitting, canProceed, onNext }) {
  return (
    <div className="py-6">
      <button
        onClick={onNext}
        disabled={!canProceed || isSubmitting}
        className="w-full py-4 px-6 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 disabled:from-slate-400 disabled:to-slate-400 dark:disabled:from-slate-700 dark:disabled:to-slate-700 disabled:cursor-not-allowed text-white font-semibold rounded-xl shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 disabled:shadow-none transition-all duration-300 transform hover:scale-[1.02] disabled:hover:scale-100"
      >
        {isSubmitting ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            שומר...
          </span>
        ) : isLastQuestion ? (
          'שלח יומן שינה 🎉'
        ) : (
          'המשך'
        )}
      </button>
    </div>
  );
}

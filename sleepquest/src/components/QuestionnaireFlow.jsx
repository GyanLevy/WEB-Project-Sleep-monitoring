import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import StreakDisplay from './StreakDisplay';
import questionsData from '../data/questions.json';

export default function QuestionnaireFlow() {
  const { submitDiary, hasSubmittedToday, completedDays, totalDays } = useAuth();
  const navigate = useNavigate();
  
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [direction, setDirection] = useState('next');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Filter questions based on conditional logic
  const questions = useMemo(() => {
    return questionsData.filter(q => {
      // If question has a condition, check if it should be shown
      if (q.conditional_on) {
        const dependsOnAnswer = answers[q.conditional_on];
        if (!dependsOnAnswer) return false;
        return q.condition_value.includes(dependsOnAnswer);
      }
      return true;
    });
  }, [answers]);

  // Check if already submitted today - redirect in effect
  useEffect(() => {
    if (hasSubmittedToday()) {
      navigate('/complete');
    }
  }, [hasSubmittedToday, navigate]);

  const currentQuestion = questions[currentIndex];
  const progress = questions.length > 0 ? ((currentIndex + 1) / questions.length) * 100 : 0;
  const isLastQuestion = currentIndex === questions.length - 1;

  const handleAnswer = (value) => {
    setAnswers(prev => ({
      ...prev,
      [currentQuestion.id]: value
    }));
  };

  const handleNext = () => {
    if (!answers[currentQuestion.id]) return;
    
    if (isLastQuestion) {
      handleSubmit();
    } else {
      setDirection('next');
      setIsTransitioning(true);
      setTimeout(() => {
        setCurrentIndex(prev => prev + 1);
        setIsTransitioning(false);
      }, 300);
    }
  };

  const handleBack = () => {
    if (currentIndex === 0) return;
    setDirection('back');
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentIndex(prev => prev - 1);
      setIsTransitioning(false);
    }, 300);
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    const result = await submitDiary(answers);
    if (result.success) {
      navigate('/complete');
    } else {
      alert(result.error);
      setIsSubmitting(false);
    }
  };

  if (!currentQuestion) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 flex flex-col">
      {/* Header */}
      <header className="p-4 flex items-center justify-between">
        <button
          onClick={handleBack}
          disabled={currentIndex === 0}
          className="p-2 text-slate-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
        
        <div className="text-center">
          <h1 className="text-white font-bold">יומן שינה</h1>
          <p className="text-slate-400 text-sm">יום {completedDays + 1} מתוך {totalDays}</p>
        </div>

        <StreakDisplay compact />
      </header>

      {/* Progress bar */}
      <div className="px-4 mb-6">
        <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="flex justify-between mt-2 text-xs text-slate-500">
          <span>שאלה {currentIndex + 1} מתוך {questions.length}</span>
          <span>{Math.round(progress)}%</span>
        </div>
      </div>

      {/* Question Card */}
      <div className="flex-1 px-4 flex flex-col">
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
            <span className="inline-block px-3 py-1 bg-indigo-500/20 text-indigo-400 text-xs font-medium rounded-full mb-4">
              📝 בחירה
            </span>
            <h2 className="text-2xl md:text-3xl font-bold text-white leading-relaxed">
              {currentQuestion.text_he}
            </h2>
          </div>

          {/* Input Area */}
          <div className="flex-1">
            <QuestionInput
              question={currentQuestion}
              value={answers[currentQuestion.id]}
              onChange={handleAnswer}
            />
          </div>
        </div>

        {/* Navigation */}
        <div className="py-6">
          <button
            onClick={handleNext}
            disabled={!answers[currentQuestion.id] || isSubmitting}
            className="w-full py-4 px-6 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 disabled:from-slate-700 disabled:to-slate-700 disabled:cursor-not-allowed text-white font-semibold rounded-xl shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 disabled:shadow-none transition-all duration-300 transform hover:scale-[1.02] disabled:hover:scale-100"
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
      </div>
    </div>
  );
}

// Question Input Component
function QuestionInput({ question, value, onChange }) {
  switch (question.type) {
    case 'time':
      return (
        <div className="flex justify-center">
          <input
            type="time"
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            className="text-4xl font-mono bg-slate-800/50 border-2 border-slate-700 focus:border-indigo-500 rounded-2xl px-8 py-6 text-white text-center outline-none transition-colors"
            style={{ direction: 'ltr' }}
          />
        </div>
      );

    case 'number':
      return (
        <div className="flex flex-col items-center gap-4">
          <div className="flex items-center gap-6">
            <button
              onClick={() => onChange(Math.max(0, (value || 0) - 5))}
              className="w-16 h-16 rounded-full bg-slate-800 hover:bg-slate-700 text-white text-3xl font-bold transition-colors flex items-center justify-center"
            >
              −
            </button>
            <div className="w-32 text-center">
              <input
                type="number"
                value={value ?? ''}
                onChange={(e) => {
                  const val = parseInt(e.target.value) || 0;
                  onChange(Math.max(0, val));
                }}
                className="w-full text-5xl font-bold bg-transparent text-white text-center outline-none"
                style={{ direction: 'ltr' }}
                min={0}
              />
              {question.unit_he && (
                <span className="text-slate-400 text-sm">{question.unit_he}</span>
              )}
            </div>
            <button
              onClick={() => onChange((value || 0) + 5)}
              className="w-16 h-16 rounded-full bg-slate-800 hover:bg-slate-700 text-white text-3xl font-bold transition-colors flex items-center justify-center"
            >
              +
            </button>
          </div>
        </div>
      );

    case 'radio':
      return (
        <div className="space-y-3">
          {question.options_he.map((option) => (
            <button
              key={option}
              onClick={() => onChange(option)}
              className={`w-full p-5 rounded-xl border-2 text-right transition-all duration-200 ${
                value === option
                  ? 'bg-indigo-500/20 border-indigo-500 text-white'
                  : 'bg-slate-800/50 border-slate-700 text-slate-300 hover:border-slate-600'
              }`}
            >
              <div className="flex items-center gap-4">
                <div
                  className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                    value === option
                      ? 'border-indigo-500 bg-indigo-500'
                      : 'border-slate-600'
                  }`}
                >
                  {value === option && (
                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  )}
                </div>
                <span className="text-lg flex-1">{option}</span>
              </div>
            </button>
          ))}
        </div>
      );

    default:
      return (
        <input
          type="text"
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          className="w-full p-4 bg-slate-800/50 border-2 border-slate-700 focus:border-indigo-500 rounded-xl text-white outline-none transition-colors"
          placeholder="הכנס תשובה..."
        />
      );
  }
}

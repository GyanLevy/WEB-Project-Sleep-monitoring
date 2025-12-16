import { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import questionsData from '../data/questions.json';

/**
 * useQuestionnaireLogic Hook
 * Encapsulates all questionnaire state management, navigation, and submission logic.
 * Separates business logic from UI rendering for better maintainability.
 */
export function useQuestionnaireLogic() {
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

  // Derived state
  const currentQuestion = questions[currentIndex];
  const progress = questions.length > 0 ? ((currentIndex + 1) / questions.length) * 100 : 0;
  const isLastQuestion = currentIndex === questions.length - 1;
  const canProceed = !!answers[currentQuestion?.id];

  // Handle answer selection
  const handleAnswer = useCallback((value) => {
    setAnswers(prev => ({
      ...prev,
      [currentQuestion.id]: value
    }));
  }, [currentQuestion]);

  // Handle form submission
  const handleSubmit = useCallback(async () => {
    setIsSubmitting(true);
    const result = await submitDiary(answers);
    if (result.success) {
      navigate('/complete');
    } else {
      alert(result.error);
      setIsSubmitting(false);
    }
  }, [answers, submitDiary, navigate]);

  // Handle navigation to next question
  const handleNext = useCallback(() => {
    if (!canProceed) return;
    
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
  }, [canProceed, isLastQuestion, handleSubmit]);

  // Handle navigation to previous question
  const handleBack = useCallback(() => {
    if (currentIndex === 0) return;
    setDirection('back');
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentIndex(prev => prev - 1);
      setIsTransitioning(false);
    }, 300);
  }, [currentIndex]);

  return {
    // State
    currentQuestion,
    currentIndex,
    answers,
    isTransitioning,
    direction,
    isSubmitting,
    
    // Derived values
    questions,
    progress,
    isLastQuestion,
    canProceed,
    completedDays,
    totalDays,
    
    // Actions
    handleAnswer,
    handleNext,
    handleBack
  };
}

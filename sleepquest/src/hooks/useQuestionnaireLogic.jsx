import { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { db } from '../firebase';
import { 
  doc, 
  writeBatch, 
  increment, 
  serverTimestamp 
} from 'firebase/firestore';
import questionsData from '../data/questions.json';

// Get today's date in YYYY-MM-DD format
const getTodayDate = () => {
  return new Date().toISOString().split('T')[0];
};

// Get yesterday's date in YYYY-MM-DD format
const getYesterdayDate = () => {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return yesterday.toISOString().split('T')[0];
};

/**
 * useQuestionnaireLogic Hook
 * Encapsulates all questionnaire state management, navigation, and submission logic.
 * Handles Firestore batch writes for diary submissions.
 */
export function useQuestionnaireLogic() {
  const { 
    token, 
    hasSubmittedToday, 
    canSubmitToday, 
    completedDays, 
    totalDays, 
    lastSubmissionDate, 
    streak,
    coins,
    updateAfterSubmission 
  } = useAuth();
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

  // Submit diary using Firestore batch write
  const submitDiary = useCallback(async () => {
    if (!canSubmitToday()) {
      return { success: false, error: 'כבר מילאת את היומן להיום' };
    }

    const today = getTodayDate();
    const yesterday = getYesterdayDate();

    // Calculate new streak
    // If lastSubmissionDate was yesterday -> streak + 1
    // Otherwise -> reset to 1
    let newStreak = 1;
    if (lastSubmissionDate === yesterday) {
      newStreak = streak + 1;
    }

    // Calculate new coins (increment by 10)
    const newCoins = coins + 10;

    try {
      // Create a batch write for atomic updates
      const batch = writeBatch(db);

      // 1. Set doc in submissions subcollection: students/{token}/submissions/{todayDate}
      const submissionRef = doc(db, 'students', token, 'submissions', today);
      batch.set(submissionRef, {
        answers: answers,
        submittedAt: serverTimestamp()
      });

      // 2. Update the parent student document: students/{token}
      const studentRef = doc(db, 'students', token);
      batch.update(studentRef, {
        lastSubmissionDate: today,
        coins: increment(10),
        streak: newStreak
      });

      // Commit the batch
      await batch.commit();

      // Update local state via AuthContext
      updateAfterSubmission({
        lastSubmissionDate: today,
        streak: newStreak,
        coins: newCoins,
        newResponse: {
          date: today,
          submittedAt: new Date().toISOString(),
          answers: answers
        }
      });

      return { success: true, streak: newStreak, coins: newCoins };
    } catch (error) {
      console.error('Submit error:', error);
      return { success: false, error: 'שגיאה בשמירת היומן. נסה שוב.' };
    }
  }, [token, answers, canSubmitToday, lastSubmissionDate, streak, coins, updateAfterSubmission]);

  // Handle form submission
  const handleSubmit = useCallback(async () => {
    setIsSubmitting(true);
    const result = await submitDiary();
    if (result.success) {
      navigate('/complete');
    } else {
      alert(result.error);
      setIsSubmitting(false);
    }
  }, [submitDiary, navigate]);

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

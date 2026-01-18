import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './useAuth';



/**
 * useQuestionnaireLogic Hook
 * Encapsulates all questionnaire state management, navigation, and submission logic.
 * Uses ONLY Firebase questions (teacher-added + approved by admin)
 * No static JSON file needed!
 */
export function useQuestionnaireLogic() {
  const {
    hasSubmittedToday,
    canSubmitToday,
    submitQuestionnaire,
    completedDays,
    totalDays,
    coins,
    getQuestions                       // ← Only source of questions
  } = useAuth();

  const navigate = useNavigate();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [direction, setDirection] = useState('next');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [questions, setQuestions] = useState([]);          // ← Firebase questions only
  const [isLoadingQuestions, setIsLoadingQuestions] = useState(true);
  const [error, setError] = useState(null);

  // Load questions from Firebase ONLY
  useEffect(() => {
    const loadQuestions = async () => {
      try {
        console.log('📚 Loading questions from Firebase...');
        setIsLoadingQuestions(true);
        setError(null);

        const firebaseQuestions = await getQuestions();

        if (!firebaseQuestions || firebaseQuestions.length === 0) {
          console.warn('⚠️ No questions found in Firebase');
          setQuestions([]);
          setError('אין שאלות זמינות כרגע. אנא חכה שהמורה שלך יוסיף שאלות.');
          setIsLoadingQuestions(false);
          return;
        }

        console.log(`✅ Loaded ${firebaseQuestions.length} questions from Firebase:`, firebaseQuestions);

        // Filter questions by targetDay
        // User's current day = completedDays + 1 (the day they're currently working on)
        const userCurrentDay = completedDays + 1;
        const filteredQuestions = firebaseQuestions.filter(question => {
          // If targetDay is 0, missing, or null → show question every day
          if (!question.targetDay) {
            return true;
          }
          // Otherwise, only show if targetDay matches user's current day
          return question.targetDay === userCurrentDay;
        });

        console.log(`📋 Filtered to ${filteredQuestions.length} questions for day ${userCurrentDay}`);
        setQuestions(filteredQuestions);
        setError(null);
      } catch (err) {
        console.error('❌ Error loading questions from Firebase:', err);
        setError('שגיאה בטעינת השאלות. אנא נסו שוב.');
        setQuestions([]);
      } finally {
        setIsLoadingQuestions(false);
      }
    };

    if (getQuestions) {
      loadQuestions();
    }
  }, [getQuestions, completedDays]);

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
  const canProceed = currentQuestion && !!answers[currentQuestion?.id];

  // Handle answer selection
  const handleAnswer = useCallback((value) => {
    if (!currentQuestion) return;

    setAnswers(prev => ({
      ...prev,
      [currentQuestion.id]: value
    }));
  }, [currentQuestion]);

  // Submit questionnaire using AuthContext's submitQuestionnaire function
  const submitDiary = useCallback(async () => {
    if (!canSubmitToday()) {
      return {
        success: false,
        error: 'כבר מילאת את היומן להיום'
      };
    }

    try {
      console.log('📝 Submitting questionnaire with answers:', answers);

      // Use the AuthContext's submitQuestionnaire function
      // It handles all Firestore operations and state updates
      const result = await submitQuestionnaire(answers);

      if (result.success) {
        console.log('✅ Submission successful!', result);
        return {
          success: true,
          streak: result.newStreak,
          coins: coins + 10
        };
      } else {
        console.error('❌ Submission failed:', result.error);
        return {
          success: false,
          error: result.error || 'שגיאה בשמירת היומן. נסה שוב.'
        };
      }
    } catch (error) {
      console.error('❌ Submit error:', error);
      return {
        success: false,
        error: 'שגיאה בשמירת היומן. נסה שוב.'
      };
    }
  }, [answers, canSubmitToday, submitQuestionnaire, coins]);

  // Handle form submission
  const handleSubmit = useCallback(async () => {
    setIsSubmitting(true);
    console.log('🔐 Starting submission process...');

    const result = await submitDiary();

    if (result.success) {
      console.log('✅ Navigating to /complete');
      navigate('/complete');
    } else {
      console.error('❌ Submission failed:', result.error);
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
    isLoadingQuestions,
    error,                          // ← Error state

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
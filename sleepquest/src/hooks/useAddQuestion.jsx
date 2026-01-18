/**
 * useAddQuestion.jsx
 * 
 * Custom hook for adding questions to teacher's questionnaire
 * Handles: form state, validation, options management, class selection, submission
 * Uses: TeacherContext (addQuestion, getQuestionCount, getAllClasses)
 */

import { useState, useEffect } from 'react';
import { useTeacher } from './useTeacher';

const MAX_QUESTIONS = 5;
const MAX_OPTIONS_PER_QUESTION = 6;

export function useAddQuestion() {
  const { addQuestion, getQuestionCount, getAllClasses } = useTeacher();

  // Question content states
  const [questionText, setQuestionText] = useState('');
  const [questionType, setQuestionType] = useState('text');
  const [emoji, setEmoji] = useState('📝');
  const [options, setOptions] = useState(['', '']);
  const [optionsEmoji, setOptionsEmoji] = useState(['', '']);
  const [unitHe, setUnitHe] = useState('');

  // Processing states
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Multi-class support
  const [classSelection, setClassSelection] = useState('current');
  const [selectedClasses, setSelectedClasses] = useState([]);
  const [allClasses, setAllClasses] = useState([]);

  const questionCount = getQuestionCount();
  const isFormDisabled = questionCount >= MAX_QUESTIONS;

  // Load all classes on mount
  useEffect(() => {
    const loadClasses = async () => {
      const classes = await getAllClasses();
      setAllClasses(classes);
      if (classes.length > 0) {
        setSelectedClasses([classes[0].id]);
      }
    };
    loadClasses();
  }, [getAllClasses]);

  // Handle question type change
  const handleTypeChange = (newType) => {
    setQuestionType(newType);

    const emojiMap = {
      text: '📝',
      number: '🔢',
      radio: '⭕',
      checkbox: '☑️',
      time: '⏰',
    };
    setEmoji(emojiMap[newType] || '📝');
  };

  // Handle option text change
  const handleOptionChange = (index, value) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  // Handle option emoji change
  const handleOptionEmojiChange = (index, value) => {
    const newOptionsEmoji = [...optionsEmoji];
    newOptionsEmoji[index] = value.slice(0, 2);
    setOptionsEmoji(newOptionsEmoji);
  };

  // Add new option
  const addOption = () => {
    setOptions([...options, '']);
    setOptionsEmoji([...optionsEmoji, '']);
  };

  // Remove option
  const removeOption = (index) => {
    if (options.length > 2) {
      setOptions(options.filter((_, i) => i !== index));
      setOptionsEmoji(optionsEmoji.filter((_, i) => i !== index));
    }
  };

  // Handle class selection toggle
  const handleClassSelection = (classId) => {
    if (selectedClasses.includes(classId)) {
      setSelectedClasses(selectedClasses.filter((id) => id !== classId));
    } else {
      setSelectedClasses([...selectedClasses, classId]);
    }
  };

  // Reset form
  const resetForm = () => {
    setQuestionText('');
    setQuestionType('text');
    setEmoji('📝');
    setOptions(['', '']);
    setOptionsEmoji(['', '']);
    setUnitHe('');
    setClassSelection('current');
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    // Validation: Question text
    if (!questionText.trim()) {
      setErrorMessage('אנא הכנס טקסט לשאלה');
      return;
    }

    if (questionText.trim().length < 5) {
      setErrorMessage('השאלה חייבת להיות בעלת לפחות 5 תווים');
      return;
    }

    // Validation: Radio options
    if (questionType === 'radio') {
      const filledOptions = options.filter((opt) => opt.trim());
      if (filledOptions.length < 2) {
        setErrorMessage('שאלת בחירה חייבת להיות בעלת לפחות 2 אפשרויות');
        return;
      }
    }

    // Validation: Class selection
    let classIds = [];
    if (classSelection === 'all') {
      classIds = ['all'];
    } else if (classSelection === 'specific') {
      if (selectedClasses.length === 0) {
        setErrorMessage('אנא בחר לפחות כיתה אחת');
        return;
      }
      classIds = selectedClasses;
    }

    setIsSubmitting(true);

    // Prepare question data
    const questionOptions =
      questionType === 'checkbox'
        ? ['כן', 'לא']
        : questionType === 'radio'
          ? options.filter((opt) => opt.trim())
          : [];

    const questionOptionsEmoji =
      questionType === 'checkbox'
        ? ['✅', '❌']
        : questionType === 'radio'
          ? optionsEmoji.filter((_, i) => options[i]?.trim())
          : [];

    // Submit question
    const result = await addQuestion({
      text_he: questionText.trim(),
      type: questionType,
      emoji: emoji,
      options_he: questionOptions,
      options_emoji: questionOptionsEmoji,
      unit_he: unitHe,
      classIds: classIds,
    });

    if (result.success) {
      setSuccessMessage(result.message || 'השאלה נוספה בהצלחה!');
      resetForm();
      setTimeout(() => setSuccessMessage(''), 3000);
    } else {
      setErrorMessage(result.error || 'שגיאה בהוספת השאלה');
    }

    setIsSubmitting(false);
  };

  return {
    // Question content
    questionText,
    setQuestionText,
    questionType,
    handleTypeChange,
    emoji,
    setEmoji,
    options,
    handleOptionChange,
    optionsEmoji,
    handleOptionEmojiChange,
    addOption,
    removeOption,
    unitHe,
    setUnitHe,

    // Processing
    isSubmitting,
    successMessage,
    errorMessage,

    // Class selection
    classSelection,
    setClassSelection,
    selectedClasses,
    allClasses,
    handleClassSelection,

    // Form state
    questionCount,
    isFormDisabled,
    MAX_QUESTIONS,
    MAX_OPTIONS_PER_QUESTION,

    // Functions
    handleSubmit,
    resetForm,
  };
}

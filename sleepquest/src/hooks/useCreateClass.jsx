/**
 * useCreateClass.jsx
 * 
 * Custom hook for class creation
 * Handles: validation, class creation, student codes generation, teacher linking
 */

import { useState, useEffect } from 'react';
import {
  collection,
  setDoc,
  doc,
  getDocs,
  serverTimestamp,
  query,
  where
} from 'firebase/firestore';
import { db } from '../firebase';
import {
  generateStudentCodes,
  validateClassName,
  formatCodesForDisplay
} from '../utils/generateStudentCodes';
import { useTeacherManagement } from './useTeacherManagement';
import { useClassManagement } from './useClassManagement';

export function useCreateClass() {
  // Form states
  const [className, setClassName] = useState('');
  const [selectedTeacherId, setSelectedTeacherId] = useState('');
  const [teachers, setTeachers] = useState([]);
  const [isLoadingTeachers, setIsLoadingTeachers] = useState(true);

  // Processing states
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [generatedCodes, setGeneratedCodes] = useState([]);
  const [progress, setProgress] = useState('');

  // Get context functions
  const { updateTeacherInState } = useTeacherManagement();
  const { addClassToState, loadClasses } = useClassManagement();

  // Load existing teachers
  useEffect(() => {
    loadTeachers();
  }, []);

  const loadTeachers = async () => {
    try {
      setIsLoadingTeachers(true);
      const teachersRef = collection(db, 'teachers');
      const snapshot = await getDocs(teachersRef);
      const teacherList = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setTeachers(teacherList);
      console.log('Loaded teachers:', teacherList);
    } catch (err) {
      console.error('Failed to load teachers:', err);
      setError('❌ טעות בטעינת מורים');
    } finally {
      setIsLoadingTeachers(false);
    }
  };

  const resetForm = () => {
    setClassName('');
    setSelectedTeacherId('');
    setGeneratedCodes([]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setProgress('');
    setSuccess(false);

    // Validation
    if (!className.trim()) {
      setError('❌ שם הכיתה הוא שדה חובה');
      return;
    }

    if (!validateClassName(className)) {
      setError(
        '❌ פורמט שם כיתה אינו תקין. השתמש: class_1xx (לדוגמה, class_101)',
      );
      return;
    }

    // Teacher is REQUIRED
    if (!selectedTeacherId) {
      setError('❌ בחר מורה');
      return;
    }

    // Check if teacher is already assigned to another class
    const selectedTeacher = teachers.find((t) => t.id === selectedTeacherId);
    if (selectedTeacher && selectedTeacher.classId) {
      setError(
        `❌ ${selectedTeacher.displayName} כבר מוקצה ל ${selectedTeacher.classId}`,
      );
      return;
    }

    setIsLoading(true);

    try {
      // Step 1: Create class document
      setProgress('📚 יוצר כיתה...');
      const classRef = doc(db, 'classes', className.toLowerCase());
      await setDoc(classRef, {
        name: className,
        teacherId: selectedTeacherId,
        createdAt: serverTimestamp(),
        studentCount: 30,
        status: 'active',
      });
      console.log('✅ Class created:', className);

      // Step 2: Generate unique student codes
      setProgress('🎲 יוצר קודים לסטודנטים (30)...');
      const codes = await generateStudentCodes(30);
      setGeneratedCodes(codes);
      console.log('✅ Codes generated:', codes);

      // Step 3: Create student documents
      setProgress(`👥 יוצר מסמכי סטודנטים (0/30)...`);
      for (let i = 0; i < codes.length; i++) {
        const code = codes[i];

        await setDoc(doc(db, 'students', code), {
          classId: className.toLowerCase(),
          coins: 0,
          streak: 0,
          inventory: ['skin_default'],
          completedDays: 0,
          lastSubmissionDate: null,
          createdAt: serverTimestamp(),
        });

        setProgress(`👥 יוצר מסמכי סטודנטים (${i + 1}/30)...`);
      }
      console.log('✅ All students created');

      // Step 4: Update teacher with class and codes
      setProgress('🔗 קישור מורה לכיתה...');
      await setDoc(
        doc(db, 'teachers', selectedTeacherId),
        {
          classId: className.toLowerCase(),
          studentCodes: codes,
        },
        { merge: true },
      );
      console.log('✅ Teacher linked with codes');

      // Update contexts
      addClassToState({
        id: className.toLowerCase(),
        name: className,
        teacherId: selectedTeacherId,
        studentCount: 30,
        status: 'active',
        createdAt: new Date().toISOString()
      });

      updateTeacherInState(selectedTeacherId, {
        classId: className.toLowerCase(),
        studentCodes: codes
      });

      // Success!
      setSuccess(true);
      setProgress('✅ כיתה נוצרה בהצלחה!');

      // Reset form after delay
      setTimeout(() => {
        resetForm();
        loadTeachers(); // Reload to update dropdown
      }, 2000);

    } catch (err) {
      console.error('❌ Error creating class:', err);
      setError(`❌ טעות ביצירת כיתה: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Copy codes to clipboard
  const handleCopyCodes = () => {
    const text = formatCodesForDisplay(generatedCodes);
    navigator.clipboard.writeText(text);
    alert('✅ הקודים הועתקו ללוח!');
  };

  // Download as text file
  const handleDownloadCodes = () => {
    const text = formatCodesForDisplay(generatedCodes);
    const element = document.createElement('a');
    element.setAttribute(
      'href',
      'data:text/plain;charset=utf-8,' + encodeURIComponent(text),
    );
    element.setAttribute('download', `${className}_קודים.txt`);
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  // Separate teachers
  const unassignedTeachers = teachers.filter((t) => !t.classId);
  const assignedTeachers = teachers.filter((t) => t.classId);

  return {
    // Form inputs
    className,
    setClassName,
    selectedTeacherId,
    setSelectedTeacherId,

    // Teachers
    teachers,
    unassignedTeachers,
    assignedTeachers,
    isLoadingTeachers,

    // Processing
    isLoading,
    error,
    success,
    progress,
    generatedCodes,

    // Functions
    handleSubmit,
    handleCopyCodes,
    handleDownloadCodes,
    resetForm,
    loadTeachers
  };
}

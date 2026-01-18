/**
 * useCreateTeacher.jsx
 * 
 * Custom hook for teacher account creation
 * Handles: validation, Firebase auth, Firestore document creation, class loading
 */

import { useState, useEffect } from 'react';
import {
  createUserWithEmailAndPassword,
  signOut,
  getAuth
} from 'firebase/auth';
import {
  collection,
  setDoc,
  doc,
  getDocs,
  serverTimestamp
} from 'firebase/firestore';
import { db } from '../firebase';
import { useTeacherManagement } from './useTeacherManagement';

const auth = getAuth();

export function useCreateTeacher() {
  // Form states
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [selectedClassId, setSelectedClassId] = useState('');
  const [classes, setClasses] = useState([]);
  const [isLoadingClasses, setIsLoadingClasses] = useState(true);

  // Processing states
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [progress, setProgress] = useState('');

  // Get teacher management context
  const { addTeacherToState } = useTeacherManagement();

  // Load existing classes
  useEffect(() => {
    loadClasses();
  }, []);

  const loadClasses = async () => {
    try {
      setIsLoadingClasses(true);
      const classesRef = collection(db, 'classes');
      const snapshot = await getDocs(classesRef);
      const classList = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setClasses(classList);
      console.log('Loaded classes:', classList);
    } catch (err) {
      console.error('Failed to load classes:', err);
    } finally {
      setIsLoadingClasses(false);
    }
  };

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const resetForm = () => {
    setDisplayName('');
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setSelectedClassId('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setProgress('');
    setSuccess(false);

    // Validation
    if (!displayName.trim()) {
      setError('❌ שם המורה הוא שדה חובה');
      return;
    }

    if (!email.trim()) {
      setError('❌ כתובת דוא״ל היא שדה חובה');
      return;
    }

    if (!validateEmail(email)) {
      setError('❌ פורמט דוא״ל אינו תקין');
      return;
    }

    if (!password || password.length < 6) {
      setError('❌ הסיסמה חייבת להיות לפחות 6 תווים');
      return;
    }

    if (password !== confirmPassword) {
      setError('❌ הסיסמאות אינן תואמות');
      return;
    }

    setIsLoading(true);

    try {
      // Step 1: Create Firebase Auth user
      setProgress('🔐 יוצר משתמש Firebase...');
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const uid = userCredential.user.uid;
      console.log('✅ Firebase user created:', uid);

      // Step 2: Create teacher document in Firestore
      setProgress('📝 יוצר פרופיל מורה...');
      const teacherData = {
        uid: uid,
        displayName: displayName,
        email: email,
        role: 'teacher',
        studentCodes: [],
        createdAt: serverTimestamp(),
      };

      await setDoc(doc(db, 'teachers', uid), teacherData);
      console.log('✅ Teacher profile created');

      // Add to context
      addTeacherToState({
        id: uid,
        ...teacherData,
        createdAt: new Date().toISOString()
      });

      // Step 3: Sign out the newly created user (keep admin logged in)
      setProgress('🔓 מתנתק מהמשתמש החדש...');
      await signOut(auth);
      console.log('✅ New user signed out');

      // Success!
      setSuccess(true);
      setProgress('✅ חשבון המורה נוצר בהצלחה!');

      // Reset form after delay
      setTimeout(() => {
        resetForm();
      }, 2000);

    } catch (err) {
      console.error('❌ Error creating teacher:', err);

      let errorMessage = err.message;
      if (err.code === 'auth/email-already-in-use') {
        errorMessage = 'דוא״ל זה כבר רשום במערכת';
      } else if (err.code === 'auth/weak-password') {
        errorMessage = 'הסיסמה חלשה מדי';
      }

      setError(`❌ ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  };

  const classesWithoutTeacher = classes.filter((c) => !c.teacherId);

  return {
    // Form inputs
    displayName,
    setDisplayName,
    email,
    setEmail,
    password,
    setPassword,
    confirmPassword,
    setConfirmPassword,
    selectedClassId,
    setSelectedClassId,

    // Classes
    classes,
    classesWithoutTeacher,
    isLoadingClasses,

    // Processing
    isLoading,
    error,
    success,
    progress,

    // Functions
    handleSubmit,
    resetForm,
    loadClasses
  };
}

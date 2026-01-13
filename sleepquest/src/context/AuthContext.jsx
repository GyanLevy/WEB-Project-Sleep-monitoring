import { useState, useEffect, useCallback } from 'react';
import {
  signOut
} from 'firebase/auth';
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  collection,
  getDocs,
  addDoc,
  query,
  where,
  serverTimestamp
} from 'firebase/firestore';
import { auth, db } from '../firebase';
import { AuthContext, getTodayDate, hasSubmittedToday } from './authHelpers';

export function AuthProvider({ children }) {
  const [authState, setAuthState] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // ========================================
  // FETCH STUDENT DATA FROM FIRESTORE
  // ========================================
  const fetchStudentData = useCallback(async (studentId) => {
    try {
      console.log(`Fetching student data for ID: ${studentId}`);

      // Get student by document ID directly
      const studentRef = doc(db, 'students', studentId);
      const studentDoc = await getDoc(studentRef);

      if (!studentDoc.exists()) {
        console.log(`No student found with ID: ${studentId}`);
        return null;
      }

      console.log(`Found student by document ID: ${studentId}`);

      const data = studentDoc.data();

      // NEW: Fetch submissions from ROOT collection with query
      const submissionsRef = collection(db, 'submissions');
      const submissionsQuery = query(
        submissionsRef,
        where('studentToken', '==', studentId)
      );
      const submissionsSnap = await getDocs(submissionsQuery);
      const responses = submissionsSnap.docs.map(docSnap => ({
        id: docSnap.id,
        ...docSnap.data()
      }));

      console.log(`Found ${responses.length} submissions for student ${studentId}`);

      return {
        uid: studentId,
        token: studentId,  // GameView needs this
        classId: data.classId || 'default',
        coins: data.coins || 0,
        inventory: data.inventory || ['skin_default'],
        streak: data.streak || 0,
        lastSubmissionDate: data.lastSubmissionDate || null,
        totalDays: data.totalDays || 10,
        completedDays: data.completedDays || responses.length,
        responses,
        isUserDataReady: true  // Critical: allows GameView to remove loading screen
      };
    } catch (error) {
      console.error('Error fetching student data:', error);
      return null;
    }
  }, []);

  // ========================================
  // LOGIN WITH STUDENT ID
  // ========================================
  const login = async (studentId) => {
    // Validate student ID format (6 digits)
    if (!/^\d{6}$/.test(studentId)) {
      console.warn(`Invalid student ID format: ${studentId}`);
      return {
        success: false,
        error: 'קוד הגישה חייב להיות 6 ספרות בדיוק'
      };
    }

    setIsLoading(true);
    console.log(`Attempting login with student ID: ${studentId}`);

    try {
      // Fetch student data by document ID
      const studentData = await fetchStudentData(studentId);

      if (!studentData) {
        console.error(`Login failed: Student not found with ID ${studentId}`);
        setIsLoading(false);
        return {
          success: false,
          error: 'קוד גישה לא נמצא. אנא בדוק את הקוד.'
        };
      }

      // Student found - set auth state
      console.log(`Login successful for student:`, studentData);
      setAuthState(studentData);

      // Store student ID in localStorage for persistence
      localStorage.setItem('sleepquest_studentId', studentId);

      // Sync game data with localStorage
      localStorage.setItem('sleepquest_game_data', JSON.stringify({
        completedDays: studentData.responses.length,
        streak: studentData.streak,
        coins: studentData.coins,
        studentId: studentId
      }));

      setIsLoading(false);
      return {
        success: true,
        hasSubmittedToday: hasSubmittedToday(studentData.lastSubmissionDate)
      };
    } catch (error) {
      console.error('Login error:', error);
      setIsLoading(false);
      return {
        success: false,
        error: 'שגיאה בהתחברות. נסה שוב.'
      };
    }
  };

  // ========================================
  // LOGOUT
  // ========================================
  const logout = async () => {
    try {
      console.log('Logging out...');
      await signOut(auth);
      localStorage.removeItem('sleepquest_studentId');
      localStorage.removeItem('sleepquest_game_data');
      setAuthState(null);
      console.log('Logout successful');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  // ========================================
  // SUBMIT QUESTIONNAIRE
  // ========================================
  const submitQuestionnaire = async (answers) => {
    if (!authState) {
      return {
        success: false,
        error: 'משתמש לא מחובר'
      };
    }

    try {
      const today = getTodayDate();
      console.log(`Submitting questionnaire for ${today}...`);

      // Get student document
      const studentRef = doc(db, 'students', authState.uid);
      const studentDoc = await getDoc(studentRef);

      if (!studentDoc.exists()) {
        return {
          success: false,
          error: 'תלמיד לא נמצא'
        };
      }

      const studentData = studentDoc.data();
      const currentStreak = studentData.streak || 0;
      const lastSubmission = studentData.lastSubmissionDate;
      const currentCompletedDays = studentData.completedDays || 0;

      // Calculate new streak
      let newStreak = currentStreak;
      if (lastSubmission) {
        const lastDate = new Date(lastSubmission);
        const todayDate = new Date(today);
        const diffTime = todayDate - lastDate;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays === 1) {
          newStreak = currentStreak + 1;
        } else if (diffDays > 1) {
          newStreak = 1;
        }
      } else {
        newStreak = 1;
      }

      // Check if already submitted today using lastSubmissionDate (reliable)
      if (lastSubmission === today) {
        console.warn(`Student already submitted today (based on lastSubmissionDate)`);
        return {
          success: false,
          error: 'כבר הגשת את השאלון היום'
        };
      }

      // Save submission to ROOT submissions collection
      const submissionsRef = collection(db, 'submissions');
      await addDoc(submissionsRef, {
        studentToken: authState.uid,
        classId: authState.classId,
        answers: answers,
        createdAt: serverTimestamp(),
        submittedAt: serverTimestamp()
      });

      console.log(`Submission saved to root submissions collection`);

      // Update student document with new fields
      const newCompletedDays = currentCompletedDays + 1;
      await updateDoc(studentRef, {
        lastSubmissionDate: today,
        streak: newStreak,
        completedDays: newCompletedDays
      });

      console.log(`Student document updated. New streak: ${newStreak}, completedDays: ${newCompletedDays}`);

      // Update local state
      const updatedState = {
        ...authState,
        lastSubmissionDate: today,
        streak: newStreak,
        completedDays: newCompletedDays,
        responses: [...authState.responses, { 
          studentToken: authState.uid,
          classId: authState.classId,
          answers, 
          submittedAt: new Date().toISOString() 
        }]
      };

      setAuthState(updatedState);

      // Sync with localStorage
      localStorage.setItem('sleepquest_game_data', JSON.stringify({
        completedDays: newCompletedDays,
        streak: updatedState.streak,
        coins: updatedState.coins,
        studentId: authState.uid
      }));

      return {
        success: true,
        message: 'הגשה בוצעה בהצלחה!',
        newStreak: newStreak
      };
    } catch (error) {
      console.error('Submit error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  };

  // ========================================
  // SUBMIT CUSTOM QUESTION
  // ========================================
  const submitCustomQuestion = async (questionText, proposedText, reason) => {
    if (!authState) {
      return {
        success: false,
        error: 'משתמש לא מחובר'
      };
    }

    try {
      console.log(`Submitting custom question...`);

      // Save question to student's questions subcollection
      const questionsRef = collection(db, 'students', authState.uid, 'questions');

      await setDoc(doc(questionsRef), {
        questionText: questionText,
        proposedText: proposedText,
        reason: reason,
        status: 'pending',
        submittedAt: serverTimestamp(),
        approvedAt: null,
        approvedBy: null
      });

      console.log(`Custom question submitted`);

      return {
        success: true,
        message: 'השאלה הוגשה בהצלחה וממתינה לאישור'
      };
    } catch (error) {
      console.error('Question submit error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  };

  // ========================================
  // GET QUESTIONNAIRE QUESTIONS (UPDATED FOR MULTI-CLASS)
  // ========================================
  const getQuestions = useCallback(async () => {
    if (!authState) return [];

    try {
      console.log(`Fetching questions for class: ${authState.classId}`);

      const questionsRef = collection(db, 'questions');

      // Fetch ALL approved questions
      // Then filter by: status='approved' AND (classIds contains 'all' OR classIds contains studentClass)
      const snapshot = await getDocs(
        query(
          questionsRef,
          where('status', '==', 'approved')
        )
      );

      // Filter by multi-class support
      const questions = snapshot.docs
        .map(doc => ({
          id: doc.id,
          ...doc.data()
        }))
        .filter(q => {
          // Check if question is for all classes
          if (q.classIds && q.classIds.includes('all')) {
            return true;
          }
          // Check if question is for this student's class
          if (q.classIds && q.classIds.includes(authState.classId)) {
            return true;
          }
          // Fallback for old questions without classIds
          if (!q.classIds && q.classId === authState.classId) {
            return true;
          }
          return false;
        });

      console.log(`Found ${questions.length} approved questions for class ${authState.classId}`);
      return questions;
    } catch (error) {
      console.error('Error getting questions:', error);
      return [];
    }
  }, [authState]);

  // ========================================
  // UTILITY FUNCTIONS
  // ========================================

  const canSubmitToday = useCallback(() => {
    if (!authState) return false;
    return authState.lastSubmissionDate !== getTodayDate();
  }, [authState]);

  const getStreak = useCallback(() => {
    return authState?.streak || 0;
  }, [authState]);

  const getAllResponses = useCallback(() => {
    return authState?.responses || [];
  }, [authState]);

  // ========================================
  // RESTORE SESSION ON APP LOAD
  // ========================================
  useEffect(() => {
    let isMounted = true;

    const restoreSession = async () => {
      const savedStudentId = localStorage.getItem('sleepquest_studentId');
      if (savedStudentId) {
        console.log(`Restoring session with student ID: ${savedStudentId}`);
        const data = await fetchStudentData(savedStudentId);

        if (!isMounted) return;

        if (data) {
          console.log(`Session restored`);
          setAuthState(data);
        } else {
          console.warn(`Saved student ID is no longer valid`);
          localStorage.removeItem('sleepquest_studentId');
          localStorage.removeItem('sleepquest_game_data');
        }
      }

      if (isMounted) {
        setIsLoading(false);
      }
    };

    restoreSession();

    return () => {
      isMounted = false;
    };
  }, [fetchStudentData]);

  // ========================================
  // CONTEXT VALUE
  // ========================================
  const value = {
    // State
    isAuthenticated: !!authState,
    isLoading,
    studentId: authState?.uid,
    token: authState?.token,  // GameView needs this
    classId: authState?.classId,
    isUserDataReady: authState?.isUserDataReady || false,  // GameView loading check

    // Game data
    coins: authState?.coins || 0,
    inventory: authState?.inventory || ['skin_default'],
    streak: authState?.streak || 0,
    totalDays: authState?.totalDays || 10,
    completedDays: authState?.completedDays || 0,
    lastSubmissionDate: authState?.lastSubmissionDate,

    // Auth functions
    login,
    logout,

    // Submission functions
    submitQuestionnaire,
    submitCustomQuestion,

    // Question functions (UPDATED FOR MULTI-CLASS)
    getQuestions,
    
    // Utility functions
    canSubmitToday,
    hasSubmittedToday: () => hasSubmittedToday(authState?.lastSubmissionDate),
    getStreak,
    getAllResponses
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}


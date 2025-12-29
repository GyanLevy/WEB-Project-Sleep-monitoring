import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { db } from '../firebase';
import { 
  doc, 
  getDoc, 
  setDoc, 
  collection, 
  getDocs,
  serverTimestamp 
} from 'firebase/firestore';

const AuthContext = createContext(null);

// Get today's date in YYYY-MM-DD format
const getTodayDate = () => {
  return new Date().toISOString().split('T')[0];
};

export function AuthProvider({ children }) {
  const [authState, setAuthState] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch student data from Firestore
  const fetchStudentData = useCallback(async (token) => {
    try {
      const studentRef = doc(db, 'students', token);
      const studentSnap = await getDoc(studentRef);
      
      if (studentSnap.exists()) {
        const data = studentSnap.data();
        
        // Fetch submissions subcollection
        const submissionsRef = collection(db, 'students', token, 'submissions');
        const submissionsSnap = await getDocs(submissionsRef);
        const responses = submissionsSnap.docs.map(doc => ({
          date: doc.id,
          ...doc.data()
        }));

        return {
          token,
          classId: data.classId || 'default',
          lastSubmissionDate: data.lastSubmissionDate || null,
          streak: data.streak || 0,
          totalDays: 10,
          responses
        };
      }
      return null;
    } catch (error) {
      console.error('Error fetching student data:', error);
      return null;
    }
  }, []);

  // Login with anonymous token
  const login = async (token) => {
    // Validate token format (6 digits)
    if (!/^\d{6}$/.test(token)) {
      return { success: false, error: 'הקוד חייב להכיל 6 ספרות בדיוק' };
    }

    setIsLoading(true);

    try {
      // Check if student exists in Firestore
      const existingData = await fetchStudentData(token);
      
      if (existingData) {
        setAuthState(existingData);
        // Store token locally for persistence across page refreshes
        localStorage.setItem('sleepquest_token', token);
        
        // Sync with localStorage for game integration
        localStorage.setItem('sleepquest_game_data', JSON.stringify({
          completedDays: existingData.responses.length,
          streak: existingData.streak,
          token: token
        }));
        
        setIsLoading(false);
        const today = getTodayDate();
        return { success: true, hasSubmittedToday: existingData.lastSubmissionDate === today };
      }

      // Create new student in Firestore
      const studentRef = doc(db, 'students', token);
      const newStudentData = {
        classId: 'default',
        lastSubmissionDate: null,
        streak: 0,
        createdAt: serverTimestamp()
      };

      await setDoc(studentRef, newStudentData);

      const newState = {
        token,
        classId: 'default',
        lastSubmissionDate: null,
        streak: 0,
        totalDays: 10,
        responses: []
      };

      setAuthState(newState);
      localStorage.setItem('sleepquest_token', token);
      setIsLoading(false);
      return { success: true, hasSubmittedToday: false };
    } catch (error) {
      console.error('Login error:', error);
      setIsLoading(false);
      return { success: false, error: 'שגיאה בהתחברות. נסה שוב.' };
    }
  };

  // Restore session on app load
  useEffect(() => {
    const restoreSession = async () => {
      const savedToken = localStorage.getItem('sleepquest_token');
      if (savedToken) {
        setIsLoading(true);
        const data = await fetchStudentData(savedToken);
        if (data) {
          setAuthState(data);
        }
        setIsLoading(false);
      }
    };
    restoreSession();
  }, [fetchStudentData]);

  // Logout
  const logout = () => {
    localStorage.removeItem('sleepquest_token');
    setAuthState(null);
  };

  // Check if user can submit today
  const canSubmitToday = useCallback(() => {
    if (!authState) return false;
    const today = getTodayDate();
    return authState.lastSubmissionDate !== today;
  }, [authState]);

  // Check if already submitted today
  const hasSubmittedToday = useCallback(() => {
    if (!authState) return false;
    const today = getTodayDate();
    return authState.lastSubmissionDate === today;
  }, [authState]);

  // Submit daily diary to Firestore
  const submitDiary = async (answers) => {
    if (!canSubmitToday()) {
      return { success: false, error: 'כבר מילאת את היומן להיום' };
    }

    const today = getTodayDate();
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    // Calculate streak
    let newStreak = 1;
    if (authState.lastSubmissionDate === yesterdayStr) {
      newStreak = authState.streak + 1;
    }

    try {
      // Save submission to subcollection
      const submissionRef = doc(db, 'students', authState.token, 'submissions', today);
      await setDoc(submissionRef, {
        submittedAt: serverTimestamp(),
        answers
      });

      // Update student document
      const studentRef = doc(db, 'students', authState.token);
      await setDoc(studentRef, {
        lastSubmissionDate: today,
        streak: newStreak
      }, { merge: true });

      // Update local state
      const newResponse = {
        date: today,
        submittedAt: new Date().toISOString(),
        answers
      };

      setAuthState(prev => {
        const newResponses = [...prev.responses, newResponse];
        const newState = {
          ...prev,
          lastSubmissionDate: today,
          streak: newStreak,
          responses: newResponses
        };

        // Sync with localStorage for game integration
        // The game reads this to unlock levels based on questionnaire progress
        localStorage.setItem('sleepquest_game_data', JSON.stringify({
          completedDays: newResponses.length,
          streak: newStreak,
          token: prev.token
        }));

        return newState;
      });

      return { success: true, streak: newStreak };
    } catch (error) {
      console.error('Submit error:', error);
      return { success: false, error: 'שגיאה בשמירת היומן. נסה שוב.' };
    }
  };

  // Get all responses (for CSV export)
  const getAllResponses = () => {
    return authState?.responses || [];
  };

  const value = {
    isAuthenticated: !!authState,
    isLoading,
    token: authState?.token,
    classId: authState?.classId,
    streak: authState?.streak || 0,
    totalDays: authState?.totalDays || 10,
    completedDays: authState?.responses?.length || 0,
    lastSubmissionDate: authState?.lastSubmissionDate,
    login,
    logout,
    canSubmitToday,
    hasSubmittedToday,
    submitDiary,
    getAllResponses
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export default AuthContext;

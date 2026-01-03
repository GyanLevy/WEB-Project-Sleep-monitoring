import { useState, useEffect, useCallback } from 'react';
import { db } from '../firebase';
import { 
  doc, 
  getDoc, 
  collection, 
  getDocs
} from 'firebase/firestore';
import AuthContext from './createAuthContext';


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
          coins: data.coins || 0,
          inventory: data.inventory || ['skin_default'],
          streak: data.streak || 0,
          lastSubmissionDate: data.lastSubmissionDate || null,
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
      const studentRef = doc(db, 'students', token);
      const studentSnap = await getDoc(studentRef);
      
      // STRICT VALIDATION: Student must exist in Firestore
      if (!studentSnap.exists()) {
        setIsLoading(false);
        return { success: false, error: 'קוד לא תקף' }; // "Invalid Token" in Hebrew
      }

      // Student exists - fetch full data including submissions
      const existingData = await fetchStudentData(token);
      
      if (existingData) {
        setAuthState(existingData);
        // Store token locally for persistence across page refreshes
        localStorage.setItem('sleepquest_token', token);
        
        // Sync with localStorage for game integration
        localStorage.setItem('sleepquest_game_data', JSON.stringify({
          completedDays: existingData.responses.length,
          streak: existingData.streak,
          coins: existingData.coins,
          token: token
        }));
        
        setIsLoading(false);
        const today = getTodayDate();
        return { success: true, hasSubmittedToday: existingData.lastSubmissionDate === today };
      }

      setIsLoading(false);
      return { success: false, error: 'שגיאה בטעינת נתוני המשתמש' };
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
        } else {
          // Token no longer valid in Firestore, clear local storage
          localStorage.removeItem('sleepquest_token');
          localStorage.removeItem('sleepquest_game_data');
        }
        setIsLoading(false);
      }
    };
    restoreSession();
  }, [fetchStudentData]);

  // Logout
  const logout = () => {
    localStorage.removeItem('sleepquest_token');
    localStorage.removeItem('sleepquest_game_data');
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

  // Update auth state after diary submission (called by useQuestionnaireLogic)
  const updateAfterSubmission = useCallback((updates) => {
    setAuthState(prev => {
      if (!prev) return prev;
      
      const newState = {
        ...prev,
        lastSubmissionDate: updates.lastSubmissionDate,
        streak: updates.streak,
        coins: updates.coins,
        responses: [...prev.responses, updates.newResponse]
      };

      // Sync with localStorage for game integration
      localStorage.setItem('sleepquest_game_data', JSON.stringify({
        completedDays: newState.responses.length,
        streak: newState.streak,
        coins: newState.coins,
        token: prev.token
      }));

      return newState;
    });
  }, []);

  // Get all responses (for CSV export)
  const getAllResponses = () => {
    return authState?.responses || [];
  };

  const value = {
    isAuthenticated: !!authState,
    isLoading,
    token: authState?.token,
    classId: authState?.classId,
    coins: authState?.coins || 0,
    inventory: authState?.inventory || ['skin_default'],
    streak: authState?.streak || 0,
    totalDays: authState?.totalDays || 10,
    completedDays: authState?.responses?.length || 0,
    lastSubmissionDate: authState?.lastSubmissionDate,
    login,
    logout,
    canSubmitToday,
    hasSubmittedToday,
    updateAfterSubmission,
    getAllResponses
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}


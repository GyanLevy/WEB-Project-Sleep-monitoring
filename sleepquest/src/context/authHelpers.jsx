import { createContext } from 'react';

// Create the AuthContext
export const AuthContext = createContext(null);

// Helper: Get today's date in YYYY-MM-DD format
export const getTodayDate = () => {
  return new Date().toISOString().split('T')[0];
};

// Helper: Check if already submitted today
export function hasSubmittedToday(lastSubmissionDate) {
  if (!lastSubmissionDate) return false;
  const today = getTodayDate();
  return lastSubmissionDate === today;
}

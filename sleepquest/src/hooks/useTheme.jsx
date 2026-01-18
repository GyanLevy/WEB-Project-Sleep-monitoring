import { useContext } from 'react';
import ThemeContext from '../context/ThemeContext';

/**
 * useTheme Hook
 * Custom hook for consuming the theme context.
 */
export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

export default useTheme;

/**
 * useClassManagement.jsx
 * 
 * Hook to access class management context
 * Provides access to classes list and management functions
 */

import { useContext } from 'react';
import { ClassManagementContext } from '../context/ClassManagementContext';

export function useClassManagement() {
  const context = useContext(ClassManagementContext);
  
  if (!context) {
    throw new Error('useClassManagement must be used within a ClassManagementProvider');
  }
  
  return context;
}

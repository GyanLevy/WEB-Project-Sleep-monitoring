/**
 * useTeacherManagement.jsx
 * 
 * Hook to access teacher management context
 * Provides access to teachers list and management functions
 */

import { useContext } from 'react';
import { TeacherManagementContext } from '../context/TeacherManagementContext';

export function useTeacherManagement() {
  const context = useContext(TeacherManagementContext);
  
  if (!context) {
    throw new Error('useTeacherManagement must be used within a TeacherManagementProvider');
  }
  
  return context;
}

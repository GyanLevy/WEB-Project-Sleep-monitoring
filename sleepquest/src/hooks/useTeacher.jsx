import { useContext } from 'react';
import { TeacherContext } from '../context/teacherHelpers';

export function useTeacher() {
  const context = useContext(TeacherContext);
  if (!context) {
    throw new Error('useTeacher must be used within a TeacherProvider');
  }
  return context;
}

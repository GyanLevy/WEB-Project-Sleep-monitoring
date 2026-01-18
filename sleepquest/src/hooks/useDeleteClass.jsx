/**
 * useDeleteClass.jsx
 * 
 * Custom hook for class deletion
 * Handles: loading classes, deleting students, unassigning teachers, deleting class
 * Uses existing contexts: ClassManagement, TeacherManagement
 */

import { useState, useEffect } from 'react';
import {
  collection,
  getDocs,
  deleteDoc,
  doc,
  query,
  where,
  updateDoc
} from 'firebase/firestore';
import { db } from '../firebase';
import { useClassManagement } from './useClassManagement';
import { useTeacherManagement } from './useTeacherManagement';

export function useDeleteClass() {
  const [classes, setClasses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState(null); // { classId, className, studentCount }
  const [isDeleting, setIsDeleting] = useState(false);

  // Get context functions
  const { loadClasses: reloadContextClasses } = useClassManagement();
  const { updateTeacherInState } = useTeacherManagement();

  // Load classes on mount
  useEffect(() => {
    loadClasses();
  }, []);

  const loadClasses = async () => {
    try {
      setIsLoading(true);
      setError('');
      const classesRef = collection(db, 'classes');
      const snapshot = await getDocs(classesRef);

      const classList = await Promise.all(
        snapshot.docs.map(async (classDoc) => {
          // Count students in this class
          const studentsRef = collection(db, 'students');
          const studentsSnap = await getDocs(
            query(studentsRef, where('classId', '==', classDoc.id)),
          );

          return {
            id: classDoc.id,
            studentCount: studentsSnap.size,
            ...classDoc.data(),
          };
        }),
      );

      setClasses(classList);
      console.log('✅ Classes loaded:', classList.length);
    } catch (err) {
      console.error('Failed to load classes:', err);
      setError('❌ טעות בטעינת כיתות');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteClass = async (classId) => {
    setIsDeleting(true);
    setError('');

    try {
      const classData = classes.find((c) => c.id === classId);

      // Step 1: Get all students in this class
      setSuccessMessage('🔄 מביא את כל התלמידים...');
      const studentsRef = collection(db, 'students');
      const studentsSnap = await getDocs(
        query(studentsRef, where('classId', '==', classId)),
      );

      const studentCount = studentsSnap.size;

      // Step 2: Delete all student documents
      setSuccessMessage(`🗑️ מוחק ${studentCount} תלמידים...`);
      for (const studentDoc of studentsSnap.docs) {
        await deleteDoc(doc(db, 'students', studentDoc.id));
      }
      console.log(`✅ Deleted ${studentCount} students`);

      // Step 3: If teacher is assigned, clear the assignment
      if (classData?.teacherId) {
        setSuccessMessage('🔗 מעדכן הקצאת המורה...');
        const teacherRef = doc(db, 'teachers', classData.teacherId);
        await updateDoc(teacherRef, {
          classId: null,
          studentCodes: [],
        });
        console.log('✅ Teacher unassigned');

        // Update context
        updateTeacherInState(classData.teacherId, {
          classId: null,
          studentCodes: []
        });
      }

      // Step 4: Delete the class document
      setSuccessMessage('📚 מוחק כיתה...');
      await deleteDoc(doc(db, 'classes', classId));
      console.log('✅ Class deleted');

      // Step 5: Update UI and context
      setClasses(classes.filter((c) => c.id !== classId));
      setDeleteConfirm(null);

      // Reload context classes
      await reloadContextClasses();

      setSuccessMessage(
        `✅ הכיתה ${classData?.name || ''} וכל ${studentCount} התלמידים נמחקו!`,
      );

      // Clear success message after 4 seconds
      setTimeout(() => setSuccessMessage(''), 4000);
    } catch (err) {
      console.error('Error deleting class:', err);
      setError(`❌ טעות במחיקת הכיתה: ${err.message}`);
      setSuccessMessage('');
    } finally {
      setIsDeleting(false);
    }
  };

  return {
    // Data
    classes,
    isLoading,
    error,
    successMessage,
    deleteConfirm,
    isDeleting,

    // Functions
    handleDeleteClass,
    setDeleteConfirm,
    loadClasses
  };
}

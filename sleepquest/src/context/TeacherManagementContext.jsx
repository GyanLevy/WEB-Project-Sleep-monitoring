/**
 * TeacherManagementContext.jsx
 *
 * Global context for managing teachers across the application
 * Handles: teacher list, loading state, errors
 */

import { createContext, useState, useEffect, useCallback } from "react";
import { getAllDocuments } from "../utils/firebaseUtils";

export const TeacherManagementContext = createContext();

export function TeacherManagementProvider({ children }) {
  const [teachers, setTeachers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  // Load all teachers using utility
  const loadTeachers = useCallback(async () => {
    try {
      setIsLoading(true);
      setError("");

      const teacherList = await getAllDocuments("teachers");

      setTeachers(teacherList);
      console.log("✅ Teachers loaded:", teacherList.length);
      return teacherList;
    } catch (err) {
      console.error("Failed to load teachers:", err);
      setError("❌ שגיאה בטעינת מורים");
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Add teacher to local state (called after creation)
  const addTeacherToState = useCallback((newTeacher) => {
    setTeachers((prev) => [...prev, newTeacher]);
  }, []);

  // Remove teacher from local state (called after deletion)
  const removeTeacherFromState = useCallback((teacherId) => {
    setTeachers((prev) => prev.filter((t) => t.id !== teacherId));
  }, []);

  // Update teacher in local state
  const updateTeacherInState = useCallback((teacherId, updates) => {
    setTeachers((prev) =>
      prev.map((t) => (t.id === teacherId ? { ...t, ...updates } : t)),
    );
  }, []);

  // Load teachers on provider mount
  useEffect(() => {
    loadTeachers();
  }, [loadTeachers]);

  const value = {
    teachers,
    isLoading,
    error,
    setError,
    loadTeachers,
    addTeacherToState,
    removeTeacherFromState,
    updateTeacherInState,
  };

  return (
    <TeacherManagementContext.Provider value={value}>
      {children}
    </TeacherManagementContext.Provider>
  );
}

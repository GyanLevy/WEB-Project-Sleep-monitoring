/**
 * ClassManagementContext.jsx
 *
 * Global context for managing classes across the application
 * Handles: class list, loading state, errors
 */

import { createContext, useState, useEffect, useCallback } from "react";
import { getAllDocuments } from "../utils/firebaseUtils";

export const ClassManagementContext = createContext();

export function ClassManagementProvider({ children }) {
  const [classes, setClasses] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  // Load all classes using utility
  const loadClasses = useCallback(async () => {
    try {
      setIsLoading(true);
      setError("");

      const classList = await getAllDocuments("classes");

      setClasses(classList);
      console.log("✅ Classes loaded:", classList.length);
      return classList;
    } catch (err) {
      console.error("Failed to load classes:", err);
      setError("❌ שגיאה בטעינת כיתות");
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Add class to local state (called after creation)
  const addClassToState = useCallback((newClass) => {
    setClasses((prev) => [...prev, newClass]);
  }, []);

  // Remove class from local state (called after deletion)
  const removeClassFromState = useCallback((classId) => {
    setClasses((prev) => prev.filter((c) => c.id !== classId));
  }, []);

  // Update class in local state
  const updateClassInState = useCallback((classId, updates) => {
    setClasses((prev) =>
      prev.map((c) => (c.id === classId ? { ...c, ...updates } : c)),
    );
  }, []);

  // Load classes on provider mount
  useEffect(() => {
    loadClasses();
  }, [loadClasses]);

  const value = {
    classes,
    isLoading,
    error,
    setError,
    loadClasses,
    addClassToState,
    removeClassFromState,
    updateClassInState,
  };

  return (
    <ClassManagementContext.Provider value={value}>
      {children}
    </ClassManagementContext.Provider>
  );
}

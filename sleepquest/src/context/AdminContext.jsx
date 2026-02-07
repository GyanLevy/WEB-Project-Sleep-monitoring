import { useState, useEffect } from "react";
import {
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from "firebase/auth";
import { auth } from "../firebase";
import { getFirebaseErrorMessage } from "../utils/firebaseErrors";
import { AdminContext } from "./adminHelpers";
import {
  getDocument,
  getAllDocuments,
  queryDocuments,
  updateDocument,
  getServerTimestamp,
} from "../utils/firebaseUtils";

export function AdminProvider({ children }) {
  const [adminState, setAdminState] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [classes, setClasses] = useState([]);
  const [pendingQuestions, setPendingQuestions] = useState({});

  // Login with Firebase
  const loginAdmin = async (email, password) => {
    setIsLoading(true);

    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password,
      );
      const user = userCredential.user;

      // Use utility to get admin document
      const adminData = await getDocument("admins", user.uid);

      if (!adminData || !adminData.isAdmin) {
        await signOut(auth);
        setIsLoading(false);
        return {
          success: false,
          error: "משתמש זה אינו מנהל. אנא התחבר עם חשבון מנהל.",
        };
      }

      setAdminState({
        uid: user.uid,
        email: user.email,
        displayName: adminData.displayName || "Admin",
      });

      await loadClasses();

      setIsLoading(false);
      return {
        success: true,
        message: "התחברות מוצלחת",
      };
    } catch (error) {
      console.error("Login error:", error);
      setIsLoading(false);
      return {
        success: false,
        error: getFirebaseErrorMessage(error),
      };
    }
  };

  // Load classes data and pending questions
  const loadClasses = async () => {
    try {
      // Get all classes using utility
      const allClasses = await getAllDocuments("classes");

      const classesData = [];

      for (const classDoc of allClasses) {
        const classId = classDoc.id;
        const className = classDoc.name;

        // Get students for this class using utility
        const students = await queryDocuments(
          "students",
          "classId",
          "==",
          classId,
        );

        const totalStudents = students.length;

        // Count active students (submitted this month)
        const today = new Date();
        const currentMonth = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}`;

        let activeStudents = 0;
        for (const student of students) {
          const lastSubmission = student.lastSubmissionDate;

          if (lastSubmission) {
            activeStudents++;
          }
        }

        classesData.push({
          id: classId,
          name: className,
          totalStudents: totalStudents,
          activeStudents: activeStudents,
          pendingQuestionsCount: 0,
          pending: [],
        });
      }

      // ============================================
      // GET ALL PENDING QUESTIONS (MULTICLASS SUPPORT)
      // ============================================
      const allPendingQuestions = await queryDocuments(
        "questions",
        "status",
        "==",
        "pending",
      );

      console.log(
        `Found ${allPendingQuestions.length} total pending questions`,
      );

      // Build pending questions map organized by class
      const pendingMap = {};

      // Initialize all classes in map
      classesData.forEach((cls) => {
        pendingMap[cls.id] = [];
      });

      // Process each pending question
      allPendingQuestions.forEach((question) => {
        const classIds = question.classIds || [];

        const pending = {
          id: question.id,
          text_he: question.text_he,
          type: question.type,
          emoji: question.emoji || "📝",
          options_he: question.options_he,
          options_emoji: question.options_emoji,
          unit_he: question.unit_he,
          createdBy: question.createdBy,
          createdAt: question.createdAt,
          submittedAt: question.createdAt,
          classIds: classIds, // For display
        };

        // If question is for ALL classes, add to all classes
        if (classIds.includes("all")) {
          console.log(`Question "${question.text_he}" is for ALL classes`);
          classesData.forEach((cls) => {
            pendingMap[cls.id].push({
              ...pending,
              applicableToAllClasses: true,
            });
          });
        } else {
          // Otherwise, add to specific classes only
          classIds.forEach((classId) => {
            if (pendingMap[classId]) {
              console.log(
                `Question "${question.text_he}" added to class ${classId}`,
              );
              pendingMap[classId].push(pending);
            } else {
              console.warn(`Class ${classId} not found for question`);
            }
          });
        }
      });

      // Update counts
      classesData.forEach((cls) => {
        cls.pendingQuestionsCount = pendingMap[cls.id].length;
        cls.pending = pendingMap[cls.id];
      });

      setClasses(classesData);
      setPendingQuestions(pendingMap);

      console.log("Classes loaded with pending questions:", classesData);
    } catch (error) {
      console.error("Error loading classes:", error);
    }
  };

  // Approve or reject question using utility
  const handleQuestionApproval = async (classId, questionId, approved) => {
    try {
      await updateDocument("questions", questionId, {
        status: approved ? "approved" : "rejected",
        approvedAt: getServerTimestamp(),
        approvedBy: adminState.uid,
      });

      console.log(
        `Question ${questionId} ${approved ? "approved" : "rejected"}`,
      );

      await loadClasses();

      return { success: true };
    } catch (error) {
      console.error("Error updating question:", error);
      return {
        success: false,
        error: error.message,
      };
    }
  };

  // Logout
  const logout = async () => {
    try {
      await signOut(auth);
      setAdminState(null);
      setClasses([]);
      setPendingQuestions({});
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  // Refresh data
  const refreshData = async () => {
    console.log("Refreshing admin data...");
    await loadClasses();
  };

  // Monitor auth state
  useEffect(() => {
    let isMounted = true;

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!isMounted) return;

      if (user) {
        // Use utility to get admin document
        const adminData = await getDocument("admins", user.uid);

        if (!isMounted) return;

        if (adminData && adminData.isAdmin) {
          setAdminState({
            uid: user.uid,
            email: user.email,
            displayName: adminData.displayName || "Admin",
          });
          await loadClasses();
        }
      } else {
        if (!isMounted) return;
        setAdminState(null);
        setClasses([]);
        setPendingQuestions({});
      }

      if (isMounted) {
        setIsLoading(false);
      }
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, []);

  const value = {
    adminState,
    isAuthenticated: !!adminState,
    isLoading,
    classes,
    pendingQuestions,
    loginAdmin,
    logout,
    handleQuestionApproval,
    refreshData,
  };

  return (
    <AdminContext.Provider value={value}>{children}</AdminContext.Provider>
  );
}

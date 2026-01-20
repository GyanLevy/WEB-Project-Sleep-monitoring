import { useState, useEffect } from "react";
import {
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from "firebase/auth";
import {
  collection,
  getDocs,
  query,
  where,
  doc,
  getDoc,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";
import { auth, db } from "../firebase";
import { getFirebaseErrorMessage } from "../utils/firebaseErrors";

import { AdminContext } from "./adminHelpers";

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

      const adminDocRef = doc(db, "admins", user.uid);
      const adminDoc = await getDoc(adminDocRef);

      if (!adminDoc.exists() || !adminDoc.data().isAdmin) {
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
        displayName: adminDoc.data().displayName || "Admin",
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
      const classesRef = collection(db, "classes");
      const classesSnap = await getDocs(classesRef);

      const classesData = [];

      for (const classDoc of classesSnap.docs) {
        const classId = classDoc.id;
        const className = classDoc.data().name;

        // Get students for this class
        const studentsRef = collection(db, "students");
        const studentsSnap = await getDocs(
          query(studentsRef, where("classId", "==", classId)),
        );

        const totalStudents = studentsSnap.size;

        // Count active students (submitted this month)
        const today = new Date();
        const currentMonth = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}`;

        let activeStudents = 0;
        for (const studentDoc of studentsSnap.docs) {
          const studentData = studentDoc.data();
          const lastSubmission = studentData.lastSubmissionDate;

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
      const questionsRef = collection(db, "questions");
      const allPendingSnap = await getDocs(
        query(questionsRef, where("status", "==", "pending")),
      );

      console.log(`Found ${allPendingSnap.size} total pending questions`);

      // Build pending questions map organized by class
      const pendingMap = {};

      // Initialize all classes in map
      classesData.forEach((cls) => {
        pendingMap[cls.id] = [];
      });

      // Process each pending question
      allPendingSnap.docs.forEach((qDoc) => {
        const questionData = qDoc.data();
        const classIds = questionData.classIds || [];

        const pending = {
          id: qDoc.id,
          text_he: questionData.text_he,
          type: questionData.type,
          emoji: questionData.emoji || "📝",
          options_he: questionData.options_he,
          options_emoji: questionData.options_emoji,
          unit_he: questionData.unit_he,
          createdBy: questionData.createdBy,
          createdAt: questionData.createdAt,
          submittedAt: questionData.createdAt,
          classIds: classIds, // For display
        };

        // If question is for ALL classes, add to all classes
        if (classIds.includes("all")) {
          console.log(`Question "${questionData.text_he}" is for ALL classes`);
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
                `Question "${questionData.text_he}" added to class ${classId}`,
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

  // Approve or reject question
  const handleQuestionApproval = async (classId, questionId, approved) => {
    try {
      const questionRef = doc(db, "questions", questionId);

      await updateDoc(questionRef, {
        status: approved ? "approved" : "rejected",
        approvedAt: serverTimestamp(),
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
        const adminDocRef = doc(db, "admins", user.uid);
        const adminDoc = await getDoc(adminDocRef);

        if (!isMounted) return;

        if (adminDoc.exists() && adminDoc.data().isAdmin) {
          setAdminState({
            uid: user.uid,
            email: user.email,
            displayName: adminDoc.data().displayName || "Admin",
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

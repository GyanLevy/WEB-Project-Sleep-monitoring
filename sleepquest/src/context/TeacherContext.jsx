import { useState, useEffect, useCallback } from "react";
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
  addDoc,
  serverTimestamp,
} from "firebase/firestore";
import { auth, db } from "../firebase";
import { getFirebaseErrorMessage } from "../utils/firebaseErrors";

import { TeacherContext } from "./teacherHelpers";

export function TeacherProvider({ children }) {
  const [teacherState, setTeacherState] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [classData, setClassData] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [allClasses, setAllClasses] = useState([]);

  // Login with Firebase
  const loginTeacher = async (email, password) => {
    setIsLoading(true);

    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password,
      );
      const user = userCredential.user;

      const teacherDocRef = doc(db, "teachers", user.uid);
      const teacherDoc = await getDoc(teacherDocRef);

      if (!teacherDoc.exists() || teacherDoc.data().role !== "teacher") {
        await signOut(auth);
        setIsLoading(false);
        return {
          success: false,
          error: "משתמש זה אינו מורה. אנא התחבר עם חשבון מורה.",
        };
      }

      setTeacherState({
        uid: user.uid,
        email: user.email,
        displayName: teacherDoc.data().displayName || "מורה",
        classId: teacherDoc.data().classId,
        studentCodes: teacherDoc.data().studentCodes,
      });

      if (teacherDoc.data().classId) {
        await loadClassData(teacherDoc.data().classId, user.uid);
      }

      // Load all classes for multi-class selection
      await loadAllClasses();

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

  // Load all classes
  const loadAllClasses = async () => {
    try {
      const classesRef = collection(db, "classes");
      const classesSnap = await getDocs(classesRef);

      const classes = classesSnap.docs.map((doc) => ({
        id: doc.id,
        name: doc.data().name,
      }));

      setAllClasses(classes);
      console.log("All classes loaded:", classes);
    } catch (error) {
      console.error("Error loading all classes:", error);
    }
  };

  // Load class data
  const loadClassData = async (classId, teacherId) => {
    try {
      const classDocRef = doc(db, "classes", classId);
      const classDoc = await getDoc(classDocRef);

      if (!classDoc.exists()) {
        console.error("Class not found");
        return;
      }

      const className = classDoc.data().name;

      const studentsRef = collection(db, "students");
      const studentsSnap = await getDocs(
        query(studentsRef, where("classId", "==", classId)),
      );

      const totalStudents = studentsSnap.size;

      // Build submissions data (7 days)
      const submissions = [];
      for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split("T")[0];

        let submitted = 0;
        for (const studentDoc of studentsSnap.docs) {
          const studentData = studentDoc.data();
          const lastSubmission = studentData.lastSubmissionDate;

          if (lastSubmission === dateStr) {
            submitted++;
          }
        }

        submissions.push({
          date: dateStr,
          submitted: submitted,
          total: totalStudents,
          submittedAt: new Date(dateStr).toISOString(),
        });
      }

      setClassData({
        classId: classId,
        className: className,
        totalStudents: totalStudents,
        submissions: submissions,
      });

      await loadTeacherQuestions(classId, teacherId);
    } catch (error) {
      console.error("Error loading class data:", error);
    }
  };

  // Load teacher's questions
  const loadTeacherQuestions = async (classId, teacherId) => {
    try {
      const questionsRef = collection(db, "questions");
      const questionsSnap = await getDocs(
        query(questionsRef, where("createdBy", "==", teacherId)),
      );

      const teacherQuestions = questionsSnap.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setQuestions(teacherQuestions);
      console.log("Loaded teacher questions:", teacherQuestions);
    } catch (error) {
      console.error("Error loading questions:", error);
    }
  };

  // Add question with multi-class support
  const addQuestion = async (questionData) => {
    try {
      if (!teacherState || !classData) {
        return {
          success: false,
          error: "נתונים חסרים",
        };
      }

      if (!questionData.text_he || !questionData.type) {
        return {
          success: false,
          error: "נתונים חסרים (טקסט וסוג)",
        };
      }

      const questionCount = questions.length;
      if (questionCount >= 5) {
        return {
          success: false,
          error: "לא ניתן להוסיף יותר משאלות. מקסימום 5 שאלות.",
        };
      }

      console.log("Adding question with data:", questionData);

      // Determine classIds
      let classIds = questionData.classIds || [];
      if (classIds.length === 0) {
        classIds = [classData.classId]; // Default to current class
      }

      const newQuestion = {
        text_he: questionData.text_he,
        type: questionData.type,
        status: "pending",
        createdBy: teacherState.uid,
        createdAt: serverTimestamp(),

        emoji: questionData.emoji || "📝",

        ...(questionData.options_he && {
          options_he: questionData.options_he,
        }),
        ...(questionData.options_emoji && {
          options_emoji: questionData.options_emoji,
        }),
        ...(questionData.unit_he && {
          unit_he: questionData.unit_he,
        }),

        // Multi-class support
        classIds: classIds,

        approvedAt: null,
        approvedBy: null,
      };

      const questionsRef = collection(db, "questions");
      const docRef = await addDoc(questionsRef, newQuestion);

      console.log("Question added with ID:", docRef.id);

      setQuestions([
        ...questions,
        {
          id: docRef.id,
          ...newQuestion,
          createdAt: new Date().toISOString(),
        },
      ]);

      const classNames = classIds.includes("all")
        ? "כל הכיתות"
        : classIds
            .map((id) => allClasses.find((c) => c.id === id)?.name || id)
            .join(", ");

      return {
        success: true,
        message: `השאלה נוספה בהצלחה וממתינה לאישור (${classNames})`,
      };
    } catch (error) {
      console.error("Error adding question:", error);
      return {
        success: false,
        error: error.message,
      };
    }
  };

  // Get question counts
  const getQuestionCount = () => questions.length;

  const getApprovedQuestionCount = () =>
    questions.filter((q) => q.status === "approved").length;

  const getPendingQuestionCount = () =>
    questions.filter((q) => q.status === "pending").length;

  const getSubmissionsData = () => classData?.submissions || [];

  // Get all classes (for multi-class selection)
  const getAllClasses = useCallback(() => allClasses, [allClasses]);

  // Logout
  const logout = async () => {
    try {
      await signOut(auth);
      setTeacherState(null);
      setClassData(null);
      setQuestions([]);
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  // Refresh data
  const refreshData = async () => {
    if (teacherState && classData) {
      await loadClassData(classData.classId, teacherState.uid);
    }
  };

  // Monitor auth state
  useEffect(() => {
    let isMounted = true;

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!isMounted) return;

      if (user) {
        const teacherDocRef = doc(db, "teachers", user.uid);
        const teacherDoc = await getDoc(teacherDocRef);

        if (!isMounted) return;

        if (teacherDoc.exists() && teacherDoc.data().role === "teacher") {
          setTeacherState({
            uid: user.uid,
            email: user.email,
            displayName: teacherDoc.data().displayName || "מורה",
            classId: teacherDoc.data().classId,
            studentCodes: teacherDoc.data().studentCodes || [],
          });

          if (teacherDoc.data().classId) {
            await loadClassData(teacherDoc.data().classId, user.uid);
          }

          await loadAllClasses();
        }
      } else {
        if (!isMounted) return;
        setTeacherState(null);
        setClassData(null);
        setQuestions([]);
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
    teacherState,
    isAuthenticated: !!teacherState,
    isLoading,
    classData,
    questions,
    loginTeacher,
    logout,
    addQuestion,
    refreshData,
    getSubmissionsData,
    getQuestionCount,
    getApprovedQuestionCount,
    getPendingQuestionCount,
    getAllClasses,
  };

  return (
    <TeacherContext.Provider value={value}>{children}</TeacherContext.Provider>
  );
}

// export default TeacherContext; // Removing default export to satisfy Fast Refresh

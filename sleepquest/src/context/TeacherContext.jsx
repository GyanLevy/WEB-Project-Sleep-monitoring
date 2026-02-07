import { useState, useEffect, useCallback } from "react";
import {
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from "firebase/auth";
import { collection, addDoc } from "firebase/firestore";
import { auth } from "../firebase";
import { getFirebaseErrorMessage } from "../utils/firebaseErrors";
import { TeacherContext } from "./teacherHelpers";
import {
  getDocument,
  getAllDocuments,
  queryDocuments,
  db,
  getServerTimestamp,
} from "../utils/firebaseUtils";

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

      // Use utility to get teacher document
      const teacherData = await getDocument("teachers", user.uid);

      if (!teacherData || teacherData.role !== "teacher") {
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
        displayName: teacherData.displayName || "מורה",
        classId: teacherData.classId,
        studentCodes: teacherData.studentCodes,
      });

      if (teacherData.classId) {
        await loadClassData(teacherData.classId, user.uid);
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

  // Load all classes using utility
  const loadAllClasses = async () => {
    try {
      const classes = await getAllDocuments("classes");

      const formattedClasses = classes.map((doc) => ({
        id: doc.id,
        name: doc.name,
      }));

      setAllClasses(formattedClasses);
      console.log("All classes loaded:", formattedClasses);
    } catch (error) {
      console.error("Error loading all classes:", error);
    }
  };

  // Load class data
  const loadClassData = async (classId, teacherId) => {
    try {
      // Get class document using utility
      const classDoc = await getDocument("classes", classId);

      if (!classDoc) {
        console.error("Class not found");
        return;
      }

      const className = classDoc.name;

      // Get students for this class using utility
      const students = await queryDocuments(
        "students",
        "classId",
        "==",
        classId,
      );

      const totalStudents = students.length;

      // Build submissions data (7 days)
      const submissions = [];
      for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split("T")[0];

        let submitted = 0;
        for (const student of students) {
          const lastSubmission = student.lastSubmissionDate;

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

  // Load teacher's questions using utility
  const loadTeacherQuestions = async (classId, teacherId) => {
    try {
      const teacherQuestions = await queryDocuments(
        "questions",
        "createdBy",
        "==",
        teacherId,
      );

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
        createdAt: getServerTimestamp(),

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

      // Use Firebase directly for addDoc (could add to utility if needed)
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
        // Use utility to get teacher document
        const teacherData = await getDocument("teachers", user.uid);

        if (!isMounted) return;

        if (teacherData && teacherData.role === "teacher") {
          setTeacherState({
            uid: user.uid,
            email: user.email,
            displayName: teacherData.displayName || "מורה",
            classId: teacherData.classId,
            studentCodes: teacherData.studentCodes || [],
          });

          if (teacherData.classId) {
            await loadClassData(teacherData.classId, user.uid);
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

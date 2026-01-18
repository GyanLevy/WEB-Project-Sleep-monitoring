/**

 * Admin component to view, manage, and delete teachers
 * All text in Hebrew
 *
 * Features:
 * - List all teachers
 * - Show teacher details (name, email, class)
 * - Delete individual teachers
 * - Confirmation before delete
 * - Progress tracking
 */

import { useState, useEffect } from "react";
import {
  collection,
  getDocs,
  deleteDoc,
  doc,
  updateDoc,
} from "firebase/firestore";
import { db } from "../firebase";

export default function TeacherManagement() {
  const [teachers, setTeachers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState(null); // { teacherId, teacherName }
  const [isDeleting, setIsDeleting] = useState(false);

  // Load teachers on mount
  useEffect(() => {
    loadTeachers();
  }, []);

  const loadTeachers = async () => {
    try {
      setIsLoading(true);
      setError("");
      const teachersRef = collection(db, "teachers");
      const snapshot = await getDocs(teachersRef);

      const teacherList = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setTeachers(teacherList);
      console.log("✅ Teachers loaded:", teacherList.length);
    } catch (err) {
      console.error("Failed to load teachers:", err);
      setError("❌ טעות בטעינת מורים");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteTeacher = async (teacherId) => {
    setIsDeleting(true);
    setError("");

    try {
      // Step 1: If teacher is assigned to a class, clear the assignment
      const teacherRef = doc(db, "teachers", teacherId);
      const teacher = teachers.find((t) => t.id === teacherId);

      if (teacher?.classId) {
        // Clear the teacher assignment from the class
        const classRef = doc(db, "classes", teacher.classId);
        await updateDoc(classRef, {
          teacherId: null,
        });
        console.log("✅ Cleared teacher from class");
      }

      // Step 2: Delete the teacher document
      await deleteDoc(teacherRef);
      console.log("✅ Teacher deleted");

      // Step 3: Update UI
      setTeachers(teachers.filter((t) => t.id !== teacherId));
      setDeleteConfirm(null);
      setSuccessMessage(`✅ ${teacher?.displayName || "המורה"} נמחק בהצלחה!`);

      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (err) {
      console.error("Error deleting teacher:", err);
      setError(`❌ טעות במחיקת המורה: ${err.message}`);
    } finally {
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg p-8">
        <div className="flex items-center justify-center py-8">
          <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
          <p className="mr-4 text-slate-600 dark:text-slate-400">
            טוען מורים...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="bg-white dark:bg-slate-800 rounded-lg shadow-lg overflow-hidden"
      dir="rtl"
    >
      {/* Header */}
      <div className="p-6 border-b border-slate-200 dark:border-slate-700/50 text-right">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
          👥 ניהול מורים
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mt-1">
          הצג וטפל במורים
        </p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-500/10 border-b border-red-200 dark:border-red-500/30 text-red-600 dark:text-red-400 text-right">
          {error}
        </div>
      )}

      {/* Success Message */}
      {successMessage && (
        <div className="p-4 bg-green-50 dark:bg-green-500/10 border-b border-green-200 dark:border-green-500/30 text-green-600 dark:text-green-400 text-right">
          {successMessage}
        </div>
      )}

      {/* Teachers List */}
      {teachers.length === 0 ? (
        <div className="p-12 text-center">
          <p className="text-slate-500 dark:text-slate-400">לא נמצאו מורים</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 dark:bg-slate-700/30">
              <tr>
                <th className="px-6 py-4 text-right text-sm font-semibold text-slate-600 dark:text-slate-300">
                  שם המורה
                </th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-slate-600 dark:text-slate-300">
                  דוא״ל
                </th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-slate-600 dark:text-slate-300">
                  כיתה מוקצה
                </th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-slate-600 dark:text-slate-300">
                  תאריך יצירה
                </th>
                <th className="px-6 py-4 text-center text-sm font-semibold text-slate-600 dark:text-slate-300">
                  פעולות
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-700/50">
              {teachers.map((teacher) => (
                <tr
                  key={teacher.id}
                  className="hover:bg-slate-50 dark:hover:bg-slate-700/20 transition-colors"
                >
                  <td className="px-6 py-4 text-slate-900 dark:text-white font-medium text-right">
                    {teacher.displayName}
                  </td>
                  <td className="px-6 py-4 text-slate-600 dark:text-slate-400 text-right">
                    {teacher.email}
                  </td>
                  <td className="px-6 py-4 text-right">
                    {teacher.classId ? (
                      <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-300 text-sm font-medium">
                        📚 {teacher.classId}
                      </span>
                    ) : (
                      <span className="text-slate-400 dark:text-slate-500">
                        -
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-slate-600 dark:text-slate-400 text-sm text-right">
                    {teacher.createdAt
                      ? new Date(
                          teacher.createdAt.toDate?.() || teacher.createdAt,
                        ).toLocaleDateString("he-IL")
                      : "-"}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <button
                      onClick={() =>
                        setDeleteConfirm({
                          teacherId: teacher.id,
                          teacherName: teacher.displayName,
                        })
                      }
                      className="px-3 py-2 rounded-lg bg-red-100 dark:bg-red-500/20 hover:bg-red-200 dark:hover:bg-red-500/30 text-red-600 dark:text-red-400 text-sm font-semibold transition-colors"
                    >
                      🗑️ מחק
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <DeleteConfirmationModal
          teacherName={deleteConfirm.teacherName}
          onConfirm={() => handleDeleteTeacher(deleteConfirm.teacherId)}
          onCancel={() => setDeleteConfirm(null)}
          isDeleting={isDeleting}
        />
      )}
    </div>
  );
}

function DeleteConfirmationModal({
  teacherName,
  onConfirm,
  onCancel,
  isDeleting,
}) {
  return (
    <div className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center p-4 z-50">
      <div
        className="bg-white dark:bg-slate-800 rounded-lg shadow-xl max-w-sm w-full p-6"
        dir="rtl"
      >
        <div className="flex items-start gap-4 justify-end">
          <div className="flex-1 text-right">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
              מחיקת מורה?
            </h3>
            <p className="text-slate-600 dark:text-slate-400 mb-4">
              האם אתה בטוח שברצונך למחוק את <strong>{teacherName}</strong>? לא
              ניתן לבטל פעולה זו.
            </p>
            <p className="text-sm text-orange-600 dark:text-orange-400 mb-6">
              ⚠️ אם המורה הזה מוקצה לכיתה, הכיתה תישאר אך תאבד את הקצאת המורה.
            </p>
          </div>
          <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-500/20 flex items-center justify-center flex-shrink-0">
            <span className="text-lg">⚠️</span>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={onConfirm}
            disabled={isDeleting}
            className="flex-1 px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 disabled:bg-slate-400 text-white font-medium transition flex items-center justify-center gap-2"
          >
            {isDeleting ? (
              <>
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="none"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                  />
                </svg>
                מוחק...
              </>
            ) : (
              "🗑️ מחק מורה"
            )}
          </button>
          <button
            onClick={onCancel}
            disabled={isDeleting}
            className="flex-1 px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700/30 font-medium transition disabled:opacity-50"
          >
            ביטול
          </button>
        </div>
      </div>
    </div>
  );
}

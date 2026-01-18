/**
 * Admin component to view and delete classes *
 * Features:
 * - List all classes with student count
 * - Show class details
 * - Delete classes (removes all students + class doc)
 * - Unassigns teacher from class
 * - Confirmation before delete
 * - Progress tracking
 */

import { useDeleteClass } from "../hooks/useDeleteClass";

export default function ClassManagement() {
  const {
    classes,
    isLoading,
    error,
    successMessage,
    deleteConfirm,
    isDeleting,
    handleDeleteClass,
    setDeleteConfirm,
  } = useDeleteClass();

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg p-8">
        <div className="flex items-center justify-center py-8">
          <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
          <p className="mr-4 text-slate-600 dark:text-slate-400">
            טוען כיתות...
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
          🎓 ניהול כיתות
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mt-1">
          הצג וטפל בכיתות
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
        <div className="p-4 bg-blue-50 dark:bg-blue-500/10 border-b border-blue-200 dark:border-blue-500/30 text-blue-600 dark:text-blue-400 text-right">
          {successMessage}
        </div>
      )}

      {/* Classes List */}
      {classes.length === 0 ? (
        <div className="p-12 text-center">
          <p className="text-slate-500 dark:text-slate-400">לא נמצאו כיתות</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 dark:bg-slate-700/30">
              <tr>
                <th className="px-6 py-4 text-right text-sm font-semibold text-slate-600 dark:text-slate-300">
                  שם הכיתה
                </th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-slate-600 dark:text-slate-300">
                  מורה
                </th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-slate-600 dark:text-slate-300">
                  תלמידים
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
              {classes.map((classItem) => (
                <tr
                  key={classItem.id}
                  className="hover:bg-slate-50 dark:hover:bg-slate-700/20 transition-colors"
                >
                  <td className="px-6 py-4 text-slate-900 dark:text-white font-medium text-right">
                    {classItem.name}
                  </td>
                  <td className="px-6 py-4 text-right">
                    {classItem.teacherId ? (
                      <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-300 text-sm font-medium">
                        👨‍🏫 מוקצה
                      </span>
                    ) : (
                      <span className="text-slate-400 dark:text-slate-500 text-sm">
                        לא מוקצה
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-300 text-sm font-bold">
                      👥 {classItem.studentCount}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-slate-600 dark:text-slate-400 text-sm text-right">
                    {classItem.createdAt
                      ? new Date(
                          classItem.createdAt.toDate?.() || classItem.createdAt,
                        ).toLocaleDateString("he-IL")
                      : "-"}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <button
                      onClick={() =>
                        setDeleteConfirm({
                          classId: classItem.id,
                          className: classItem.name,
                          studentCount: classItem.studentCount,
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
          className={deleteConfirm.className}
          studentCount={deleteConfirm.studentCount}
          onConfirm={() => handleDeleteClass(deleteConfirm.classId)}
          onCancel={() => setDeleteConfirm(null)}
          isDeleting={isDeleting}
        />
      )}
    </div>
  );
}

function DeleteConfirmationModal({
  className,
  studentCount,
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
              מחיקת כיתה שלמה?
            </h3>
            <p className="text-slate-600 dark:text-slate-400 mb-4">
              האם אתה בטוח שברצונך למחוק את <strong>{className}</strong>? לא
              ניתן לבטל פעולה זו.
            </p>
            <div className="bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 rounded-lg p-3 mb-6">
              <p className="text-sm text-red-700 dark:text-red-400">
                ⚠️ זה ימחק:
              </p>
              <ul className="text-sm text-red-600 dark:text-red-400 mt-2 space-y-1 text-right">
                <li>• מסמך הכיתה</li>
                <li>• כל {studentCount} חשבונות התלמידים</li>
                <li>• כל נתוני התלמידים והרשומות</li>
              </ul>
            </div>
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
              "🗑️ מחק כיתה"
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

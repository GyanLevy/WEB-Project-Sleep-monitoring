/**
 * Workflow:
 * 1. Create teacher first (WITHOUT class assignment)
 * 2. Create class and assign that teacher
 * 3. Teacher gets studentCodes when assigned to class
 *
 * Features:
 * - Teacher required at class creation
 * - Codes generated automatically
 * - Teacher linked to class automatically
 */

import { useCreateClass } from "../hooks/useCreateClass";

export default function CreateClassForm() {
  const {
    className,
    setClassName,
    selectedTeacherId,
    setSelectedTeacherId,
    teachers,
    unassignedTeachers,
    assignedTeachers,
    isLoadingTeachers,
    isLoading,
    error,
    success,
    progress,
    generatedCodes,
    handleSubmit,
    handleCopyCodes,
    handleDownloadCodes,
  } = useCreateClass();

  return (
    <div
      className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50 to-slate-100 dark:from-slate-900 dark:via-indigo-950 dark:to-slate-900 p-4"
      dir="rtl"
    >
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-2">
            🎓 יצירת כיתה חדשה
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            צור קודים עבור הכיתה החדשה
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg p-8 mb-6">
          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 rounded-lg text-red-600 dark:text-red-400">
              {error}
            </div>
          )}

          {/* Progress Message */}
          {progress && (
            <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/30 rounded-lg text-blue-600 dark:text-blue-400">
              {progress}
            </div>
          )}

          {/* Success Message */}
          {success && generatedCodes.length > 0 && (
            <div className="mb-6 p-4 bg-green-50 dark:bg-green-500/10 border border-green-200 dark:border-green-500/30 rounded-lg">
              <p className="text-green-600 dark:text-green-400 font-semibold mb-4">
                ✅ כיתה נוצרה בהצלחה!
              </p>
              <p className="text-sm text-green-600 dark:text-green-400 mb-4">
                30 קודים של סטודנטים נוצרו ונוספו למורה
              </p>

              {/* Codes Display */}
              <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-lg mb-4 max-h-48 overflow-y-auto font-mono text-sm text-right">
                {generatedCodes.map((code, idx) => (
                  <div
                    key={code}
                    className="text-slate-700 dark:text-slate-300"
                  >
                    {idx + 1}. {code}
                  </div>
                ))}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2">
                <button
                  onClick={handleCopyCodes}
                  className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition"
                >
                  📋 העתק את כל הקודים
                </button>
                <button
                  onClick={handleDownloadCodes}
                  className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition"
                >
                  💾 הורדה
                </button>
              </div>
            </div>
          )}

          {/* Form (hidden during loading/success) */}
          {!isLoading && !success && (
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Class Name Input */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  שם הכיתה (פורמט: class_1xx) *
                </label>
                <input
                  type="text"
                  value={className}
                  onChange={(e) => setClassName(e.target.value)}
                  placeholder="לדוגמה: class_101"
                  className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-right"
                />
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  חובה
                </p>
              </div>

              {/* Teacher Selection - REQUIRED */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  בחר מורה של הכיתה *
                </label>

                {isLoadingTeachers ? (
                  <div className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400">
                    ⏳ טוען מורים...
                  </div>
                ) : teachers.length === 0 ? (
                  <div className="w-full px-4 py-3 border border-orange-300 dark:border-orange-600 rounded-lg bg-orange-50 dark:bg-orange-500/10 text-right">
                    <p className="text-orange-700 dark:text-orange-400 font-semibold">
                      ⚠️ אין מורים פנויים
                    </p>
                    <p className="text-sm text-orange-600 dark:text-orange-300 mt-1">
                      בבקשה צור מורה חדש שתוכל לבחור.
                    </p>
                  </div>
                ) : (
                  <>
                    <select
                      value={selectedTeacherId}
                      onChange={(e) => setSelectedTeacherId(e.target.value)}
                      className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-right"
                    >
                      <option value="">-- בחר מורה --</option>
                      {unassignedTeachers.length > 0 ? (
                        <>
                          <optgroup label="פנוי (לא מוקצה)">
                            {unassignedTeachers.map((teacher) => (
                              <option key={teacher.id} value={teacher.id}>
                                {teacher.displayName} ({teacher.email})
                              </option>
                            ))}
                          </optgroup>
                        </>
                      ) : null}
                    </select>

                    {/* Teacher Status */}
                    <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/30 rounded-lg text-right">
                      <p className="text-xs font-semibold text-blue-900 dark:text-blue-300 mb-2">
                        👥 מצב מורים:
                      </p>
                      <p className="text-xs text-blue-800 dark:text-blue-400">
                        {unassignedTeachers.length} פנוי •{" "}
                        {assignedTeachers.length} תפוס
                      </p>
                      {assignedTeachers.length > 0 && (
                        <div className="mt-2 p-2 bg-blue-100 dark:bg-blue-500/20 rounded text-xs text-blue-700 dark:text-blue-300">
                          <p className="font-semibold mb-1">מורים תפוסים:</p>
                          {assignedTeachers.map((t) => (
                            <p key={t.id}>
                              • {t.displayName} → {t.classId}
                            </p>
                          ))}
                        </div>
                      )}
                    </div>
                  </>
                )}

                <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                  בקשה צור מורה חדש שתוכל לבחור.
                </p>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading || teachers.length === 0}
                className="w-full py-3 px-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 disabled:from-slate-400 disabled:to-slate-400 text-white font-semibold rounded-lg transition"
              >
                {isLoading ? "⏳ יוצר..." : "✨ כיתה נוצרה וקודים נוצרו"}
              </button>
            </form>
          )}

          {/* Loading Spinner */}
          {isLoading && (
            <div className="flex flex-col items-center justify-center py-8">
              <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mb-4"></div>
              <p className="text-slate-600 dark:text-slate-400">{progress}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

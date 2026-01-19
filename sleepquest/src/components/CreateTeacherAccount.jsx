/**
 *
 * Admin form to create new teacher accounts
 * All logic delegated to custom hooks
 *
 * Features:
 * - Email/password authentication
 * - Class assignment is OPTIONAL
 * - Can create teacher and assign class later
 * - Firebase Auth integration
 * - Progress tracking and error handling
 */

import { useCreateTeacher } from "../hooks/useCreateTeacher";

export default function CreateTeacherAccount() {
  const {
    displayName,
    setDisplayName,
    email,
    setEmail,
    password,
    setPassword,
    confirmPassword,
    setConfirmPassword,
    selectedClassId,
    setSelectedClassId,
    classes,
    classesWithoutTeacher,
    isLoadingClasses,
    isLoading,
    error,
    success,
    progress,
    handleSubmit,
    resetForm,
  } = useCreateTeacher();

  return (
    <div
      className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50 to-slate-100 dark:from-slate-900 dark:via-indigo-950 dark:to-slate-900 p-4"
      dir="rtl"
    >
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-2">
            👨‍🏫 יצירת חשבון מורה
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            צור חשבון מורה חדש עם דוא״ל וסיסמה
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
          {success && (
            <div className="mb-6 p-4 bg-green-50 dark:bg-green-500/10 border border-green-200 dark:border-green-500/30 rounded-lg">
              <p className="text-green-600 dark:text-green-400 font-semibold mb-2">
                ✅ חשבון המורה נוצר בהצלחה!
              </p>
            </div>
          )}

          {/* Form (hidden during loading/success) */}
          {!isLoading && !success && (
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Teacher Name Input */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  שם המורה *
                </label>
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="לדוגמה: דר׳ דוד כהן"
                  className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-right"
                />
              </div>

              {/* Email Input */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  כתובת דוא״ל *
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="לדוגמה: teacher@school.com"
                  className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-right"
                />
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  המורה ישתמש בזה להתחברות
                </p>
              </div>

              {/* Password Input */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  סיסמה *
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="לפחות 6 תווים"
                  className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-right"
                />
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  מינימום 6 תווים
                </p>
              </div>

              {/* Confirm Password Input */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  אימות סיסמה *
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="חזור על הסיסמה"
                  className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-right"
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 px-4 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 disabled:from-slate-400 disabled:to-slate-400 text-white font-semibold rounded-lg transition"
              >
                {isLoading ? "⏳ יוצר..." : "✨ יצירת חשבון מורה"}
              </button>
            </form>
          )}

          {/* Loading Spinner */}
          {isLoading && (
            <div className="flex flex-col items-center justify-center py-8">
              <div className="w-12 h-12 border-4 border-green-200 border-t-green-600 rounded-full animate-spin mb-4"></div>
              <p className="text-slate-600 dark:text-slate-400">{progress}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

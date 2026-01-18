import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAdmin } from "../context/adminHelpers";
import { LoadingSpinner, ThemeToggle } from "./ui";

/**
 * AdminLoginScreen Component
 * Admin system login with email and password
 */
export default function AdminLoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { loginAdmin, isLoading: adminLoading } = useAdmin();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    if (!email || !password) {
      setError("אנא מלא את כל השדות");
      setIsLoading(false);
      return;
    }

    const result = await loginAdmin(email, password);

    if (!result.success) {
      setError(result.error);
      setIsLoading(false);
      return;
    }

    navigate("/admin/dashboard");
  };

  if (adminLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50 to-slate-100 dark:from-slate-900 dark:via-indigo-950 dark:to-slate-900 flex items-center justify-center transition-colors duration-300">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50 to-slate-100 dark:from-slate-900 dark:via-indigo-950 dark:to-slate-900 flex flex-col items-center justify-center p-4 transition-colors duration-300">
      {/* Admin Badge */}
      <div className="absolute top-4 right-4 flex items-center gap-2 px-4 py-2 bg-red-100 dark:bg-red-500/20 rounded-full">
        <svg
          className="w-5 h-5 text-red-600 dark:text-red-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 9v2m0 4v2m0 4v2M7.08 6.47A9 9 0 1020.92 17.53M12 3v1m0 16v1"
          />
        </svg>
        <span className="text-red-600 dark:text-red-400 text-sm font-bold">
          מסך אדמין
        </span>
      </div>

      <div className="relative z-10 w-full max-w-md">
        {/* Theme Toggle */}
        <div className="absolute top-0 left-0 -translate-y-full pb-4">
          <ThemeToggle />
        </div>

        {/* Header */}
        <AdminLoginHeader />

        {/* Login Card */}
        <div className="bg-white/80 dark:bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-slate-200 dark:border-slate-700/50 p-8 shadow-xl dark:shadow-2xl transition-colors duration-300">
          <AdminLoginForm
            email={email}
            password={password}
            error={error}
            isLoading={isLoading}
            onEmailChange={(e) => {
              setEmail(e.target.value);
              setError("");
            }}
            onPasswordChange={(e) => {
              setPassword(e.target.value);
              setError("");
            }}
            onSubmit={handleSubmit}
          />

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200 dark:border-slate-700 transition-colors duration-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white/80 dark:bg-slate-800/50 text-slate-400 dark:text-slate-500 transition-colors duration-300">
                למשתמשים רגילים
              </span>
            </div>
          </div>

          {/* Back to Student Login */}
          <BackToStudentLoginButton />
        </div>

        {/* Security Notice */}
        <SecurityNotice />
      </div>
    </div>
  );
}

function AdminLoginHeader() {
  return (
    <div className="text-center mb-8">
      <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-red-500 to-orange-600 shadow-lg shadow-red-500/30 mb-4">
        <svg
          className="w-10 h-10 text-white"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M13 10V3L4 14h7v7l9-11h-7z"
          />
        </svg>
      </div>
      <h1 className="text-4xl font-bold bg-gradient-to-r from-red-600 via-orange-600 to-red-600 dark:from-red-400 dark:via-orange-400 dark:to-red-400 bg-clip-text text-transparent">
        כניסת מנהל מערכת
      </h1>
      <p className="text-slate-500 dark:text-slate-400 mt-2 transition-colors duration-300">
        ממשק ניהול הבדיקה של SleepQuest
      </p>
    </div>
  );
}

function AdminLoginForm({
  email,
  password,
  error,
  isLoading,
  onEmailChange,
  onPasswordChange,
  onSubmit,
}) {
  return (
    <form onSubmit={onSubmit} className="space-y-6">
      {/* Email Input */}
      <div>
        <label className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-2 transition-colors duration-300">
          אימייל
        </label>
        <input
          type="email"
          value={email}
          onChange={onEmailChange}
          placeholder="admin@example.com"
          className="w-full px-4 py-4 bg-slate-50 dark:bg-slate-900/50 border border-slate-300 dark:border-slate-600 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
          style={{ direction: "ltr" }}
        />
      </div>

      {/* Password Input */}
      <div>
        <label className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-2 transition-colors duration-300">
          סיסמה
        </label>
        <input
          type="password"
          value={password}
          onChange={onPasswordChange}
          placeholder="••••••••"
          className="w-full px-4 py-4 bg-slate-50 dark:bg-slate-900/50 border border-slate-300 dark:border-slate-600 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
          style={{ direction: "ltr" }}
        />
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 rounded-xl p-4 text-red-600 dark:text-red-400 text-sm text-center animate-shake transition-colors duration-300">
          {error}
        </div>
      )}

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isLoading}
        className="w-full py-4 px-6 bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-500 hover:to-orange-500 disabled:from-slate-400 disabled:to-slate-400 dark:disabled:from-slate-600 dark:disabled:to-slate-600 disabled:cursor-not-allowed text-white font-semibold rounded-xl shadow-lg shadow-red-500/25 hover:shadow-red-500/40 transition-all duration-300 transform hover:scale-[1.02] disabled:hover:scale-100"
      >
        {isLoading ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
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
            מתחבר...
          </span>
        ) : (
          "התחבר לממשק אדמין"
        )}
      </button>
    </form>
  );
}

function BackToStudentLoginButton() {
  const navigate = useNavigate();

  return (
    <button
      type="button"
      onClick={() => navigate("/")}
      className="w-full py-3 px-4 bg-slate-100 dark:bg-slate-700/30 hover:bg-slate-200 dark:hover:bg-slate-700/50 border border-slate-200 dark:border-slate-600/50 text-slate-600 dark:text-slate-400 rounded-xl transition-all duration-200"
    >
      ← חזור להתחברות סטודנט
    </button>
  );
}

function SecurityNotice() {
  return (
    <div className="mt-6 text-center">
      <div className="inline-flex items-center gap-2 text-xs text-slate-400 dark:text-slate-500 transition-colors duration-300">
        <svg
          className="w-4 h-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
          />
        </svg>
        <span>גישה מוגבלת למנהלי מערכת בלבד • הכניסה מוצפנת</span>
      </div>
    </div>
  );
}

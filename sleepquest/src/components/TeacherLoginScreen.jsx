import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTeacher } from '../hooks/useTeacher';
import { LoadingSpinner, ThemeToggle } from './ui';

/**
 * TeacherLoginScreen Component
 * Teacher system login with email and password
 */
export default function TeacherLoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { loginTeacher, isLoading: teacherLoading } = useTeacher();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    if (!email || !password) {
      setError('אנא מלא את כל השדות');
      setIsLoading(false);
      return;
    }

    const result = await loginTeacher(email, password);

    if (!result.success) {
      setError(result.error);
      setIsLoading(false);
      return;
    }

    navigate('/teacher/dashboard');
  };

  if (teacherLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50 to-slate-100 dark:from-slate-900 dark:via-indigo-950 dark:to-slate-900 flex items-center justify-center transition-colors duration-300">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50 to-slate-100 dark:from-slate-900 dark:via-indigo-950 dark:to-slate-900 flex flex-col items-center justify-center p-4 transition-colors duration-300">
      {/* Teacher Badge */}
      <div className="absolute top-4 right-4 flex items-center gap-2 px-4 py-2 bg-green-100 dark:bg-green-500/20 rounded-full">
        <svg className="w-5 h-5 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
        </svg>
        <span className="text-green-600 dark:text-green-400 text-sm font-bold">מסך מורה</span>
      </div>

      <div className="relative z-10 w-full max-w-md">
        {/* Theme Toggle */}
        <div className="absolute top-0 left-0 -translate-y-full pb-4">
          <ThemeToggle />
        </div>

        {/* Header */}
        <TeacherLoginHeader />

        {/* Login Card */}
        <div className="bg-white/80 dark:bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-slate-200 dark:border-slate-700/50 p-8 shadow-xl dark:shadow-2xl transition-colors duration-300">
          <TeacherLoginForm
            email={email}
            password={password}
            error={error}
            isLoading={isLoading}
            onEmailChange={(e) => {
              setEmail(e.target.value);
              setError('');
            }}
            onPasswordChange={(e) => {
              setPassword(e.target.value);
              setError('');
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
                למשתמשים אחרים
              </span>
            </div>
          </div>

          {/* Back to Home */}
          <BackToHomeButton />
        </div>

        {/* Security Notice */}
        <SecurityNotice />
      </div>
    </div>
  );
}

function TeacherLoginHeader() {
  return (
    <div className="text-center mb-8">
      <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 shadow-lg shadow-green-500/30 mb-4">
        <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      </div>
      <h1 className="text-4xl font-bold bg-gradient-to-r from-green-600 via-emerald-600 to-green-600 dark:from-green-400 dark:via-emerald-400 dark:to-green-400 bg-clip-text text-transparent">
        כניסת מורה
      </h1>
      <p className="text-slate-500 dark:text-slate-400 mt-2 transition-colors duration-300">
        ניהול כיתה וערוץ שאלות
      </p>
    </div>
  );
}

function TeacherLoginForm({ email, password, error, isLoading, onEmailChange, onPasswordChange, onSubmit }) {
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
          placeholder="teacher@school.com"
          className="w-full px-4 py-4 bg-slate-50 dark:bg-slate-900/50 border border-slate-300 dark:border-slate-600 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
          style={{ direction: 'ltr' }}
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
          className="w-full px-4 py-4 bg-slate-50 dark:bg-slate-900/50 border border-slate-300 dark:border-slate-600 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
          style={{ direction: 'ltr' }}
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
        className="w-full py-4 px-6 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 disabled:from-slate-400 disabled:to-slate-400 dark:disabled:from-slate-600 dark:disabled:to-slate-600 disabled:cursor-not-allowed text-white font-semibold rounded-xl shadow-lg shadow-green-500/25 hover:shadow-green-500/40 transition-all duration-300 transform hover:scale-[1.02] disabled:hover:scale-100"
      >
        {isLoading ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            מתחבר...
          </span>
        ) : (
          'התחבר כמורה'
        )}
      </button>
    </form>
  );
}

function BackToHomeButton() {
  const navigate = useNavigate();

  return (
    <button
      type="button"
      onClick={() => navigate('/')}
      className="w-full py-3 px-4 bg-slate-100 dark:bg-slate-700/30 hover:bg-slate-200 dark:hover:bg-slate-700/50 border border-slate-200 dark:border-slate-600/50 text-slate-600 dark:text-slate-400 rounded-xl transition-all duration-200"
    >
      ← חזור לעמוד הבית
    </button>
  );
}

function SecurityNotice() {
  return (
    <div className="mt-6 text-center">
      <div className="inline-flex items-center gap-2 text-xs text-slate-400 dark:text-slate-500 transition-colors duration-300">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
        <span>רק מורים מורשים • הכניסה מוצפנת</span>
      </div>
    </div>
  );
}

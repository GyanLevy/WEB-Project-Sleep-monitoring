import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LoadingSpinner } from './ui';

/**
 * LoginScreen Component
 * Entry point for student authentication using a 6-digit token.
 */
export default function LoginScreen() {
  const [token, setToken] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();

  const handleTokenChange = (e) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 6);
    setToken(value);
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    const result = await login(token);

    if (!result.success) {
      setError(result.error);
      setIsLoading(false);
      return;
    }

    // Use the hasSubmittedToday from login result (not stale state)
    if (result.hasSubmittedToday) {
      navigate('/complete');
    } else {
      navigate('/diary');
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 flex flex-col items-center justify-center p-4">
      {/* Stars background effect */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="stars"></div>
      </div>

      {/* Main card */}
      <div className="relative z-10 w-full max-w-md">
        {/* Logo/Header */}
        <LoginHeader />

        {/* Login Card */}
        <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-8 shadow-2xl">
          <LoginForm
            token={token}
            error={error}
            isLoading={isLoading}
            onTokenChange={handleTokenChange}
            onSubmit={handleSubmit}
          />

          {/* Divider */}
          <Divider />

          {/* Teacher/Admin Placeholders */}
          <AlternativeAccessButtons />
        </div>

        {/* Privacy Notice */}
        <PrivacyNotice />
      </div>
    </div>
  );
}

/**
 * LoginHeader Component
 * App logo and welcome message.
 */
function LoginHeader() {
  return (
    <div className="text-center mb-8">
      <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg shadow-indigo-500/30 mb-4">
        <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
        </svg>
      </div>
      <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
        SleepQuest
      </h1>
      <p className="text-slate-400 mt-2">עקוב אחר מסע השינה שלך</p>
    </div>
  );
}

/**
 * LoginForm Component
 * Token input form with validation and error display.
 */
function LoginForm({ token, error, isLoading, onTokenChange, onSubmit }) {
  return (
    <form onSubmit={onSubmit} className="space-y-6">
      {/* Token Input */}
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-2">
          הכנס קוד גישה
        </label>
        <div className="relative">
          <input
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            value={token}
            onChange={onTokenChange}
            placeholder="000000"
            className="w-full px-4 py-4 text-center text-2xl font-mono tracking-[0.5em] bg-slate-900/50 border border-slate-600 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
            style={{ direction: 'ltr' }}
            maxLength={6}
            autoComplete="off"
          />
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 text-sm">
            {token.length}/6
          </div>
        </div>
        <p className="text-xs text-slate-500 mt-2">
          קוד הגישה בן 6 הספרות ניתן לך על ידי המורה שלך
        </p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 text-red-400 text-sm text-center animate-shake">
          {error}
        </div>
      )}

      {/* Submit Button */}
      <button
        type="submit"
        disabled={token.length !== 6 || isLoading}
        className="w-full py-4 px-6 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 disabled:from-slate-600 disabled:to-slate-600 disabled:cursor-not-allowed text-white font-semibold rounded-xl shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 transition-all duration-300 transform hover:scale-[1.02] disabled:hover:scale-100"
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
          'התחבר כתלמיד'
        )}
      </button>
    </form>
  );
}

/**
 * Divider Component
 * Visual separator between login options.
 */
function Divider() {
  return (
    <div className="relative my-8">
      <div className="absolute inset-0 flex items-center">
        <div className="w-full border-t border-slate-700"></div>
      </div>
      <div className="relative flex justify-center text-sm">
        <span className="px-4 bg-slate-800/50 text-slate-500">גישה נוספת</span>
      </div>
    </div>
  );
}

/**
 * AlternativeAccessButtons Component
 * Placeholder buttons for teacher/admin access.
 */
function AlternativeAccessButtons() {
  return (
    <div className="grid grid-cols-2 gap-4">
      <button
        type="button"
        className="py-3 px-4 bg-slate-700/30 hover:bg-slate-700/50 border border-slate-600/50 text-slate-400 text-sm rounded-xl transition-all duration-200"
        onClick={() => alert('כניסת מורים תהיה זמינה בקרוב')}
      >
        כניסת מורה
      </button>
      <button
        type="button"
        className="py-3 px-4 bg-slate-700/30 hover:bg-slate-700/50 border border-slate-600/50 text-slate-400 text-sm rounded-xl transition-all duration-200"
        onClick={() => alert('כניסת מנהלים תהיה זמינה בקרוב')}
      >
        כניסת מנהל
      </button>
    </div>
  );
}

/**
 * PrivacyNotice Component
 * Footer privacy information.
 */
function PrivacyNotice() {
  return (
    <div className="mt-6 text-center">
      <div className="inline-flex items-center gap-2 text-xs text-slate-500">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
        <span>הנתונים שלך אנונימיים לחלוטין • לא נאסף מידע אישי</span>
      </div>
    </div>
  );
}

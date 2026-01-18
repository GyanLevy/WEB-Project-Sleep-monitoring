import { useTheme } from '../../hooks/useTheme';

/**
 * ThemeToggle Component
 * A button that toggles between light and dark themes.
 * Displays Sun icon in dark mode, Moon icon in light mode.
 */
export default function ThemeToggle({ className = '' }) {
  const { isDark, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className={`p-2 rounded-xl transition-all duration-300 ${
        isDark
          ? 'bg-slate-800/50 hover:bg-slate-700/50 text-yellow-400 hover:text-yellow-300'
          : 'bg-white/80 hover:bg-white text-indigo-600 hover:text-indigo-700 shadow-sm'
      } border ${
        isDark ? 'border-slate-700/50' : 'border-slate-200'
      } ${className}`}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      title={isDark ? 'מצב בהיר' : 'מצב כהה'}
    >
      {isDark ? (
        // Sun icon - shown in dark mode (click to switch to light)
        <svg 
          className="w-5 h-5 transition-transform duration-300 hover:rotate-12" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" 
          />
        </svg>
      ) : (
        // Moon icon - shown in light mode (click to switch to dark)
        <svg 
          className="w-5 h-5 transition-transform duration-300 hover:-rotate-12" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" 
          />
        </svg>
      )}
    </button>
  );
}

/**
 * LoadingSpinner Component
 * Reusable loading spinner with consistent styling across the app.
 */
export default function LoadingSpinner({ size = 'md', className = '' }) {
  const sizeClasses = {
    sm: 'w-5 h-5',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  };

  return (
    <div
      className={`animate-spin border-4 border-indigo-500 border-t-transparent rounded-full ${sizeClasses[size]} ${className}`}
    />
  );
}

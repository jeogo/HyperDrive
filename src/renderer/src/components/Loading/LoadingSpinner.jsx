/**
 * Reusable Loading Spinner Component
 * Usage: <LoadingSpinner size="sm|md|lg" text="Loading..." className="custom-class" />
 */
const LoadingSpinner = ({
  size = 'md',
  text = 'جاري التحميل...',
  className = '',
  showText = true
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  }

  const textSizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg'
  }

  return (
    <div className={`flex flex-col items-center justify-center gap-2 ${className}`}>
      <div
        className={`animate-spin rounded-full border-2 border-gray-300 border-t-blue-600 ${sizeClasses[size]}`}
      />
      {showText && (
        <span className={`text-gray-600 font-medium ${textSizeClasses[size]}`}>{text}</span>
      )}
    </div>
  )
}

export default LoadingSpinner

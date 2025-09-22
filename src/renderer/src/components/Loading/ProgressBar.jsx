/**
 * Reusable Progress Bar Component
 * Usage: <ProgressBar value={75} max={100} text="Processing..." showPercentage />
 */
const ProgressBar = ({
  value = 0,
  max = 100,
  text = '',
  showPercentage = true,
  className = '',
  size = 'md'
}) => {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100)

  const sizeClasses = {
    sm: 'h-2',
    md: 'h-3',
    lg: 'h-4'
  }

  return (
    <div className={`w-full ${className}`}>
      {(text || showPercentage) && (
        <div className="flex justify-between items-center mb-2">
          {text && <span className="text-sm font-medium text-gray-700">{text}</span>}
          {showPercentage && (
            <span className="text-sm font-medium text-gray-600">{Math.round(percentage)}%</span>
          )}
        </div>
      )}
      <div className={`w-full bg-gray-200 rounded-full overflow-hidden ${sizeClasses[size]}`}>
        <div
          className="h-full bg-blue-600 rounded-full transition-all duration-300 ease-out"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  )
}

export default ProgressBar

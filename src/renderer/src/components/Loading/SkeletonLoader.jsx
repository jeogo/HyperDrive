/**
 * Reusable Skeleton Loader Component
 * Usage: <SkeletonLoader type="list|card|text" count={5} />
 */
const SkeletonLoader = ({ type = 'card', count = 3, className = '' }) => {
  const skeletonTypes = {
    text: (index) => (
      <div key={index} className="animate-pulse space-y-2">
        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
      </div>
    ),
    card: (index) => (
      <div key={index} className="animate-pulse border rounded-lg p-4 space-y-3">
        <div className="flex items-center space-x-4">
          <div className="h-10 w-10 bg-gray-200 rounded-full"></div>
          <div className="space-y-2 flex-1">
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="h-3 bg-gray-200 rounded w-1/3"></div>
          </div>
        </div>
        <div className="space-y-2">
          <div className="h-3 bg-gray-200 rounded"></div>
          <div className="h-3 bg-gray-200 rounded w-5/6"></div>
        </div>
      </div>
    ),
    list: (index) => (
      <div key={index} className="animate-pulse flex items-center space-x-4 py-3">
        <div className="h-8 w-8 bg-gray-200 rounded"></div>
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-gray-200 rounded w-1/4"></div>
          <div className="h-3 bg-gray-200 rounded w-1/6"></div>
        </div>
      </div>
    )
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {Array.from({ length: count }, (_, index) => skeletonTypes[type](index))}
    </div>
  )
}

export default SkeletonLoader

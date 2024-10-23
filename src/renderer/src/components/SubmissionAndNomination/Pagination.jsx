// Pagination.jsx

const Pagination = ({ totalPages, currentPage, onPageChange }) => {
  const pageNumbers = []

  // Determine the range of pages to show
  const maxPageNumbers = 5
  let startPage = Math.max(currentPage - Math.floor(maxPageNumbers / 2), 1)
  let endPage = startPage + maxPageNumbers - 1

  if (endPage > totalPages) {
    endPage = totalPages
    startPage = Math.max(endPage - maxPageNumbers + 1, 1)
  }

  for (let i = startPage; i <= endPage; i++) {
    pageNumbers.push(i)
  }

  if (totalPages <= 1) return null // Don't render pagination if there's only one page

  return (
    <div className="flex justify-center mt-4">
      <nav>
        <ul className="inline-flex -space-x-px">
          <li>
            <button
              onClick={() => onPageChange(1)}
              disabled={currentPage === 1}
              className="px-3 py-2 ml-0 leading-tight text-gray-500 bg-white border border-gray-300 rounded-l-lg hover:bg-gray-100 hover:text-gray-700"
            >
              الأول
            </button>
          </li>
          <li>
            <button
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-3 py-2 leading-tight text-gray-500 bg-white border border-gray-300 hover:bg-gray-100 hover:text-gray-700"
            >
              السابق
            </button>
          </li>
          {pageNumbers.map((number) => (
            <li key={number}>
              <button
                onClick={() => onPageChange(number)}
                className={`px-3 py-2 leading-tight border border-gray-300 ${
                  currentPage === number
                    ? 'text-blue-600 bg-blue-50'
                    : 'text-gray-500 bg-white hover:bg-gray-100 hover:text-gray-700'
                }`}
              >
                {number}
              </button>
            </li>
          ))}
          <li>
            <button
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="px-3 py-2 leading-tight text-gray-500 bg-white border border-gray-300 hover:bg-gray-100 hover:text-gray-700"
            >
              التالي
            </button>
          </li>
          <li>
            <button
              onClick={() => onPageChange(totalPages)}
              disabled={currentPage === totalPages}
              className="px-3 py-2 leading-tight text-gray-500 bg-white border border-gray-300 rounded-r-lg hover:bg-gray-100 hover:text-gray-700"
            >
              الأخير
            </button>
          </li>
        </ul>
      </nav>
    </div>
  )
}

export default Pagination

import { useState, useEffect } from 'react'
import { SearchIcon } from '@heroicons/react/outline'

// Helper function to get the current year
const getCurrentYear = () => new Date().getFullYear()

// Generate a list of the past 20 years
const generateYearOptions = () => {
  const currentYear = getCurrentYear()
  return Array.from({ length: 20 }, (_, i) => currentYear - i)
}

// Generate month options
const monthOptions = [
  'يناير',
  'فبراير',
  'مارس',
  'أبريل',
  'مايو',
  'يونيو',
  'يوليو',
  'أغسطس',
  'سبتمبر',
  'أكتوبر',
  'نوفمبر',
  'ديسمبر'
]

const Filter = ({ onSearch }) => {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedMonth, setSelectedMonth] = useState('')
  const [selectedYear, setSelectedYear] = useState('')

  // Handle filter changes and pass data to parent component for filtering
  useEffect(() => {
    onSearch(searchTerm, selectedMonth, selectedYear)
  }, [searchTerm, selectedMonth, selectedYear, onSearch])

  // Clear all filters
  const clearFilters = () => {
    setSearchTerm('')
    setSelectedMonth('')
    setSelectedYear('')
  }

  return (
    <div className="flex flex-wrap gap-4 mb-6 items-center justify-between w-full">
      {/* Search Input */}
      <div className="relative flex-1">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="ابحث عن عميل (الاسم أو رقم الهاتف)..."
          className="w-full p-2 lg:p-3 pr-10 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm lg:text-lg"
        />
        <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5 lg:h-6 lg:w-6" />
      </div>

      {/* Month Dropdown */}
      <div className="flex-1">
        <select
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(e.target.value)}
          className="w-full p-2 lg:p-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm lg:text-lg"
        >
          <option value="">الشهر</option>
          {monthOptions.map((month, index) => (
            <option key={index} value={index + 1}>
              {index + 1} - {month}
            </option>
          ))}
        </select>
      </div>

      {/* Year Dropdown */}
      <div className="flex-1">
        <select
          value={selectedYear}
          onChange={(e) => setSelectedYear(e.target.value)}
          className="w-full p-2 lg:p-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm lg:text-lg"
        >
          <option value="">السنة</option>
          {generateYearOptions().map((year) => (
            <option key={year} value={year}>
              {year}
            </option>
          ))}
        </select>
      </div>

      {/* Clear Filters Button */}
      <div className="flex justify-end">
        <button
          className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition duration-300"
          onClick={clearFilters}
        >
          مسح التصفية
        </button>
      </div>
    </div>
  )
}

export default Filter

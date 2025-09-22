// Central utilities index
// Exports all utility functions for easy importing

// Client data utilities
export {
  FIELD_MAP,
  getFieldValue,
  normalizeClient,
  normalizeTest,
  calculateAge,
  formatDateArabic
} from './clientUtils'

// Error handling and messaging
export {
  ERROR_MESSAGES,
  getErrorMessage,
  checkDocumentEligibility,
  checkTestEligibility
} from './errorMessages'

// Test workflow management
export {
  TEST_TYPES,
  TEST_SEQUENCE,
  getNextAvailableTest,
  validateTestSubmission,
  updateTestResult,
  getClientTestStatistics,
  canClientGraduate,
  getClientWorkflowStatus
} from './testUtils'

// Search and filtering
export {
  SEARCH_FIELDS,
  normalizeArabicText,
  calculateSearchScore,
  searchClients,
  filterClients,
  getFilterStatistics,
  getSearchSuggestions
} from './searchUtils'

// Reporting and analytics
export {
  generateClientReport,
  generateMonthlyStats,
  analyzeTestPerformance,
  exportReportData
} from './reportUtils'

// Common helper functions
export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('ar-DZ', {
    style: 'currency',
    currency: 'DZD',
    minimumFractionDigits: 0
  }).format(amount || 0)
}

export const formatDate = (date, locale = 'ar-SA') => {
  if (!date) return ''
  return new Date(date).toLocaleDateString(locale)
}

export const formatDateTime = (date, locale = 'ar-SA') => {
  if (!date) return ''
  return new Date(date).toLocaleString(locale)
}

export const generateId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2)
}

export const validatePhone = (phone) => {
  if (!phone) return false
  const cleaned = phone.replace(/\D/g, '')
  return cleaned.length === 10 && cleaned.startsWith('0')
}

export const validateNationalId = (id) => {
  if (!id) return false
  const cleaned = id.replace(/\D/g, '')
  return cleaned.length >= 8 && cleaned.length <= 18
}

export const debounce = (func, wait) => {
  let timeout
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout)
      func(...args)
    }
    clearTimeout(timeout)
    timeout = setTimeout(later, wait)
  }
}

export const throttle = (func, limit) => {
  let inThrottle
  return function (...args) {
    if (!inThrottle) {
      func.apply(this, args)
      inThrottle = true
      setTimeout(() => (inThrottle = false), limit)
    }
  }
}

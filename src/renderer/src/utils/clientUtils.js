// Field mapping and normalization utilities
// Centralizes schema handling and reduces duplication across components

// Helper: normalize a single test object ensuring numeric attempts
export const normalizeTest = (raw) => {
  if (!raw) {
    return { passed: false, attempts: 0, lastAttemptDate: null }
  }
  let attempts = raw.attempts
  if (typeof attempts !== 'number') {
    const parsed = parseInt(attempts, 10)
    attempts = Number.isNaN(parsed) ? 0 : parsed
  }
  return {
    passed: !!raw.passed,
    attempts,
    lastAttemptDate: raw.lastAttemptDate || null
  }
}

// Canonical field names mapping (new schema → legacy support)
export const FIELD_MAP = {
  // Personal info
  first_name_ar: ['first_name_ar', 'firstName', 'firstNameAr'],
  last_name_ar: ['last_name_ar', 'lastName', 'lastNameAr'],
  birth_date: ['birth_date', 'birthDate'],
  birth_place: ['birth_place', 'birthPlace'],
  birth_municipality: ['birth_municipality', 'birthMunicipality'],
  birth_state: ['birth_state', 'birthState'],

  // Contact
  phone_number: ['phone_number', 'phoneNumber'],
  current_address: ['current_address', 'currentAddress'],
  current_municipality: ['current_municipality', 'currentMunicipality'],
  current_state: ['current_state', 'currentState'],

  // Identity
  national_id: ['national_id', 'nationalId'],
  blood_type: ['blood_type', 'bloodType'],
  gender: ['gender'],

  // Family
  father_name: ['father_name', 'fatherName'],
  mother_first_name: ['mother_first_name', 'motherFirstName'],
  mother_last_name: ['mother_last_name', 'motherLastName'],

  // Registration
  register_date: ['register_date', 'registerDate', 'registration_date'],
  register_number: ['register_number', 'registerNumber'],

  // Financial
  subPrice: ['subPrice', 'totalAmount', 'total_amount'],
  paid: ['paid'],

  // Status
  deposit_submitted: ['deposit_submitted', 'depositSubmitted'],
  archived: ['archived', 'isArchived']
}

// Get field value with fallback to legacy names
export const getFieldValue = (obj, canonicalField) => {
  if (!obj || !canonicalField) return null

  const fieldVariants = FIELD_MAP[canonicalField] || [canonicalField]

  for (const variant of fieldVariants) {
    if (obj[variant] !== undefined && obj[variant] !== null) {
      return obj[variant]
    }
  }

  return null
}

// Normalize client object to canonical schema
export const normalizeClient = (client) => {
  if (!client) return null

  const normalized = { ...client }

  // Normalize all mapped fields
  Object.keys(FIELD_MAP).forEach((canonicalField) => {
    const value = getFieldValue(client, canonicalField)
    if (value !== null) {
      normalized[canonicalField] = value
    }
  })

  // Ensure tests structure
  if (!normalized.tests) {
    normalized.tests = {
      trafficLawTest: { passed: false, attempts: 0, lastAttemptDate: null },
      manoeuvresTest: { passed: false, attempts: 0, lastAttemptDate: null },
      drivingTest: { passed: false, attempts: 0, lastAttemptDate: null }
    }
  }

  // Normalize test structure
  const tests = normalized.tests || {}
  normalized.tests = {
    trafficLawTest: normalizeTest(tests.trafficLawTest),
    manoeuvresTest: normalizeTest(tests.manoeuvresTest),
    drivingTest: normalizeTest(tests.drivingTest)
  }

  // Add flat test status properties for UI compatibility
  const mapStatus = (t) => (t.passed ? 'passed' : t.attempts > 0 ? 'failed' : 'scheduled')
  normalized.trafficLawTest = mapStatus(normalized.tests.trafficLawTest)
  normalized.manoeuvresTest = mapStatus(normalized.tests.manoeuvresTest)
  normalized.drivingTest = mapStatus(normalized.tests.drivingTest)

  return normalized
}

// Calculate age from birth date
export const calculateAge = (birthDate) => {
  if (!birthDate) return 0

  const birth = new Date(birthDate)
  const today = new Date()

  if (isNaN(birth.getTime())) return 0

  let age = today.getFullYear() - birth.getFullYear()
  const monthDiff = today.getMonth() - birth.getMonth()

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--
  }

  return Math.max(0, age)
}

// Format date for display (Arabic format)
export const formatDateArabic = (dateStr) => {
  if (!dateStr) return 'غير محدد'

  try {
    const date = new Date(dateStr)
    if (isNaN(date.getTime())) return 'تاريخ غير صحيح'

    return `${date.getFullYear()}/${String(date.getMonth() + 1).padStart(2, '0')}/${String(date.getDate()).padStart(2, '0')}`
  } catch (error) {
    return 'تاريخ غير صحيح'
  }
}

// Get client display name
export const getClientDisplayName = (client) => {
  const firstName = getFieldValue(client, 'first_name_ar') || ''
  const lastName = getFieldValue(client, 'last_name_ar') || ''
  return `${firstName} ${lastName}`.trim() || 'بدون اسم'
}

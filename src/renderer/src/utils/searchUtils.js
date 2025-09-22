// Enhanced search and filter utilities
// Provides intelligent search across client data with Arabic support

import { calculateAge, getFieldValue } from './clientUtils'

// Search fields configuration with weights
export const SEARCH_FIELDS = {
  // High priority fields (exact matches)
  first_name_ar: { weight: 10, type: 'text', arabic: true },
  last_name_ar: { weight: 10, type: 'text', arabic: true },
  national_id: { weight: 15, type: 'exact' },
  phone_number: { weight: 12, type: 'exact' },
  register_number: { weight: 15, type: 'exact' },

  // Medium priority fields
  current_address: { weight: 5, type: 'text', arabic: true },
  current_municipality: { weight: 4, type: 'text', arabic: true },
  birth_place: { weight: 3, type: 'text', arabic: true },

  // Low priority fields
  comments: { weight: 2, type: 'text', arabic: true }
}

// Normalize Arabic text for better search
export const normalizeArabicText = (text) => {
  if (!text || typeof text !== 'string') return ''

  return (
    text
      // Remove diacritics
      .replace(/[\u064B-\u065F\u0670\u0640]/g, '')
      // Normalize common letter variations
      .replace(/[أإآ]/g, 'ا')
      .replace(/[ةه]/g, 'ه')
      .replace(/[يى]/g, 'ي')
      .replace(/ك/g, 'ك')
      // Convert to lowercase and trim
      .toLowerCase()
      .trim()
  )
}

// Calculate search relevance score
export const calculateSearchScore = (client, searchTerm) => {
  if (!searchTerm || !client) return 0

  const normalizedSearch = normalizeArabicText(searchTerm)
  let totalScore = 0

  Object.keys(SEARCH_FIELDS).forEach((fieldKey) => {
    const fieldConfig = SEARCH_FIELDS[fieldKey]
    const value = getFieldValue(client, fieldKey)

    if (!value) return

    const normalizedValue = fieldConfig.arabic
      ? normalizeArabicText(String(value))
      : String(value).toLowerCase()

    let fieldScore = 0

    switch (fieldConfig.type) {
      case 'exact':
        if (normalizedValue === normalizedSearch) {
          fieldScore = fieldConfig.weight * 2 // Exact match bonus
        } else if (normalizedValue.includes(normalizedSearch)) {
          fieldScore = fieldConfig.weight
        }
        break

      case 'text':
        if (normalizedValue.includes(normalizedSearch)) {
          // Higher score for matches at the beginning
          const position = normalizedValue.indexOf(normalizedSearch)
          const positionBonus = position === 0 ? 1.5 : 1
          fieldScore = fieldConfig.weight * positionBonus
        }
        break
    }

    totalScore += fieldScore
  })

  return totalScore
}

// Enhanced search function
export const searchClients = (clients, searchTerm, threshold = 0.1) => {
  if (!searchTerm || !clients?.length) return clients

  const results = clients
    .map((client) => ({
      client,
      score: calculateSearchScore(client, searchTerm)
    }))
    .filter((result) => result.score > threshold)
    .sort((a, b) => b.score - a.score)
    .map((result) => result.client)

  return results
}

// Filter clients by various criteria
export const filterClients = (clients, filters = {}) => {
  if (!clients?.length) return clients

  return clients.filter((client) => {
    // Age filter
    if (filters.ageFilter && filters.ageFilter !== 'all') {
      const age = calculateAge(client.birth_date)

      switch (filters.ageFilter) {
        case 'under18':
          if (age >= 18) return false
          break
        case '18-25':
          if (age < 18 || age > 25) return false
          break
        case '26-35':
          if (age < 26 || age > 35) return false
          break
        case 'over35':
          if (age <= 35) return false
          break
      }
    }

    // Test status filter
    if (filters.testFilter && filters.testFilter !== 'all') {
      const tests = client.tests || {}

      switch (filters.testFilter) {
        case 'pending-theory':
          if (tests.trafficLawTest?.passed) return false
          break
        case 'pending-practical':
          if (!tests.trafficLawTest?.passed || tests.manoeuvresTest?.passed) return false
          break
        case 'pending-final':
          if (!tests.manoeuvresTest?.passed || tests.drivingTest?.passed) return false
          break
        case 'completed':
          if (!tests.drivingTest?.passed) return false
          break
      }
    }

    // Payment filter
    if (filters.paymentFilter && filters.paymentFilter !== 'all') {
      const paymentCompleted = client.paymentCompleted || false

      switch (filters.paymentFilter) {
        case 'paid':
          if (!paymentCompleted) return false
          break
        case 'unpaid':
          if (paymentCompleted) return false
          break
      }
    }

    // Gender filter
    if (filters.genderFilter && filters.genderFilter !== 'all') {
      if (client.gender !== filters.genderFilter) return false
    }

    // Registration date filter
    if (filters.dateFrom || filters.dateTo) {
      const registerDate = new Date(client.createdAt || client.register_date)

      if (filters.dateFrom) {
        const fromDate = new Date(filters.dateFrom)
        if (registerDate < fromDate) return false
      }

      if (filters.dateTo) {
        const toDate = new Date(filters.dateTo)
        toDate.setHours(23, 59, 59, 999) // Include the entire day
        if (registerDate > toDate) return false
      }
    }

    return true
  })
}

// Get filter statistics
export const getFilterStatistics = (clients) => {
  if (!clients?.length) return {}

  const stats = {
    total: clients.length,
    ages: { under18: 0, '18-25': 0, '26-35': 0, over35: 0 },
    tests: { 'pending-theory': 0, 'pending-practical': 0, 'pending-final': 0, completed: 0 },
    payment: { paid: 0, unpaid: 0 },
    gender: { male: 0, female: 0 }
  }

  clients.forEach((client) => {
    // Age statistics
    const age = calculateAge(client.birth_date)
    if (age < 18) stats.ages.under18++
    else if (age <= 25) stats.ages['18-25']++
    else if (age <= 35) stats.ages['26-35']++
    else stats.ages.over35++

    // Test statistics
    const tests = client.tests || {}
    if (tests.drivingTest?.passed) stats.tests.completed++
    else if (tests.manoeuvresTest?.passed) stats.tests['pending-final']++
    else if (tests.trafficLawTest?.passed) stats.tests['pending-practical']++
    else stats.tests['pending-theory']++

    // Payment statistics
    if (client.paymentCompleted) stats.payment.paid++
    else stats.payment.unpaid++

    // Gender statistics
    if (client.gender === 'male') stats.gender.male++
    else if (client.gender === 'female') stats.gender.female++
  })

  return stats
}

// Quick search suggestions
export const getSearchSuggestions = (clients, searchTerm, limit = 5) => {
  if (!searchTerm || searchTerm.length < 2) return []

  const suggestions = new Set()
  const normalizedSearch = normalizeArabicText(searchTerm)

  clients.forEach((client) => {
    // Check names
    const firstName = getFieldValue(client, 'first_name_ar')
    const lastName = getFieldValue(client, 'last_name_ar')

    if (firstName && normalizeArabicText(firstName).startsWith(normalizedSearch)) {
      suggestions.add(firstName)
    }
    if (lastName && normalizeArabicText(lastName).startsWith(normalizedSearch)) {
      suggestions.add(lastName)
    }

    // Check addresses
    const address = getFieldValue(client, 'current_address')
    const municipality = getFieldValue(client, 'current_municipality')

    if (address && normalizeArabicText(address).includes(normalizedSearch)) {
      suggestions.add(address)
    }
    if (municipality && normalizeArabicText(municipality).includes(normalizedSearch)) {
      suggestions.add(municipality)
    }
  })

  return Array.from(suggestions).slice(0, limit)
}

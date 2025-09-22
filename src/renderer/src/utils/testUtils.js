// Test workflow utilities and validation helpers
// Centralizes test state management and validation logic

import { checkTestEligibility, getErrorMessage } from './errorMessages'
import { calculateAge } from './clientUtils'

// Test types mapping
export const TEST_TYPES = {
  TRAFFIC_LAW: 'trafficLawTest',
  MANEUVERS: 'manoeuvresTest',
  DRIVING: 'drivingTest'
}

// Test sequence order
export const TEST_SEQUENCE = [TEST_TYPES.TRAFFIC_LAW, TEST_TYPES.MANEUVERS, TEST_TYPES.DRIVING]

// Get next available test for a client
export const getNextAvailableTest = (client) => {
  if (!client) return null

  const tests = client.tests || {}

  // Check each test in sequence
  for (const testType of TEST_SEQUENCE) {
    const test = tests[testType]

    // If test not passed, this is the next one
    if (!test?.passed) {
      const eligibility = checkTestEligibility(client, testType)
      return {
        testType,
        eligible: eligibility.eligible,
        error: eligibility.error
      }
    }
  }

  // All tests completed
  return null
}

// Validate test submission
export const validateTestSubmission = (client, testType, passed) => {
  const eligibility = checkTestEligibility(client, testType)

  if (!eligibility.eligible) {
    return {
      valid: false,
      error: eligibility.error
    }
  }

  return { valid: true }
}

// Update test result in client object
export const updateTestResult = (client, testType, passed, attemptDate = null) => {
  if (!client || !testType) return client

  const updatedClient = { ...client }

  // Ensure tests structure exists
  if (!updatedClient.tests) {
    updatedClient.tests = {}
  }

  const currentTest = updatedClient.tests[testType] || { attempts: 0 }

  updatedClient.tests[testType] = {
    passed: Boolean(passed),
    attempts: (currentTest.attempts || 0) + 1,
    lastAttemptDate: attemptDate || new Date().toISOString()
  }

  return updatedClient
}

// Get test statistics for a client
export const getClientTestStatistics = (client) => {
  if (!client?.tests) {
    return {
      totalAttempts: 0,
      passedTests: 0,
      failedAttempts: 0,
      completionRate: 0
    }
  }

  let totalAttempts = 0
  let passedTests = 0
  let failedAttempts = 0

  Object.values(client.tests).forEach((test) => {
    if (test?.attempts) {
      totalAttempts += test.attempts
      if (test.passed) {
        passedTests++
      } else {
        failedAttempts += test.attempts
      }
    }
  })

  const completionRate = TEST_SEQUENCE.length > 0 ? (passedTests / TEST_SEQUENCE.length) * 100 : 0

  return {
    totalAttempts,
    passedTests,
    failedAttempts,
    completionRate: Math.round(completionRate)
  }
}

// Check if client can graduate (all tests passed + age requirement)
export const canClientGraduate = (client) => {
  if (!client) return false

  const age = calculateAge(client.birth_date)
  if (age < 18) return false

  const tests = client.tests || {}

  return TEST_SEQUENCE.every((testType) => {
    const test = tests[testType]
    return test?.passed === true
  })
}

// Get client workflow status
export const getClientWorkflowStatus = (client) => {
  if (!client) return 'unknown'

  const age = calculateAge(client.birth_date)
  if (age < 18) return 'underage'

  const tests = client.tests || {}
  const trafficLawPassed = tests.trafficLawTest?.passed
  const maneuversPassed = tests.manoeuvresTest?.passed
  const drivingPassed = tests.drivingTest?.passed

  if (drivingPassed) return 'completed'
  if (maneuversPassed) return 'ready-for-final'
  if (trafficLawPassed) return 'ready-for-practical'

  return 'ready-for-theory'
}

// Normalize test data to ensure proper types
export const normalizeTestData = (testData) => {
  if (!testData) {
    return {
      passed: false,
      attempts: 0,
      lastAttemptDate: null
    }
  }

  return {
    passed: Boolean(testData.passed),
    attempts: parseInt(testData.attempts, 10) || 0,
    lastAttemptDate: testData.lastAttemptDate || null
  }
}

// Normalize all tests for a client
export const normalizeClientTests = (client) => {
  if (!client) return null

  const tests = client.tests || {}

  return {
    ...client,
    tests: {
      trafficLawTest: normalizeTestData(tests.trafficLawTest),
      manoeuvresTest: normalizeTestData(tests.manoeuvresTest),
      drivingTest: normalizeTestData(tests.drivingTest)
    }
  }
}

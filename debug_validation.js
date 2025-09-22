// Debug validation - test with sample client data
const sampleClient = {
  first_name_ar: 'محمد',
  last_name_ar: 'أحمد',
  birth_date: '2000-01-01',
  tests: {
    trafficLawTest: { passed: false }, // Not passed
    manoeuvresTest: { passed: false },
    drivingTest: { passed: false }
  },
  paid: 0,
  subPrice: 1000
}

// Test both document types
console.log('=== Testing Follow-up File Validation ===')

// Test followUpFile
console.log('1. followUpFile:')
try {
  const { checkDocumentEligibility } = require('./src/renderer/src/utils/errorMessages.js')
  const result1 = checkDocumentEligibility(sampleClient, 'followUpFile')
  console.log('Result:', result1)
  if (!result1.eligible) {
    console.log('✅ CORRECTLY BLOCKED - followUpFile')
  } else {
    console.log('❌ ERROR - followUpFile should be blocked!')
  }
} catch (e) {
  console.log('Error:', e.message)
}

// Test candidateFollowUpCard
console.log('\n2. candidateFollowUpCard:')
try {
  const { checkDocumentEligibility } = require('./src/renderer/src/utils/errorMessages.js')
  const result2 = checkDocumentEligibility(sampleClient, 'candidateFollowUpCard')
  console.log('Result:', result2)
  if (!result2.eligible) {
    console.log('✅ CORRECTLY BLOCKED - candidateFollowUpCard')
  } else {
    console.log('❌ ERROR - candidateFollowUpCard should be blocked!')
  }
} catch (e) {
  console.log('Error:', e.message)
}

console.log('\n=== Test Complete ===')

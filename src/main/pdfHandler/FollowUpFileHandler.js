// Python-integrated FollowUpFile handler.
// Calls scripts/fill_candidate_follow_up_card.py to generate DOCX + optional PDF, returns PDF path if produced else DOCX.
import path from 'path'
import fs from 'fs'
import { app } from 'electron'
import { runPythonForPDF, buildUserDataOutput } from './utils/pythonScriptRunner.js'

const PY_SCRIPT = path.join(process.cwd(), 'scripts', 'fill_candidate_follow_up_card.py')

async function ensurePythonScriptExists() {
  if (!fs.existsSync(PY_SCRIPT)) {
    throw new Error(`Python follow-up card script not found at ${PY_SCRIPT}`)
  }
}

function normalizeClientData(raw) {
  return {
    first_name_ar: raw.first_name_ar || raw.firstNameAr || '',
    last_name_ar: raw.last_name_ar || raw.lastNameAr || '',
    birth_date: raw.birth_date || raw.birthDate || '',
    birth_place: raw.birth_place || raw.birthPlace || '',
    birth_municipality: raw.birth_municipality || raw.birthMunicipality || '',
    birth_state: raw.birth_state || raw.birthState || '',
    current_address: raw.current_address || raw.currentAddress || '',
    current_municipality: raw.current_municipality || raw.currentMunicipality || '',
    current_state: raw.current_state || raw.currentState || '',
    phone_number: raw.phone_number || raw.phoneNumber || '',
    register_date: raw.register_date || raw.registerDate || '',
    subPrice: raw.subPrice || raw.totalAmount || '0',
    // Keep original test data for validation
    tests: raw.tests || {}
  }
}

async function generateFollowUpFilePDF(clientData) {
  await ensurePythonScriptExists()

  // CHECK: Traffic law test status for date calculation (but don't block generation)
  const trafficLawTest = clientData.tests?.trafficLawTest
  const hasPassedTrafficLaw = trafficLawTest && trafficLawTest.passed

  const normalized = normalizeClientData(clientData)
  const clientFolderName =
    `${normalized.first_name_ar}_${normalized.last_name_ar}`
      .replace(/[<>:"/\\|?*]/g, '')
      .replace(/\s+/g, '_')
      .substring(0, 40) || 'client'

  const outputDir = buildUserDataOutput(app, ['follow_up_cards', clientFolderName])
  if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true })

  // Use safe English filename to avoid Unicode path issues
  const timestamp = Date.now()
  const outputDocx = path.join(outputDir, `candidate_follow_up_${timestamp}.docx`)

  // SMART DATE LOGIC: Use law test date if passed, otherwise use registration date
  let startDate = new Date().toISOString().slice(0, 10) // fallback to today

  if (hasPassedTrafficLaw && trafficLawTest.lastAttemptDate) {
    try {
      // Parse the last attempt date and add 1 day
      const lawTestDate = new Date(trafficLawTest.lastAttemptDate)
      lawTestDate.setDate(lawTestDate.getDate() + 1) // Add 1 day
      startDate = lawTestDate.toISOString().slice(0, 10) // YYYY-MM-DD format
      console.log(`[INFO] Student passed traffic law - starting from day after test: ${startDate}`)
    } catch (error) {
      console.warn(`[WARN] Invalid law test date format, using registration date: ${error.message}`)
      startDate = normalized.register_date || new Date().toISOString().slice(0, 10)
    }
  } else {
    // Student hasn't passed yet - use registration date or today
    startDate = normalized.register_date || new Date().toISOString().slice(0, 10)
    console.log(
      `[INFO] Student hasn't passed traffic law yet - generating template with registration date: ${startDate}`
    )
  }

  // Generate client ID for per-date hour reservation
  const clientId =
    clientData._id ||
    clientData.id ||
    `${normalized.first_name_ar}_${normalized.last_name_ar}_${Date.now()}`

  const clientJsonString = JSON.stringify(normalized)

  const args = [
    '--input',
    'resources/templates/بطاقة المتابعة للمترشح.docx',
    '--output',
    outputDocx,
    '--start-date',
    startDate,
    '--client-data',
    clientJsonString,
    '--client-id',
    clientId,
    '--table1-dates',
    '30',
    '--table2-dates',
    '30',
    '--pdf'
  ]

  const { code, stdout, stderr, pdfPath } = await runPythonForPDF(PY_SCRIPT, args, {
    cwd: process.cwd()
  })

  if (code !== 0) {
    throw new Error(`Python script failed (code ${code}): ${stderr || stdout}`)
  }

  // Prefer PDF if produced
  const finalPath = pdfPath && fs.existsSync(pdfPath) ? pdfPath : outputDocx
  return finalPath
}

export default generateFollowUpFilePDF

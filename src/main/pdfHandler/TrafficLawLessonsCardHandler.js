import path from 'path'
import fs from 'fs'
import { app } from 'electron'
import { runPythonForPDF, buildUserDataOutput } from './utils/pythonScriptRunner.js'

const PY_SCRIPT = path.join(process.cwd(), 'scripts', 'fill_traffic_law_lessons_card.py')

async function ensureScript() {
  if (!fs.existsSync(PY_SCRIPT)) {
    throw new Error(`Traffic law lessons script not found at ${PY_SCRIPT}`)
  }
}

function normalize(raw) {
  // Format birth date properly (convert from YYYY-MM-DD to YYYY/MM/DD)
  let formattedBirthDate = raw.birth_date || raw.birthDate || ''
  if (formattedBirthDate && formattedBirthDate.includes('-')) {
    formattedBirthDate = formattedBirthDate.replace(/-/g, '/')
  }

  // Handle registration date format - ensure it's in YYYY-MM-DD format for Python script
  let formattedRegDate =
    raw.register_date || raw.registerDate || new Date().toISOString().slice(0, 10)
  if (formattedRegDate && formattedRegDate.includes('/')) {
    formattedRegDate = formattedRegDate.replace(/\//g, '-')
  }

  // Build birth place - prefer birth_place, fallback to municipality + state
  let birthPlace = raw.birth_place || raw.birthPlace || ''
  if (!birthPlace) {
    const municipality = raw.birth_municipality || ''
    const state = raw.birth_state || ''
    if (municipality || state) {
      birthPlace = [municipality, state].filter(Boolean).join(', ')
    }
  }

  return {
    fullName:
      raw.fullName ||
      `${raw.first_name_ar || raw.firstNameAr || ''} ${raw.last_name_ar || raw.lastNameAr || ''}`.trim(),
    birthDate: formattedBirthDate,
    birthPlace: birthPlace,
    address:
      raw.address ||
      raw.current_address ||
      [raw.current_address, raw.current_municipality, raw.current_state].filter(Boolean).join(', '),
    registrationDate: formattedRegDate
  }
}

export default async function generateTrafficLawLessonsCard(clientData) {
  await ensureScript()
  const normalized = normalize(clientData)

  const folderName =
    (normalized.fullName || 'client')
      .replace(/[<>:"/\\|?*]/g, '')
      .replace(/\s+/g, '_')
      .substring(0, 40) || 'client'

  const outputDir = buildUserDataOutput(app, ['traffic_law_cards', folderName])
  if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true })

  const outputPdf = path.join(outputDir, 'بطاقة_قانون_المرور.pdf')
  const startDate = normalized.registrationDate || new Date().toISOString().slice(0, 10)
  const jsonData = JSON.stringify(normalized)

  const args = [
    '--input',
    'resources/templates/بطاقة خاصة بدروس قانون المرور .docx',
    '--output',
    outputPdf,
    '--start-date',
    startDate,
    '--client-data', // This gets converted to --data with temp file by pythonScriptRunner.js
    jsonData,
    '--sessions',
    '30',
    '--has-header'
    // Script now generates PDF by default
  ]

  const { code, stdout, stderr } = await runPythonForPDF(PY_SCRIPT, args, {
    cwd: process.cwd()
  })
  if (code !== 0) {
    throw new Error(`Traffic law card script failed (code ${code}): ${stderr || stdout}`)
  }

  // Check for PDF file creation
  if (!fs.existsSync(outputPdf)) {
    throw new Error('PDF file was not created successfully')
  }

  return outputPdf
}

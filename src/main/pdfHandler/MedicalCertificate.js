import { PDFDocument, rgb } from 'pdf-lib'
import fs from 'fs'
import path from 'path'
import fontkit from '@pdf-lib/fontkit'
import { formatDateForArabic, drawDateLTR } from './utils/dateUtils.js'
import { loadFont, drawTextWithArabicSupport, ensureClientDirectory } from './utils/pdfUtils.js'

// drawTextWithArabicSupport already handles RTL by width adjustment

const MedicalCertificate = async (clientData) => {
  const templatePath = path.join(__dirname, '../templates/شهادة طبية.pdf')
  if (!fs.existsSync(templatePath)) {
    throw new Error(`Template file not found at path: ${templatePath}`)
  }

  const existingPdfBytes = fs.readFileSync(templatePath)
  const pdfDoc = await PDFDocument.load(existingPdfBytes)

  pdfDoc.registerFontkit(fontkit)

  const amiriFontBytes = await loadFont('bold')
  const amiriFont = await pdfDoc.embedFont(amiriFontBytes)

  const pages = pdfDoc.getPages()
  const page = pages[0]

  const pageHeight = page.getHeight()

  const formattedBirthDate = clientData.birth_date ? formatDateForArabic(clientData.birth_date) : ''

  // Define the variables for client data
  const firstName = clientData.first_name_ar || ''
  const lastName = clientData.last_name_ar || ''
  const address = `${clientData.current_municipality || ''} ${clientData.current_state || ''} - ${clientData.current_address || ''}`
  // Fixed: Remove reverseNumbersInString for phone number to display normally
  const phone = clientData?.phone_number || ''

  // Now control both x and y positions with RTL text support using variables
  drawTextWithArabicSupport(
    page,
    firstName,
    530,
    pageHeight - 168,
    amiriFont,
    15,
    rgb(0, 0, 0),
    0,
    !amiriFontBytes
  )
  drawTextWithArabicSupport(
    page,
    lastName,
    530,
    pageHeight - 150,
    amiriFont,
    15,
    rgb(0, 0, 0),
    0,
    !amiriFontBytes
  )
  // Birth details: place(s) - date. Draw place as RTL then date LTR per-character.
  const birthPlaceSegment = `${clientData.birth_municipality || ''} ${clientData.birth_state || ''} -`
  drawTextWithArabicSupport(
    page,
    birthPlaceSegment,
    490,
    pageHeight - 185,
    amiriFont,
    15,
    rgb(0, 0, 0),
    0,
    !amiriFontBytes
  )
  const placeWidth = amiriFont.widthOfTextAtSize(birthPlaceSegment, 15)
  const dateRightX = 490 - placeWidth - 8 // small gap
  drawDateLTR(page, formattedBirthDate, dateRightX, pageHeight - 185, amiriFont, 15, rgb(0, 0, 0))
  drawTextWithArabicSupport(
    page,
    address,
    530,
    pageHeight - 210,
    amiriFont,
    15,
    rgb(0, 0, 0),
    0,
    !amiriFontBytes
  )

  // Fixed: Use drawDateLTR for phone number to ensure left-to-right display
  drawDateLTR(page, phone, 480, pageHeight - 230, amiriFont, 15, rgb(0, 0, 0))

  // Ensure client directory exists with safe Unicode handling
  const clientPath = ensureClientDirectory(clientData)

  const fileName = `شهادة طبية.pdf`
  const outputPath = path.join(clientPath, fileName)

  const pdfBytes = await pdfDoc.save()
  fs.writeFileSync(outputPath, pdfBytes)

  return outputPath
}

export default MedicalCertificate

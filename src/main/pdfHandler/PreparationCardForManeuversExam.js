import { PDFDocument, rgb } from 'pdf-lib'
import fs from 'fs'
import path from 'path'
import fontkit from '@pdf-lib/fontkit'
import { loadFont, drawTextWithArabicSupport, ensureClientDirectory } from './utils/pdfUtils.js'

const PreparationCardForManeuversExam = async (clientData) => {
  const templatePath = path.join(__dirname, '../templates/بطاقة الإعداد لامتحان المناورات.pdf')
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

  // Automatically get the width and height of the page
  const pageHeight = page.getHeight()

  const client = {
    fullNameAr: `${clientData.first_name_ar || ''} ${clientData.last_name_ar || ''}`
  }

  // Drawing the full name (first name and last name) on the same line
  drawTextWithArabicSupport(
    page,
    client.fullNameAr,
    465,
    pageHeight - 105,
    amiriFont,
    14,
    rgb(0, 0, 0),
    0,
    !amiriFontBytes || amiriFontBytes.length === 0
  )

  // Ensure client directory exists with safe Unicode handling
  const clientPath = ensureClientDirectory(clientData)

  const fileName = `بطاقة الإعداد لامتحان المناورات.pdf`
  const outputPath = path.join(clientPath, fileName)

  const pdfBytes = await pdfDoc.save()
  fs.writeFileSync(outputPath, pdfBytes)

  return outputPath
}

export default PreparationCardForManeuversExam

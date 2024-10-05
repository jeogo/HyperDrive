// generateCandidatesPDF.js

import { PDFDocument, rgb, degrees } from 'pdf-lib'
import fs from 'fs'
import path from 'path'
import fontkit from '@pdf-lib/fontkit'

// Function to load the Amiri font
const loadFont = async () => {
  const fontPath = path.join(__dirname, '../fonts/Amiri-Regular.ttf')
  if (!fs.existsSync(fontPath)) {
    throw new Error(`Font file not found at path: ${fontPath}`)
  }
  return fs.readFileSync(fontPath)
}

// Function to draw Arabic text with correct RTL support
function drawTextWithArabicSupport(page, text, x, y, font, size, color, rotate = 0) {
  const textWidth = font.widthOfTextAtSize(text, size)
  const adjustedX = x - textWidth // Adjust the x-coordinate for RTL text
  const textOptions = { x: adjustedX, y, size, font, color }
  if (rotate) {
    textOptions.rotate = degrees(rotate)
  }
  page.drawText(text, textOptions)
}

// Reverse numbers in the string (useful for Arabic formatting)
function reverseNumbersInString(str) {
  // Ensure str is a string before using replace
  return String(str).replace(/\d+/g, (match) => match.split('').reverse().join(''))
}

// Function to generate the Candidates PDF
const generateCandidatesPDF = async (selectedClients) => {
  try {
    const templatePath = path.join(__dirname, '../templates/ملف المترشحين.pdf') // Ensure you have the correct template
    if (!fs.existsSync(templatePath)) {
      throw new Error(`Template file not found at path: ${templatePath}`)
    }

    const existingPdfBytes = fs.readFileSync(templatePath)
    const pdfDoc = await PDFDocument.load(existingPdfBytes)

    pdfDoc.registerFontkit(fontkit)

    const amiriFontBytes = await loadFont()
    const amiriFont = await pdfDoc.embedFont(amiriFontBytes)

    // Start with a fresh page
    let currentPage = pdfDoc.getPages()[0]
    const pageHeight = currentPage.getHeight()

    // Adjust the starting Y position and set consistent gap between entries
    const startingY = pageHeight - 272 // Adjusted to ensure consistent starting point
    const gap = 22 // Gap between lines

    // Calculate how many clients can fit on one page
    const availableHeight = startingY - 50 // 50 units from the bottom margin
    const clientsPerPage = Math.floor(availableHeight / gap)

    // Draw the list of clients' data
    for (let index = 0; index < selectedClients.length; index++) {
      const client = selectedClients[index]

      // Create a new page if needed
      if (index !== 0 && index % clientsPerPage === 0) {
        const [templatePage] = await pdfDoc.copyPages(pdfDoc, [0])
        pdfDoc.addPage(templatePage)
        currentPage = pdfDoc.getPages()[pdfDoc.getPageCount() - 1]
      }

      // Calculate the position for the current client
      const positionInPage = index % clientsPerPage
      const yOffset = startingY - positionInPage * gap

      const clientFullName = client.fullName || ''
      const registrationNumber = reverseNumbersInString(client.register_number) || ''
      const birthDate = reverseNumbersInString(client.birthDate) || ''
      const nextTest = client.nextTest || ''

      // Map the nextTest to the specified Arabic strings
      let examType = ''
      if (nextTest === 'اختبار قانون المرور') {
        examType = 'قانون المرور'
      } else if (nextTest === 'اختبار المناورات') {
        examType = 'المناورة'
      } else if (nextTest === 'اختبار القيادة') {
        examType = 'القيادة'
      } else {
        examType = nextTest // In case it's a different string
      }

      // Starting x-position for the name
      const startingX = 493 // Adjust this value as needed

      // Draw the client's full name
      drawTextWithArabicSupport(
        currentPage,
        reverseNumbersInString(clientFullName),
        startingX, // x-position for name
        yOffset,
        amiriFont,
        10,
        rgb(0, 0, 0)
      )

      // Draw the client's registration number, x decreased by 50
      drawTextWithArabicSupport(
        currentPage,
        reverseNumbersInString(registrationNumber),
        startingX - 100, // x-position decreased by 100
        yOffset,
        amiriFont,
        10,
        rgb(0, 0, 0)
      )

      // Draw the client's date of birth, x decreased by 200
      drawTextWithArabicSupport(
        currentPage,
        reverseNumbersInString(birthDate),
        startingX - 155, // x-position decreased by 200
        yOffset,
        amiriFont,
        10,
        rgb(0, 0, 0)
      )

      // Draw the client's exam type, x decreased by 300
      drawTextWithArabicSupport(
        currentPage,
        reverseNumbersInString(examType),
        startingX - 280, // x-position decreased by 300
        yOffset,
        amiriFont,
        10,
        rgb(0, 0, 0)
      )
    }

    // Save the PDF
    const outputPath = path.join(__dirname, '../output', `ملف_المترشحين.pdf`)
    if (!fs.existsSync(path.dirname(outputPath))) {
      fs.mkdirSync(path.dirname(outputPath), { recursive: true })
    }

    const pdfBytes = await pdfDoc.save()
    fs.writeFileSync(outputPath, pdfBytes)

    return outputPath
  } catch (error) {
    // Handle errors during PDF generation
    console.error('Error generating Candidates PDF:', error)
    throw error
  }
}

export default generateCandidatesPDF

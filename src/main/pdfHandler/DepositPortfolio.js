import { PDFDocument, rgb, degrees } from 'pdf-lib'
import fs from 'fs'
import path from 'path'
import fontkit from '@pdf-lib/fontkit'
import { app } from 'electron'

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

// Function to generate the deposit portfolio PDF
const generateDepositPortfolioPDF = async (selectedClients) => {
  try {
    const templatePath = path.join(__dirname, '../templates/ملف الإيداع.pdf')

    // Check if the template exists; if not, throw an error
    if (!fs.existsSync(templatePath)) {
      throw new Error(`Template file not found at path: ${templatePath}`)
    }

    const existingPdfBytes = fs.readFileSync(templatePath)
    const pdfDoc = await PDFDocument.load(existingPdfBytes)

    pdfDoc.registerFontkit(fontkit)

    const amiriFontBytes = await loadFont()
    const amiriFont = await pdfDoc.embedFont(amiriFontBytes)

    const pages = pdfDoc.getPages()
    if (pages.length === 0) {
      throw new Error('No pages found in the PDF document.')
    }

    const firstPage = pages[0]
    const pageHeight = firstPage.getHeight()

    // Adjust the starting Y position and set consistent gap between names
    const startingY = pageHeight - 285
    const gap = 22 // Set consistent gap between lines

    // Draw the list of 15 clients' names
    selectedClients.slice(0, 15).forEach((client, index) => {
      const clientFullName = `${client.first_name_ar || ''} ${client.last_name_ar || ''}`

      // Adjust position dynamically for each client entry
      const yOffset = startingY - index * gap

      // Draw the full name
      drawTextWithArabicSupport(
        firstPage,
        reverseNumbersInString(clientFullName),
        550,
        yOffset,
        amiriFont,
        13,
        rgb(0, 0, 0)
      )
    })

    // Optionally, print the current year in the document
    const currentYear = new Date().getFullYear().toString()
    drawTextWithArabicSupport(
      firstPage,
      currentYear,
      535,
      pageHeight - 205,
      amiriFont,
      13,
      rgb(0, 0, 0)
    )

    const outputDir = path.join(app.getPath('userData'), 'clients')
    const outputPath = path.join(outputDir, 'ملف الإيداع.pdf')

    // Ensure the output directory exists
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true })
    }

    // Save the generated PDF in the output directory
    const pdfBytes = await pdfDoc.save()
    fs.writeFileSync(outputPath, pdfBytes)

    return outputPath
  } catch (error) {
    // Handle errors during PDF generation
    console.error('Error generating Deposit Portfolio PDF:', error)
    throw error
  }
}

// Reverse numbers in the string (useful for Arabic formatting)
function reverseNumbersInString(str) {
  // Ensure str is a string before using replace
  return String(str).replace(/\d+/g, (match) => match.split('').reverse().join(''))
}

export default generateDepositPortfolioPDF

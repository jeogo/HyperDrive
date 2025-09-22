import { PDFDocument, rgb } from 'pdf-lib'
import fs from 'fs'
import path from 'path'
import fontkit from '@pdf-lib/fontkit'
import { app } from 'electron'
import { formatDateForArabic, drawDateLTR } from './utils/dateUtils.js'
import { loadFont, drawTextWithArabicSupport, reverseNumbersInString } from './utils/pdfUtils.js'

// Function to generate the Candidates PDF
const generateCandidatesPDF = async (selectedClients) => {
  try {
    // Define the path to the template and output directory
    const templatePath = path.join(__dirname, '../templates/ملف المترشحين.pdf')
    const outputDir = app.getPath('userData') // Use Electron's app path for safe, platform-independent storage
    const outputPath = path.join(outputDir, 'clients', 'ملف_المترشحين.pdf')

    // If the template file doesn't exist, generate a fallback blank template
    if (!fs.existsSync(templatePath)) {
      console.log(`Template not found. Generating fallback.`)
      const fallbackPdfDoc = await PDFDocument.create()
      fallbackPdfDoc.addPage([600, 800]) // Create a blank page
      const fallbackPdfBytes = await fallbackPdfDoc.save()
      fs.writeFileSync(templatePath, fallbackPdfBytes) // Save the fallback template
    }

    // Read the existing template and load it into PDFDocument
    const existingPdfBytes = fs.readFileSync(templatePath)
    const pdfDoc = await PDFDocument.load(existingPdfBytes)
    pdfDoc.registerFontkit(fontkit) // Register fontkit for custom font usage

    // Load the Amiri bold (fallback to regular if bold missing)
    const amiriFontBytes = await loadFont('bold')
    if (!amiriFontBytes) throw new Error('Amiri font not found.')
    const amiriFont = await pdfDoc.embedFont(amiriFontBytes)

    // Calculate counts of candidates for each test based on selected clients
    let totalCandidates = selectedClients.length
    let trafficLawCount = 0,
      manoeuvresCount = 0,
      drivingCount = 0

    selectedClients.forEach((client) => {
      const nextTest = client.nextTest
      if (nextTest === 'اختبار قانون المرور') trafficLawCount++
      else if (nextTest === 'اختبار المناورات') manoeuvresCount++
      else if (nextTest === 'اختبار القيادة') drivingCount++
    })

    // Get the first page of the PDF and start drawing client data
    let currentPage = pdfDoc.getPages()[0]
    const startingY = currentPage.getHeight() - 272 // Adjust starting Y position
    const gap = 22 // Set the vertical gap between lines
    const availableHeight = startingY - 50
    const clientsPerPage = Math.floor(availableHeight / gap) // Calculate how many clients fit per page

    // Draw the list of clients' data
    for (let index = 0; index < selectedClients.length; index++) {
      const client = selectedClients[index]

      // Create a new page when necessary
      if (index !== 0 && index % clientsPerPage === 0) {
        const [templatePage] = await pdfDoc.copyPages(pdfDoc, [0]) // Copy the template page for a new page
        pdfDoc.addPage(templatePage) // Add the new page to the document
        currentPage = pdfDoc.getPages()[pdfDoc.getPageCount() - 1] // Switch to the new page
      }

      const positionInPage = index % clientsPerPage
      const yOffset = startingY - positionInPage * gap // Calculate the Y position for this entry

      const clientFullName = client.fullName || ''
      const registrationNumber = reverseNumbersInString(client.register_number) || ''
      const birthDate = formatDateForArabic(client.birthDate) || ''
      const nextTest = client.nextTest || ''

      let examType = ''
      if (nextTest === 'اختبار قانون المرور') {
        examType = 'قانون المرور'
      } else if (nextTest === 'اختبار المناورات') {
        examType = 'المناورة'
      } else if (nextTest === 'اختبار القيادة') {
        examType = 'السياقة'
      } else {
        examType = nextTest
      }

      const startingX = 493 // X position for the first column (RTL text)

      // Draw client data (name, registration number, birth date, next test type)
      drawTextWithArabicSupport(
        currentPage,
        clientFullName,
        startingX,
        yOffset,
        amiriFont,
        11,
        rgb(0, 0, 0),
        0,
        !amiriFontBytes || amiriFontBytes.length === 0
      )
      drawTextWithArabicSupport(
        currentPage,
        registrationNumber,
        startingX - 100,
        yOffset,
        amiriFont,
        11,
        rgb(0, 0, 0),
        0,
        !amiriFontBytes || amiriFontBytes.length === 0
      )
      // Draw birth date with stable LTR digits (per-character)
      drawDateLTR(currentPage, birthDate, startingX - 155, yOffset, amiriFont, 11, rgb(0, 0, 0))
      drawTextWithArabicSupport(
        currentPage,
        examType,
        startingX - 280,
        yOffset,
        amiriFont,
        11,
        rgb(0, 0, 0),
        0,
        !amiriFontBytes || amiriFontBytes.length === 0
      )
    }

    // Draw the counts at the bottom of the last page
    const countsY = 100
    const countsX = 455

    drawTextWithArabicSupport(
      currentPage,
      ` ${reverseNumbersInString(totalCandidates)}`,
      countsX,
      countsY,
      amiriFont,
      13,
      rgb(0, 0, 0),
      0,
      !amiriFontBytes || amiriFontBytes.length === 0
    )
    drawTextWithArabicSupport(
      currentPage,
      ` ${reverseNumbersInString(trafficLawCount)}`,
      countsX,
      countsY + 65,
      amiriFont,
      13,
      rgb(0, 0, 0),
      0,
      !amiriFontBytes || amiriFontBytes.length === 0
    )
    drawTextWithArabicSupport(
      currentPage,
      ` ${reverseNumbersInString(manoeuvresCount)}`,
      countsX,
      countsY + 43,
      amiriFont,
      13,
      rgb(0, 0, 0),
      0,
      !amiriFontBytes || amiriFontBytes.length === 0
    )
    drawTextWithArabicSupport(
      currentPage,
      ` ${reverseNumbersInString(drivingCount)}`,
      countsX,
      countsY + 20,
      amiriFont,
      13,
      rgb(0, 0, 0),
      0,
      !amiriFontBytes || amiriFontBytes.length === 0
    )

    // Ensure the output directory exists before saving the file
    if (!fs.existsSync(path.dirname(outputPath))) {
      fs.mkdirSync(path.dirname(outputPath), { recursive: true })
    }

    // Save the generated PDF to the output path
    const pdfBytes = await pdfDoc.save()
    fs.writeFileSync(outputPath, pdfBytes)

    return outputPath // Return the path to the generated PDF
  } catch (error) {
    console.error('Error generating Candidates PDF:', error)
    throw error
  }
}

export default generateCandidatesPDF

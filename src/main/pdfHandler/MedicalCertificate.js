import { PDFDocument, rgb } from 'pdf-lib';
import fs from 'fs';
import path from 'path';
import fontkit from '@pdf-lib/fontkit';

const loadFont = async () => {
  const fontPath = path.join(__dirname, '../fonts/Amiri-Regular.ttf');
  if (!fs.existsSync(fontPath)) {
    throw new Error(`Font file not found at path: ${fontPath}`);
  }
  return fs.readFileSync(fontPath);
};

// Function to handle RTL (Right-to-Left) text alignment
function drawRightToLeftText(page, text, x, y, font, size, color) {
  const textWidth = font.widthOfTextAtSize(text, size);
  const adjustedX = x - textWidth; // Adjust the x-coordinate for RTL text
  page.drawText(text, { x: adjustedX, y, size, font, color });
}

// Function to reverse numbers in a string (for RTL usage)
const reverseNumbersInString = (str) => {
  return str.replace(/\d+/g, (match) => match.split('').reverse().join(''));
};

// Function to reverse a date string (YYYY-MM-DD to DD-MM-YYYY)
const reverseDate = (dateString) => {
  const [year, month, day] = dateString.split('-');
  return `${day}-${month}-${year}`;
};

const MedicalCertificate = async (clientData) => {
  const templatePath = path.join(__dirname, '../templates/شهادة طبية.pdf');
  if (!fs.existsSync(templatePath)) {
    throw new Error(`Template file not found at path: ${templatePath}`);
  }

  const existingPdfBytes = fs.readFileSync(templatePath);
  const pdfDoc = await PDFDocument.load(existingPdfBytes);

  pdfDoc.registerFontkit(fontkit);

  const amiriFontBytes = await loadFont();
  const amiriFont = await pdfDoc.embedFont(amiriFontBytes);

  const pages = pdfDoc.getPages();
  const page = pages[0];

  const pageHeight = page.getHeight();

  // Ensure birth_date exists and reverse it
  const formattedBirthDate = clientData.birth_date ? reverseDate(clientData.birth_date) : '';

  // Define the variables for client data
  const firstName = clientData.first_name_ar || '';
  const lastName = clientData.last_name_ar || '';
  const birthDetails = reverseNumbersInString(`${clientData.birth_place || ''} - ${formattedBirthDate}`);
  const address = reverseNumbersInString(clientData.current_address || '');
  const phone = reverseNumbersInString(clientData.phone_number || '');

  // Now control both x and y positions with RTL text support using variables
  drawRightToLeftText(page, firstName, 530, pageHeight - 168, amiriFont, 14, rgb(0, 0, 0)); // First name
  drawRightToLeftText(page, lastName, 530, pageHeight - 150, amiriFont, 14, rgb(0, 0, 0)); // Last name
  drawRightToLeftText(page, birthDetails, 490, pageHeight - 185, amiriFont, 14, rgb(0, 0, 0)); // Birth place and date
  drawRightToLeftText(page, address, 530, pageHeight - 210, amiriFont, 14, rgb(0, 0, 0)); // Address
  drawRightToLeftText(page, phone, 480, pageHeight - 230, amiriFont, 14, rgb(0, 0, 0)); // Phone

  if (!fs.existsSync(clientData.path)) {
    fs.mkdirSync(clientData.path, { recursive: true });
  }

  const fileName = `شهادة طبية.pdf`;
  const outputPath = path.join(clientData.path, fileName);

  const pdfBytes = await pdfDoc.save();
  fs.writeFileSync(outputPath, pdfBytes);

  return outputPath;
};

export default MedicalCertificate;

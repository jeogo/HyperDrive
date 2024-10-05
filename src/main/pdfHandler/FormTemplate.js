import { PDFDocument, rgb, degrees } from 'pdf-lib';
import fs from 'fs';
import path from 'path';
import fontkit from '@pdf-lib/fontkit';

// Load the font from the system
const loadFont = async () => {
  const fontPath = path.join(__dirname, '../fonts/Amiri-Regular.ttf');
  if (!fs.existsSync(fontPath)) {
    throw new Error(`Font file not found at path: ${fontPath}`);
  }
  return fs.readFileSync(fontPath);
};

// Fix number reversal issue in strings
const reverseNumbersInString = (str) => {
  return str.replace(/\d+/g, (match) => match.split('').reverse().join(''));
};

// Function to draw Arabic text with RTL support
function drawTextWithArabicSupport(page, text, x, y, font, size, color, rotate = 0) {
  const textWidth = font.widthOfTextAtSize(text, size);
  const adjustedX = x - textWidth; // Adjust the x-coordinate for RTL text
  const textOptions = { x: adjustedX, y, size, font, color };
  if (rotate) {
    textOptions.rotate = degrees(rotate);
  }
  page.drawText(text, textOptions);
}

// Main function to generate the form PDF
const FormTemplate = async (clientData) => {
  const templatePath = path.join(__dirname, '../templates/نموذج الاستمارة - سماعيل.pdf');
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

  // Automatically get the width and height of the page
  const pageHeight = page.getHeight();

  // Reverse numbers in relevant fields
  const client = {
    fullNameAr: `${clientData.first_name_ar || ''} ${clientData.last_name_ar || ''}`,
    firstNameAr: clientData.first_name_ar || '',
    lastNameAr: clientData.last_name_ar || '',
    firstName: clientData.first_name || '',
    lastName: clientData.last_name || '',
    fatherName: clientData.father_name || '',
    motherFullName: `${clientData.mother_first_name || ''} ${clientData.mother_last_name || ''}`,
    birthDate: clientData.birth_date || '',
    birthPlace: reverseNumbersInString(clientData.birth_place || ''), // Reversed
    birthState: clientData.birth_state || '',
    birthMunicipality: clientData.birth_municipality || '',
    bloodType: clientData.blood_type || '',
    nationalId: (clientData.national_id || ''), // Reversed
    phoneNumber: (clientData.phone_number || ''), // Reversed
    currentAddress: reverseNumbersInString(clientData.current_address || ''), // Reversed
    currentState: clientData.current_state || '',
    currentMunicipality: clientData.current_municipality || '',
    originalNationality: clientData.original_nationality || '',
    acquiredNationality: clientData.acquired_nationality || '',
    countryOfBirth: clientData.country_of_birth || '',
    embassyOrConsulate: clientData.embassy_or_consulate || '',
    registerDate: clientData.register_date || '',
    gender: clientData.gender || '',
    familyStatus: clientData.family_status || '',
    path: clientData.path || ''
  };

  // Drawing text with adjusted coordinates for RTL
  drawTextWithArabicSupport(page, client.lastNameAr, 550, pageHeight - 325, amiriFont, 13, rgb(0, 0, 0));
  drawTextWithArabicSupport(page, client.firstNameAr, 550, pageHeight - 345, amiriFont, 13, rgb(0, 0, 0));
  drawTextWithArabicSupport(page, client.fatherName, 545, pageHeight - 402, amiriFont, 13, rgb(0, 0, 0));
  drawTextWithArabicSupport(page, client.motherFullName, 260, pageHeight - 402, amiriFont, 13, rgb(0, 0, 0));
  drawTextWithArabicSupport(page, client.birthDate, 510, pageHeight - 383, amiriFont, 13, rgb(0, 0, 0));
  drawTextWithArabicSupport(page, client.birthPlace, 430, pageHeight - 383, amiriFont, 13, rgb(0, 0, 0));
  drawTextWithArabicSupport(page, client.birthState, 320, pageHeight - 383, amiriFont, 13, rgb(0, 0, 0));
  drawTextWithArabicSupport(page, client.birthMunicipality, 200, pageHeight - 383, amiriFont, 13, rgb(0, 0, 0));
  drawTextWithArabicSupport(page, client.bloodType, 128, pageHeight - 301, amiriFont, 13, rgb(0, 0, 0));
  drawTextWithArabicSupport(page, client.nationalId, 450, pageHeight - 301, amiriFont, 13, rgb(0, 0, 0));
  drawTextWithArabicSupport(page, client.phoneNumber, 400, pageHeight - 477, amiriFont, 13, rgb(0, 0, 0));
  drawTextWithArabicSupport(page, client.currentAddress, 520, pageHeight - 420, amiriFont, 13, rgb(0, 0, 0));
  drawTextWithArabicSupport(page, client.currentState, 320, pageHeight - 420, amiriFont, 13, rgb(0, 0, 0));
  drawTextWithArabicSupport(page, client.currentMunicipality, 200, pageHeight - 420, amiriFont, 13, rgb(0, 0, 0));
  drawTextWithArabicSupport(page, client.originalNationality, 520, pageHeight - 515, amiriFont, 13, rgb(0, 0, 0));

  if (client.acquiredNationality) {
    drawTextWithArabicSupport(page, client.acquiredNationality, 300, pageHeight - 515, amiriFont, 13, rgb(0, 0, 0));
    drawTextWithArabicSupport(page, client.countryOfBirth, 410, pageHeight - 535, amiriFont, 13, rgb(0, 0, 0));
    drawTextWithArabicSupport(page, client.embassyOrConsulate, 210, pageHeight - 535, amiriFont, 13, rgb(0, 0, 0));
  }

  // Mark the appropriate marital status
  const maritalStatusX = 512;
  const maritalStatusY = 500;
  switch (client.familyStatus) {
    case 'single':
      drawTextWithArabicSupport(page, 'X', maritalStatusX - 15, maritalStatusY - 100, amiriFont, 18, rgb(0, 0, 0));
      break;
    case 'married':
      drawTextWithArabicSupport(page, 'X', maritalStatusX - 100, maritalStatusY - 100, amiriFont, 18, rgb(0, 0, 0));
      break;
    case 'divorced':
      drawTextWithArabicSupport(page, 'X', maritalStatusX - 187, maritalStatusY - 100, amiriFont, 18, rgb(0, 0, 0));
      break;
    case 'widowed':
      drawTextWithArabicSupport(page, 'X', maritalStatusX - 270, maritalStatusY - 100, amiriFont, 18, rgb(0, 0, 0));
      break;
    default:
      break;
  }

  // Mark the appropriate gender
  if (client.gender === 'male') {
    drawTextWithArabicSupport(page, 'X', 500, pageHeight - 365, amiriFont, 18, rgb(0, 0, 0));
  } else if (client.gender === 'female') {
    drawTextWithArabicSupport(page, 'X', 440, pageHeight - 365, amiriFont, 18, rgb(0, 0, 0));
  }

  if (!fs.existsSync(client.path)) {
    fs.mkdirSync(client.path, { recursive: true });
  }

  const fileName = `A3 نموذج الاستمارة.pdf`;
  const outputPath = path.join(client.path, fileName);

  const pdfBytes = await pdfDoc.save();
  fs.writeFileSync(outputPath, pdfBytes);

  return outputPath;
};

export default FormTemplate;

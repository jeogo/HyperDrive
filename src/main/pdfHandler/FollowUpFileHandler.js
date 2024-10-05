import { PDFDocument, rgb, degrees } from 'pdf-lib';
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

function drawTextWithArabicSupport(page, text, x, y, font, size, color, rotate = 0) {
  const textWidth = font.widthOfTextAtSize(text, size);
  const adjustedX = x - textWidth; // Adjust the x-coordinate for RTL text
  const textOptions = { x: adjustedX, y, size, font, color };
  if (rotate) {
    textOptions.rotate = degrees(rotate);
  }
  page.drawText(text, textOptions);
}

function reverseNumbersInString(str) {
  return str.replace(/\d+/g, (match) => match.split('').reverse().join(''));
}

const generateFollowUpFilePDF = async (clientData) => {
  const templatePath = path.join(__dirname, '../templates/ملف المتابعة.pdf');
  if (!fs.existsSync(templatePath)) {
    throw new Error(`Template file not found at path: ${templatePath}`);
  }

  const existingPdfBytes = fs.readFileSync(templatePath);
  const pdfDoc = await PDFDocument.load(existingPdfBytes);

  pdfDoc.registerFontkit(fontkit);

  const amiriFontBytes = await loadFont();
  const amiriFont = await pdfDoc.embedFont(amiriFontBytes);

  const pages = pdfDoc.getPages();
  if (pages.length === 0) {
    throw new Error('No pages found in the PDF document.');
  }

  const firstPage = pages[0];
  const secondPage = pages.length > 1 ? pages[1] : null;

  // Automatically get the width and height of the first page
  const pageHeight = firstPage.getHeight();

  const client = {
    fullNameAr: `${clientData.first_name_ar || ''} ${clientData.last_name_ar || ''}`,
    birthInfo: reverseNumbersInString(` ${clientData.birth_date || ''} -  ${clientData.birth_place || ''}`),
    addressInfo: reverseNumbersInString(` ${clientData.current_address || ''}`),
    phoneNumber: clientData.phone_number || '',
    paid: clientData.paid ? ` ${clientData.paid}` : '0',
    ReagisterDate: clientData?.register_date || " -  -  ",

  };

  // Draw concatenated birth date, birth place, and current address on the same line
  drawTextWithArabicSupport(firstPage, client.fullNameAr, 320, pageHeight - 187, amiriFont, 13, rgb(0, 0, 0));
  drawTextWithArabicSupport(firstPage, client.birthInfo, 290, pageHeight - 201, amiriFont, 13, rgb(0, 0, 0));
  drawTextWithArabicSupport(firstPage, client.addressInfo, 345, pageHeight - 225, amiriFont, 13, rgb(0, 0, 0));
  drawTextWithArabicSupport(firstPage, client.phoneNumber, 330, pageHeight - 250, amiriFont, 13, rgb(0, 0, 0));
  drawTextWithArabicSupport(firstPage, client.ReagisterDate, 250, pageHeight - 278, amiriFont, 13, rgb(0, 0, 0));



  // Draw payment information on the second page, if available
  if (secondPage) {
    drawTextWithArabicSupport(secondPage, client.paid +"DA", 315,  79, amiriFont, 13, rgb(0, 0, 0));
  }

  if (!fs.existsSync(clientData.path)) {
    fs.mkdirSync(clientData.path, { recursive: true });
  }

  const fileName = `ملف المتابعة.pdf`;
  const outputPath = path.join(clientData.path, fileName);

  const pdfBytes = await pdfDoc.save();
  fs.writeFileSync(outputPath, pdfBytes);

  return outputPath;
};

export default generateFollowUpFilePDF;

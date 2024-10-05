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

const PreparationCardForManeuversExam = async (clientData) => {
  const templatePath = path.join(__dirname, '../templates/بطاقة الإعداد لامتحان المناورات.pdf');
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

  const client = {
    fullNameAr: `${clientData.first_name_ar || ''} ${clientData.last_name_ar || ''}`
  };

  // Drawing the full name (first name and last name) on the same line
  drawTextWithArabicSupport(page, client.fullNameAr, 465, pageHeight - 105, amiriFont, 13, rgb(0, 0, 0));

  if (!fs.existsSync(clientData.path)) {
    fs.mkdirSync(clientData.path, { recursive: true });
  }

  const fileName = `بطاقة الإعداد لامتحان المناورات.pdf`;
  const outputPath = path.join(clientData.path, fileName);

  const pdfBytes = await pdfDoc.save();
  fs.writeFileSync(outputPath, pdfBytes);

  return outputPath;
};

export default PreparationCardForManeuversExam;

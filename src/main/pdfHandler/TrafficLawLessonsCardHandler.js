import { PDFDocument, rgb, degrees } from 'pdf-lib';
import fs from 'fs';
import path from 'path';
import fontkit from '@pdf-lib/fontkit';

// Load the Amiri font for Arabic support
const loadFont = async () => {
  const fontPath = path.join(__dirname, '../fonts/Amiri-Regular.ttf');
  if (!fs.existsSync(fontPath)) {
    throw new Error(`Font file not found at path: ${fontPath}`);
  }
  return fs.readFileSync(fontPath);
};

// Function to generate 25 valid dates starting from the day after the registered date, avoiding Fridays and holidays
const generate25ValidDates = (startDate, holidays) => {
  let date = new Date(startDate);
  date.setDate(date.getDate() + 1); // Start from the day after the registered date
  const validDates = [];

  while (validDates.length < 25) {
    const isFriday = date.getDay() === 5; // 5 is Friday
    const isHoliday = holidays.some((holiday) => holiday.getTime() === date.getTime());

    if (!isFriday && !isHoliday) {
      validDates.push(new Date(date)); // Store the valid date
    }

    date.setDate(date.getDate() + 1);
  }

  return validDates;
};

// Manually defining Islamic holidays for demonstration purposes
function getReligiousHolidays(year) {
  const holidays = [];

  // Example dates; these should be calculated based on the Islamic lunar calendar or obtained from a reliable source
  holidays.push(new Date(year, 3, 21)); // Example: Eid al-Fitr (assuming it falls on this Gregorian date)
  holidays.push(new Date(year, 6, 30)); // Example: Eid al-Adha

  return holidays;
}

// Get national holidays
function getNationalHolidays(year) {
  return [
    new Date(year, 0, 1), // New Year's Day - January 1
    new Date(year, 4, 1), // Labor Day - May 1
    new Date(year, 6, 5), // Independence Day - July 5
    new Date(year, 10, 1) // Revolution Day - November 1
  ];
}

// Combine both holiday types
function getAllHolidays(year) {
  return [...getReligiousHolidays(year), ...getNationalHolidays(year)];
}

function drawTextWithArabicSupport(page, text, x, y, font, size, color, rotate = 0) {
  const textWidth = font.widthOfTextAtSize(text, size);
  const adjustedX = x - textWidth; // Adjust the x-coordinate for RTL text
  const textOptions = { x: adjustedX, y, size, font, color };
  if (rotate) {
    textOptions.rotate = degrees(rotate);
  }
  page.drawText(text, textOptions);
}

const generateTrafficLawLessonsCardPDF = async (clientData) => {
  const templatePath = path.join(__dirname, '../templates/بطاقة خاصة بدروس قانون المرور .pdf');
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

  // Function to reverse numbers in a string (if needed)
  function reverseNumbersInString(str) {
    return str.replace(/\d+/g, (match) => match.split('').reverse().join(''));
  }

  // Function to format the date as YYYY-MM-DD
  function formatDateAsYYYYMMDD(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are zero-indexed
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  // Calculate holidays for the year
  const year = new Date(clientData.register_date).getFullYear();
  const holidays = getAllHolidays(year);

  // Generate the 25 valid dates starting from the day after the registered date, avoiding Fridays and holidays
  const validDates = generate25ValidDates(new Date(clientData.register_date), holidays);

  // Use the last date as the end date
  const endDate = validDates[validDates.length - 1];
  const formattedEndDate = formatDateAsYYYYMMDD(endDate);

  const client = {
    fullNameAr: `${clientData.first_name_ar || ''} ${clientData.last_name_ar || ''}`,
    birthAndPlace: reverseNumbersInString(
      ` ${clientData.birth_date || ''} -  ${clientData.birth_place || ''}`
    ),
    currentAddress: ` ${clientData.current_address || ''}`,
    registeredDate: ` ${clientData.register_date || ''}`,
    endDate: formattedEndDate
  };

  // Draw the full name on one line
  drawTextWithArabicSupport(
    page,
    client.fullNameAr,
    260,
    pageHeight - 160,
    amiriFont,
    13,
    rgb(0, 0, 0)
  );

  // Draw birth date and place on one line
  drawTextWithArabicSupport(
    page,
    client.birthAndPlace,
    470,
    pageHeight - 175,
    amiriFont,
    13,
    rgb(0, 0, 0)
  );

  // Draw current address on one line
  drawTextWithArabicSupport(
    page,
    reverseNumbersInString( client.currentAddress),
    510,
    pageHeight - 190,
    amiriFont,
    13,
    rgb(0, 0, 0)
  );

  // Draw registered date on one line
  drawTextWithArabicSupport(
    page,
    client.registeredDate,
    260,
    pageHeight - 190,
    amiriFont,
    13,
    rgb(0, 0, 0)
  );

  // Draw all 25 valid dates on the PDF, starting from a y-coordinate
  let currentY = pageHeight - 255;
  validDates.forEach((date) => {
    const formattedDate = formatDateAsYYYYMMDD(date);
    drawTextWithArabicSupport(page, formattedDate, 340, currentY, amiriFont, 13, rgb(0, 0, 0));
    currentY -= 20; // Move down for the next date
  });

  if (!fs.existsSync(clientData.path)) {
    fs.mkdirSync(clientData.path, { recursive: true });
  }

  const fileName = `بطاقة خاصة بدروس قانون المرور.pdf`;
  const outputPath = path.join(clientData.path, fileName);

  const pdfBytes = await pdfDoc.save();
  fs.writeFileSync(outputPath, pdfBytes);

  return outputPath;
};

export default generateTrafficLawLessonsCardPDF;

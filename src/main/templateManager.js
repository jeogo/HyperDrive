import PreparationCardForManeuversExam from './pdfHandler/PreparationCardForManeuversExam';
import FormTemplate from './pdfHandler/FormTemplate';
import generateFollowUpFilePDF from './pdfHandler/FollowUpFileHandler';
import generateTrafficLawLessonsCardPDF from './pdfHandler/TrafficLawLessonsCardHandler';
import MedicalCertificate from './pdfHandler/MedicalCertificate';
import generateDepositPortfolioPDF from './pdfHandler/DepositPortfolio'; // Existing deposit portfolio handler
import generateCandidatesPDF from './pdfHandler/Candidates'; // Import the new Candidates handler

// Map template names to their respective PDF generation functions
const templateHandlers = {
  preparationCard: PreparationCardForManeuversExam,
  formTemplate: FormTemplate,
  followUpFile: generateFollowUpFilePDF,
  trafficLawLessonsCard: generateTrafficLawLessonsCardPDF,
  medicalCertificate: MedicalCertificate,
  depositPortfolio: generateDepositPortfolioPDF,
  candidates: generateCandidatesPDF // Add the candidates handler for generating the candidate list
};

// Function to generate a PDF based on template name and client data
export const generatePDFByTemplateName = async (templateName, clientData) => {
  try {
    // Look up the appropriate handler from templateHandlers
    const handler = templateHandlers[templateName];

    if (!handler) {
      throw new Error(`Handler not found for template: ${templateName}`);
    }

    // Call the appropriate handler to generate the PDF
    return await handler(clientData);
  } catch (error) {
    // Handle errors during PDF generation
    throw new Error(`Failed to generate PDF for template ${templateName}: ${error.message}`);
  }
};

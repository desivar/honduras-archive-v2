const Tesseract = require('tesseract.js');
const pdf = require('pdf-parse');
const { PDFDocument } = require('pdf-lib');

/**
 * processHistoricalPDF
 * Logic: Extracts text/images from a PDF and suggests categories
 */
const processHistoricalPDF = async (pdfBuffer) => {
  try {
    // 1. First, check if the PDF already has a text layer (Faster)
    const fastData = await pdf(pdfBuffer);
    
    // 2. If it's a scanned image (common for 1800s), use Tesseract OCR
    // We initialize the worker in Spanish
    const worker = await Tesseract.createWorker('spa');
    
    // 3. For now, let's process the first page as a "Deep Scan"
    // (You can loop this for more pages later)
    const { data: { text } } = await Tesseract.recognize(pdfBuffer, 'spa');
    
    await worker.terminate();

    // 4. THE INTERNAL BRAIN: Logic to "guess" the content
    let suggestedCategory = 'News';
    const lowerText = text.toLowerCase();

    if (lowerText.includes('falleció') || lowerText.includes('defunción')) {
      suggestedCategory = 'Death';
    } else if (lowerText.includes('nació') || lowerText.includes('bautismo')) {
      suggestedCategory = 'Birth';
    } else if (lowerText.includes('almacén') || lowerText.includes('comercio')) {
      suggestedCategory = 'Business';
    } else if (lowerText.includes('matrimonio') || lowerText.includes('casamiento')) {
      suggestedCategory = 'Marriage';
    }

    // 5. Clean up the text for your Summary field
    const cleanSummary = text.slice(0, 500).replace(/\n/g, ' ') + '...';

    return {
      success: true,
      data: {
        extractedText: text,
        summary: cleanSummary,
        category: suggestedCategory,
        // We send this back to your .jsx page to auto-fill the forms
        autoFields: {
          category: suggestedCategory,
          summary: cleanSummary,
          location: text.includes('Tegucigalpa') ? 'Tegucigalpa' : '',
        }
      }
    };

  } catch (error) {
    console.error("Internal AI Error:", error);
    return { success: false, error: error.message };
  }
};

module.exports = { processHistoricalPDF };
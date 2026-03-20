const Tesseract = require('tesseract.js');
const pdfParse = require('pdf-parse');

/**
 * processHistoricalPDF
 * Strategy:
 * 1. Try pdf-parse first (fast, works if PDF has a text layer)
 * 2. If no text found (scanned image PDF), use Tesseract directly on the buffer
 *    with a workaround for older scanned documents
 */
const processHistoricalPDF = async (pdfBuffer) => {
  try {
    console.log('📜 Step 1: Trying text extraction with pdf-parse...');
    
    let extractedText = '';

    // ATTEMPT 1: Try to get text layer directly (fast)
    try {
      const pdfData = await pdfParse(pdfBuffer);
      extractedText = pdfData.text || '';
      console.log(`📄 pdf-parse found ${extractedText.length} characters`);
    } catch (parseErr) {
      console.warn('⚠️ pdf-parse failed, will try OCR:', parseErr.message);
    }

    // ATTEMPT 2: If no text layer found, use Tesseract OCR
    if (!extractedText || extractedText.trim().length < 50) {
      console.log('🔍 Step 2: No text layer found. Running Tesseract OCR...');
      
      try {
        // Tesseract can sometimes handle PDF buffers depending on the version
        // We pass it as a buffer with spa (Spanish) language
        const { data: { text } } = await Tesseract.recognize(pdfBuffer, 'spa', {
          logger: m => {
            if (m.status === 'recognizing text') {
              console.log(`OCR Progress: ${Math.round(m.progress * 100)}%`);
            }
          }
        });
        extractedText = text || '';
        console.log(`✅ Tesseract extracted ${extractedText.length} characters`);
      } catch (ocrErr) {
        console.error('❌ Tesseract OCR failed:', ocrErr.message);
        // If both fail, return partial result with empty text
        // so the user can still fill the form manually
        extractedText = '';
      }
    }

    // Build the auto-suggested fields from whatever text we got
    const lowerText = extractedText.toLowerCase();
    
    let suggestedCategory = 'News';
    if (lowerText.includes('falleció') || lowerText.includes('defunción') || lowerText.includes('muerte')) {
      suggestedCategory = 'Death';
    } else if (lowerText.includes('nació') || lowerText.includes('bautismo') || lowerText.includes('nacimiento')) {
      suggestedCategory = 'Birth';
    } else if (lowerText.includes('almacén') || lowerText.includes('comercio') || lowerText.includes('empresa')) {
      suggestedCategory = 'Business';
    } else if (lowerText.includes('matrimonio') || lowerText.includes('casamiento') || lowerText.includes('boda')) {
      suggestedCategory = 'Marriage';
    } else if (lowerText.includes('batalla') || lowerText.includes('revolución') || lowerText.includes('guerra')) {
      suggestedCategory = 'Historic Event';
    }

    // Try to detect location
    let detectedLocation = '';
    if (lowerText.includes('tegucigalpa')) detectedLocation = 'Tegucigalpa';
    else if (lowerText.includes('san pedro sula')) detectedLocation = 'San Pedro Sula';
    else if (lowerText.includes('comayagua')) detectedLocation = 'Comayagua';
    else if (lowerText.includes('la ceiba')) detectedLocation = 'La Ceiba';

    const cleanSummary = extractedText.length > 0
      ? extractedText.slice(0, 800).replace(/\n+/g, ' ').trim() + '...'
      : 'No text could be extracted. Please fill in the summary manually.';

    console.log(`✅ Processing complete. Category: ${suggestedCategory}, Location: ${detectedLocation}`);

    return {
      success: true,
      data: {
        extractedText,
        summary: cleanSummary,
        category: suggestedCategory,
        autoFields: {
          category: suggestedCategory,
          summary: cleanSummary,
          location: detectedLocation,
        }
      }
    };

  } catch (error) {
    console.error('❌ Internal AI Error:', error);
    return { success: false, error: error.message };
  }
};

module.exports = { processHistoricalPDF };
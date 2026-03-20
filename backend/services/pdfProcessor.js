const Tesseract = require('tesseract.js');
const pdfParse = require('pdf-parse');

// ── Extraction Rules (Spanish keywords per category) ─────────────────────────
const EXTRACTION_RULES = {
  deaths:    ['falleció', 'defunción', 'entierro', 'pésame', 'funeraria', 'obituario', 'muerte'],
  marriages: ['matrimonio', 'boda', 'nupcias', 'contraerán', 'enlace', 'casamiento'],
  births:    ['nacimiento', 'dio a luz', 'recién nacido', 'prole', 'nació', 'bautismo'],
  businesses:['sociedad', 'comercio', 'traspaso', 'clausura', 'inauguración', 'almacén', 'empresa'],
  historicEvents: ['decreto', 'revolución', 'elecciones', 'tratado', 'batalla', 'guerra', 'terremoto', ' primer', 'asume', 'nombrado',
    'apertura', 'cargo','nueva'
  ],
};

// ── Location Detection — Honduras Departments & Major Cities ─────────────────
const LOCATIONS = [
  // Major Cities
  'Tegucigalpa', 'San Pedro Sula', 'La Ceiba', 'Comayagua',
  'Choluteca', 'Juticalpa', 'Santa Rosa de Copán', 'Trujillo',
  'Danlí', 'Siguatepeque', 'Tela', 'El Progreso', 'Tocoa',
  'Olanchito', 'Yoro', 'Nacaome', 'Puerto Cortés', 'Roatán',
'Catacamas',
  // Departments
  'Atlántida', 'Colón', 'Comayagua', 'Copán', 'Cortés',
  'Choluteca', 'El Paraíso', 'Francisco Morazán', 'Gracias a Dios',
  'Intibucá', 'Islas de la Bahía', 'La Paz', 'Lempira',
  'Ocotepeque', 'Olancho', 'Santa Bárbara', 'Valle', 'Yoro',
 
  // Historic / Colonial names common in 1800s-1930s documents
  'Tegucigalpa D.C.', 'Distrito Central', 'Comayagüela',
  'Santa Bárbara', 'Gracias', 'Sensenti', 'Amapala',
  'San Marcos de Colón', 'Esquías', 'Cedros', 'Ojojona',
];

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

    // ── Category Detection ────────────────────────────────────────────────────
    const lowerText = extractedText.toLowerCase();
    let suggestedCategory = 'News';

    if (EXTRACTION_RULES.deaths.some(k => lowerText.includes(k))) {
      suggestedCategory = 'Death';
    } else if (EXTRACTION_RULES.births.some(k => lowerText.includes(k))) {
      suggestedCategory = 'Birth';
    } else if (EXTRACTION_RULES.businesses.some(k => lowerText.includes(k))) {
      suggestedCategory = 'Business';
    } else if (EXTRACTION_RULES.marriages.some(k => lowerText.includes(k))) {
      suggestedCategory = 'Marriage';
    } else if (EXTRACTION_RULES.historicEvents.some(k => lowerText.includes(k))) {
      suggestedCategory = 'Historic Event';
    }

    // ── Location Detection ────────────────────────────────────────────────────
    const detectedLocation = LOCATIONS.find(loc =>
      lowerText.includes(loc.toLowerCase())
    ) || '';

    const cleanSummary = extractedText.length > 0
      ? extractedText.slice(0, 800).replace(/\n+/g, ' ').trim() + '...'
      : 'No text could be extracted. Please fill in the summary manually.';

    console.log(`✅ Done. Category: ${suggestedCategory} | Location: ${detectedLocation}`);

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
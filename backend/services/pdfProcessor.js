const Tesseract = require('tesseract.js');
const pdfParse = require('pdf-parse');
const { createCanvas } = require('canvas');
const pdfjsLib = require('pdfjs-dist/legacy/build/pdf.js');

// ── Extraction Rules ──────────────────────────────────────────────────────────
const EXTRACTION_RULES = {
  deaths:        ['falleció', 'defunción', 'entierro', 'pésame', 'funeraria', 'obituario', 'muerte'],
  marriages:     ['matrimonio', 'boda', 'nupcias', 'contraerán', 'enlace', 'casamiento'],
  births:        ['nacimiento', 'dio a luz', 'recién nacido', 'prole', 'nació', 'bautismo'],
  businesses:    ['sociedad', 'comercio', 'traspaso', 'clausura', 'inauguración', 'almacén', 'empresa'],
  historicEvents:['decreto', 'revolución', 'elecciones', 'tratado', 'batalla', 'guerra'],
};

const LOCATIONS = [
  'Tegucigalpa', 'San Pedro Sula', 'La Ceiba', 'Comayagua',
  'Choluteca', 'Juticalpa', 'Santa Rosa de Copán', 'Trujillo',
  'Danlí', 'Siguatepeque', 'Tela', 'El Progreso', 'Tocoa',
  'Olanchito', 'Yoro', 'Nacaome', 'Puerto Cortés', 'Roatán',
  'Atlántida', 'Colón', 'Copán', 'Cortés', 'El Paraíso',
  'Francisco Morazán', 'Gracias a Dios', 'Intibucá',
  'Islas de la Bahía', 'La Paz', 'Lempira', 'Ocotepeque',
  'Olancho', 'Santa Bárbara', 'Valle', 'Comayagüela',
  'Distrito Central', 'Gracias', 'Amapala', 'Ojojona',
];

/**
 * Renders a single PDF page to a PNG buffer using pdfjs-dist + canvas
 */
const renderPageToImage = async (pdfDoc, pageNum) => {
  const page = await pdfDoc.getPage(pageNum);
  const scale = 2.0; // Higher = better OCR quality
  const viewport = page.getViewport({ scale });

  const canvas = createCanvas(viewport.width, viewport.height);
  const context = canvas.getContext('2d');

  await page.render({
    canvasContext: context,
    viewport,
  }).promise;

  return canvas.toBuffer('image/png');
};

/**
 * processHistoricalPDF
 * Strategy:
 * 1. Try pdf-parse for text layer (fast, works if PDF has text)
 * 2. If scanned/image PDF, render each page to image via pdfjs-dist
 *    then run Tesseract OCR on each page image
 */
const processHistoricalPDF = async (pdfBuffer) => {
  try {
    let extractedText = '';

    // ATTEMPT 1: Text layer via pdf-parse (fast)
    console.log('📜 Step 1: Trying pdf-parse text extraction...');
    try {
      const pdfData = await pdfParse(pdfBuffer);
      extractedText = pdfData.text || '';
      console.log(`📄 pdf-parse found ${extractedText.length} characters`);
    } catch (parseErr) {
      console.warn('⚠️ pdf-parse failed:', parseErr.message);
    }

    // ATTEMPT 2: pdfjs-dist + Tesseract for scanned image PDFs
    if (!extractedText || extractedText.trim().length < 50) {
      console.log('🔍 Step 2: Scanned PDF detected. Converting pages to images...');

      try {
        const uint8Array = new Uint8Array(pdfBuffer);
        const pdfDoc = await pdfjsLib.getDocument({ data: uint8Array }).promise;
        
        // Process first 3 pages max (enough for category detection, saves time)
        const pagesToProcess = Math.min(pdfDoc.numPages, 3);
        console.log(`📄 Processing ${pagesToProcess} of ${pdfDoc.numPages} pages...`);

        const allText = [];

        for (let i = 1; i <= pagesToProcess; i++) {
          console.log(`🖼️ Rendering page ${i}...`);
          const imageBuffer = await renderPageToImage(pdfDoc, i);

          console.log(`🔤 Running OCR on page ${i}...`);
          const { data: { text } } = await Tesseract.recognize(imageBuffer, 'spa', {
            logger: m => {
              if (m.status === 'recognizing text') {
                console.log(`Page ${i} OCR: ${Math.round(m.progress * 100)}%`);
              }
            }
          });

          if (text && text.trim().length > 0) {
            allText.push(text);
          }
        }

        extractedText = allText.join('\n\n');
        console.log(`✅ Total extracted: ${extractedText.length} characters`);

      } catch (ocrErr) {
        console.error('❌ OCR pipeline failed:', ocrErr.message);
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
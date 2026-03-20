const pdfParse = require('pdf-parse');
const Anthropic = require('@anthropic-ai/sdk');

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

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
 * processHistoricalPDF
 * Strategy:
 * 1. Try pdf-parse for text layer (fast)
 * 2. If no text, send PDF to Claude API as base64 for OCR
 */
const processHistoricalPDF = async (pdfBuffer) => {
  try {
    let extractedText = '';

    // ATTEMPT 1: Text layer via pdf-parse
    console.log('📜 Step 1: Trying pdf-parse text extraction...');
    try {
      const pdfData = await pdfParse(pdfBuffer);
      extractedText = pdfData.text || '';
      console.log(`📄 pdf-parse found ${extractedText.length} characters`);
    } catch (parseErr) {
      console.warn('⚠️ pdf-parse failed:', parseErr.message);
    }

    // ATTEMPT 2: Claude API for scanned/image PDFs
    if (!extractedText || extractedText.trim().length < 50) {
      console.log('🤖 Step 2: Sending to Claude API for OCR...');
      try {
        const base64PDF = pdfBuffer.toString('base64');

        const response = await client.messages.create({
          model: 'claude-opus-4-5',
          max_tokens: 2000,
          messages: [
            {
              role: 'user',
              content: [
                {
                  type: 'document',
                  source: {
                    type: 'base64',
                    media_type: 'application/pdf',
                    data: base64PDF,
                  },
                },
                {
                  type: 'text',
                  text: `This is a historical Honduran newspaper or magazine from the 1800s-1930s. 
Please extract and transcribe ALL readable text from this document. 
Focus on: names of people, dates, locations, and type of announcement (birth, death, marriage, business, news).
Return only the extracted text, no commentary.`,
                },
              ],
            },
          ],
        });

        extractedText = response.content[0].text || '';
        console.log(`✅ Claude extracted ${extractedText.length} characters`);
      } catch (claudeErr) {
        console.error('❌ Claude API failed:', claudeErr.message);
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
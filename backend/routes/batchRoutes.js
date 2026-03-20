const express = require('express');
const router = express.Router();
const multer = require('multer');
const { processHistoricalPDF } = require('../services/pdfProcessor');

// Configure Multer to handle the PDF upload in memory (RAM)
// This is faster and safer for your laptop
const storage = multer.memoryStorage();
const upload = multer({ 
    storage: storage,
  limits: { fileSize: 20 * 1024 * 1024 }, // Limit to 20MB for large 1800s archives
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed for Batch Scanning!'), false);
    }
  }
});

/**
 * POST /api/batch/scan
 * Receives the PDF, triggers the Internal AI, and returns the results
 */
router.post('/scan', upload.single('pdf'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No PDF file uploaded.' });
    }

    console.log('--- 📜 Starting Internal AI Scan ---');
    
    // Call your new service
    const result = await processHistoricalPDF(req.file.buffer);

    if (result.success) {
      console.log('--- ✅ Scan Complete! ---');
      res.json(result.data);
    } else {
      res.status(500).json({ message: 'AI Processing failed', error: result.error });
    }

  } catch (err) {
    console.error('Batch Route Error:', err);
    res.status(500).json({ message: 'Server error during PDF processing.' });
  }
});

module.exports = router;
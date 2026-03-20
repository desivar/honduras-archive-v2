const express = require('express');
const router = express.Router();
const multer = require('multer');
const { processHistoricalPDF } = require('../services/pdfProcessor');

// ✅ Explicit CORS for this route (safety net for Render)
router.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', process.env.FRONTEND_URL || 'https://honduras-archive-1.onrender.com');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, x-auth-token');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// Configure Multer to handle the PDF upload in memory
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: { fileSize: 20 * 1024 * 1024 }, // 20MB limit
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
    console.log(`File size: ${(req.file.size / 1024 / 1024).toFixed(2)} MB`);

    const result = await processHistoricalPDF(req.file.buffer);

    if (result.success) {
      console.log('--- ✅ Scan Complete! ---');
      res.json(result.data);
    } else {
      console.error('--- ❌ Scan Failed:', result.error);
      res.status(500).json({ message: 'AI Processing failed', error: result.error });
    }

  } catch (err) {
    console.error('Batch Route Error:', err);
    res.status(500).json({ message: 'Server error during PDF processing.' });
  }
});

module.exports = router;
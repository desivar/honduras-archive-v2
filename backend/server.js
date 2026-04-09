const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('cloudinary').v2;
const jwt = require('jsonwebtoken');
const authRoutes = require('./routes/authRoutes');

const app = express();
const JWT_SECRET = process.env.JWT_SECRET || 'honduras_archive_secret';

// Middleware
app.use(express.json());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'https://honduras-archive-1.onrender.com',
  credentials: true
}));

// Auth middleware
const authMiddleware = (req, res, next) => {
  const token = req.header('x-auth-token');
  if (!token) return res.status(401).json({ message: 'No token' });
  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ message: 'Invalid token' });
  }
};

// Cloudinary config
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Multer config
const storage = new CloudinaryStorage({
  cloudinary,
  params: { folder: 'honduras_archive', allowed_formats: ['jpg', 'png', 'jpeg', 'pdf'] }
});
const upload = multer({ storage });

// MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URL);
    console.log('✅ MongoDB connected');
  } catch (err) {
    console.error('❌ MongoDB error:', err.message);
    process.exit(1);
  }
};
connectDB();

// ── Archive Schema ────────────────────────────────────────────────────────────
const archiveSchema = new mongoose.Schema({
  title: String,
  names: [String],
  summary: String,
  fullText: String,
  category: String,
  location: String,
  eventDate: String,
  publicationDate: String,
  newspaperName: String,
  countryOfOrigin: String,
  pageNumber: String,
  imageUrl: String,
  cloudinaryId: String,
  // Historic Event fields
  eventName: String,
  peopleInvolved: [String],
  // ✅ Business fields
  businessName: String,
  businessType: String,
  owner: String,
  yearFounded: String,
  createdAt: { type: Date, default: Date.now }
});
const Archive = mongoose.model('Archive', archiveSchema);

app.use('/api/auth', authRoutes);

app.get('/', (req, res) => res.send('Honduras Archive API'));

// ── GET all records ───────────────────────────────────────────────────────────
app.get('/api/archive', async (req, res) => {
  try {
    const { search, letter, category } = req.query;
    let query = {};

    if (search && category) {
      query = {
        category,
        $or: [
          { names: { $regex: search, $options: 'i' } },
          { countryOfOrigin: { $regex: search, $options: 'i' } },
          { summary: { $regex: search, $options: 'i' } },
          { eventName: { $regex: search, $options: 'i' } },
          { peopleInvolved: { $regex: search, $options: 'i' } },
          { businessName: { $regex: search, $options: 'i' } },
          { owner: { $regex: search, $options: 'i' } },
          { businessType: { $regex: search, $options: 'i' } },
        ]
      };
    } else if (search) {
      query = {
        $or: [
          { names: { $regex: search, $options: 'i' } },
          { countryOfOrigin: { $regex: search, $options: 'i' } },
          { summary: { $regex: search, $options: 'i' } },
          { eventName: { $regex: search, $options: 'i' } },
          { peopleInvolved: { $regex: search, $options: 'i' } },
          { businessName: { $regex: search, $options: 'i' } },
          { owner: { $regex: search, $options: 'i' } },
          { businessType: { $regex: search, $options: 'i' } },
        ]
      };
    } else if (letter && letter !== 'null') {
      query = { names: { $elemMatch: { $regex: '^' + letter, $options: 'i' } } };
    } else if (category) {
      query = { category };
    }

    const items = await Archive.find(query).sort({ createdAt: -1 });
    const totalCount = await Archive.countDocuments();
    const lastRecord = await Archive.findOne().sort({ createdAt: -1 });

    res.json({ items, totalCount, lastUpdate: lastRecord ? lastRecord.createdAt : null });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ── GET single record ─────────────────────────────────────────────────────────
app.get('/api/archive/:id', async (req, res) => {
  try {
    const item = await Archive.findById(req.params.id);
    if (!item) return res.status(404).json({ error: 'Record not found' });
    res.json(item);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ── POST upload ───────────────────────────────────────────────────────────────
app.post('/api/archive', upload.single('image'), async (req, res) => {
  try {
    let namesArray = req.body.names;
    if (typeof namesArray === 'string') {
      try { namesArray = JSON.parse(namesArray); }
      catch { namesArray = namesArray.split(',').map(n => n.trim()); }
    }
    let peopleArray = req.body.peopleInvolved;
    if (typeof peopleArray === 'string') {
      try { peopleArray = JSON.parse(peopleArray); }
      catch { peopleArray = peopleArray ? peopleArray.split(',').map(n => n.trim()) : []; }
    }
    const item = new Archive({
      ...req.body,
      names: namesArray || [],
      peopleInvolved: peopleArray || [],
      imageUrl: req.file ? req.file.path : null,
      cloudinaryId: req.file ? req.file.filename : null
    });
    await item.save();
    res.status(201).json(item);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ── PUT update ────────────────────────────────────────────────────────────────
app.put('/api/archive/:id', async (req, res) => {
  try {
    const {
      title, names, fullText, category, location,
      eventDate, publicationDate, newspaperName, pageNumber,
      summary, countryOfOrigin, eventName, peopleInvolved,
      businessName, businessType, owner, yearFounded
    } = req.body;

    let namesArray = names;
    if (typeof namesArray === 'string') {
      try { namesArray = JSON.parse(namesArray); }
      catch { namesArray = namesArray.split(',').map(n => n.trim()); }
    }
    let peopleArray = peopleInvolved;
    if (typeof peopleArray === 'string') {
      try { peopleArray = JSON.parse(peopleArray); }
      catch { peopleArray = peopleArray ? peopleArray.split(',').map(n => n.trim()) : []; }
    }

    const updatedItem = await Archive.findByIdAndUpdate(
      req.params.id,
      {
        title, names: namesArray, fullText, category, location,
        eventDate, publicationDate, newspaperName, pageNumber,
        summary, countryOfOrigin, eventName, peopleInvolved: peopleArray,
        businessName, businessType, owner, yearFounded
      },
      { new: true }
    );
    if (!updatedItem) return res.status(404).json({ error: 'Record not found' });
    res.json(updatedItem);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ── DELETE ────────────────────────────────────────────────────────────────────
app.delete('/api/archive/:id', async (req, res) => {
  try {
    const item = await Archive.findById(req.params.id);
    if (!item) return res.status(404).json({ error: 'Not found' });
    if (item.cloudinaryId) await cloudinary.uploader.destroy(item.cloudinaryId);
    await item.deleteOne();
    res.json({ message: 'Deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
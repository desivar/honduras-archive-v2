const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('cloudinary').v2;
const authRoutes = require('./routes/authRoutes');

const app = express();

// Middleware
app.use(express.json());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'https://honduras-archive-1.onrender.com',
  credentials: true
}));

// Cloudinary config
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Multer config
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'honduras_archive',
    allowed_formats: ['jpg', 'png', 'jpeg', 'pdf']
  }
});
const upload = multer({ storage });

// MongoDB connection
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URL);
    console.log('✅ MongoDB connected successfully');
  } catch (err) {
    console.error('❌ MongoDB connection error:', err.message);
    process.exit(1);
  }
};
connectDB();

// 🟢 UPDATED Archive Schema (Added Names and FullText)
const archiveSchema = new mongoose.Schema({
  title: String,
  names: [String],      // 👈 Allows multiple people: ["Juan", "Maria"]
  summary: String,
  fullText: String,     // 👈 For those large news articles
  category: String,
  location: String,
  eventDate: String,
  newspaperName: String, 
  countryOfOrigin: String, // 👈 Add this for international records
  pageNumber: String,
  imageUrl: String,
  cloudinaryId: String,
  createdAt: { type: Date, default: Date.now }
});
const Archive = mongoose.model('Archive', archiveSchema);

// Routes
app.use('/api/auth', authRoutes);

app.get('/', (req, res) => {
  res.send('Honduras Archive API');
});
// 👇 Add this
app.get('/api/archive/:id', async (req, res) => {
  try {
    const item = await Archive.findById(req.params.id);
    if (!item) return res.status(404).json({ error: 'Not found' });
    res.json(item);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Upload
app.post('/api/archive', upload.single('image'), async (req, res) => {
  try {
    // We handle names as an array (frontend should send it as a JSON string if using FormData)
    let namesArray = req.body.names;
    if (typeof namesArray === 'string') namesArray = JSON.parse(namesArray);

    const item = new Archive({
      ...req.body,
      names: namesArray,
      imageUrl: req.file ? req.file.path : null,
      cloudinaryId: req.file ? req.file.filename : null
    });
    
    await item.save();
    res.status(201).json(item);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 🟢 NEW: Update (Edit) Route
app.put('/api/archive/:id', async (req, res) => {
  try {
    // We add the new fields here so the 'Edit' button can save them
    const { 
      title, names, fullText, category, 
      location, eventDate, newspaperName, pageNumber, summary, countryOfOrigin 
    } = req.body; 

    let namesArray = names;
    if (typeof namesArray === 'string') namesArray = JSON.parse(namesArray);

    const updatedItem = await Archive.findByIdAndUpdate(
      req.params.id,
      { 
        title, 
        names: namesArray, 
      
        fullText, 
        category, 
        location, 
        eventDate,
        newspaperName, // 👈 This makes it work!
        pageNumber,    // 👈 This makes it work!
        summary,  // 👈 This makes it work!
        countryOfOrigin,
      },
      { new: true }
    );
    res.json(updatedItem);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
// Get all (Updated search logic)
app.get('/api/archive', async (req, res) => {
  try {
    const { search, letter } = req.query;
    let query = {};



    // Search logic
    if (search) {
query = { $or: [
{ names: { $regex: search, $options: 'i' } },
{ countryOfOrigin: { $regex: search, $options: 'i' } },
{ summary: { $regex: search, $options: 'i' } }
]};
} else if (letter && letter !== 'null') {
query = { names: { $elemMatch: { $regex: '^' + letter, $options: 'i' } } };
}

const items = await Archive.find(query).sort({ createdAt: -1 });
const totalCount = await Archive.countDocuments();
const lastRecord = await Archive.findOne().sort({ createdAt: -1 });

res.json({
items,
totalCount,
lastUpdate: lastRecord ? lastRecord.createdAt : null
});
} catch (error) {
res.status(500).json({ error: error.message });
}
});


// Delete
app.delete('/api/archive/:id', async (req, res) => {
  try {
    const item = await Archive.findById(req.params.id);
    if (!item) return res.status(404).json({ error: 'Not found' });
    
    if (item.cloudinaryId) {
      await cloudinary.uploader.destroy(item.cloudinaryId);
    }
    
    await item.deleteOne();
    res.json({ message: 'Deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Start server
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
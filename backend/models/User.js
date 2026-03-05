const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email:    { type: String, required: true, unique: true },
  password: { type: String, required: true },
  whatsapp: { type: String },

  // 🟢 Roles: admin | genealogist | visitor
  role: { type: String, default: 'visitor' },

  // 🟢 Approval status for genealogist registrations
  status: { type: String, default: 'approved' }, // 'pending' | 'approved' | 'rejected'

  // 🟢 Genealogist activity tracking
  bookmarks:     [{ type: mongoose.Schema.Types.ObjectId, ref: 'Archive' }],
  searchHistory: [{ query: String, searchedAt: { type: Date, default: Date.now } }],
  notes: [{
    recordId: { type: mongoose.Schema.Types.ObjectId, ref: 'Archive' },
    text: String,
    updatedAt: { type: Date, default: Date.now }
  }],
  sessions: [{
    loginAt:  Date,
    logoutAt: Date,
    duration: Number  // in minutes
  }],

  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', userSchema);
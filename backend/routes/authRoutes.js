const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const JWT_SECRET = process.env.JWT_SECRET || 'honduras_archive_secret';

// ── Auth middleware ───────────────────────────────────────────────────────────
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

// ── SIGNUP ────────────────────────────────────────────────────────────────────
router.post('/signup', async (req, res) => {
  try {
    const { username, email, password, whatsapp, role: requestedRole } = req.body;

    const userCount = await User.countDocuments({});
    let assignedRole, assignedStatus;

    if (userCount === 0) {
      // First user ever → admin, auto-approved
      assignedRole = 'admin';
      assignedStatus = 'approved';
    } else if (requestedRole === 'genealogist') {
      // Genealogist → needs admin approval
      assignedRole = 'genealogist';
      assignedStatus = 'pending';
    } else {
      assignedRole = 'visitor';
      assignedStatus = 'approved';
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = new User({
      username, email,
      password: hashedPassword,
      role: assignedRole,
      status: assignedStatus,
      whatsapp
    });

    await user.save();

    const message = assignedStatus === 'pending'
      ? 'Registration received! Your genealogist account is pending admin approval.'
      : `Welcome! Account created as ${assignedRole}.`;

    res.status(201).json({ success: true, message, pending: assignedStatus === 'pending' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── LOGIN ─────────────────────────────────────────────────────────────────────
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });

    if (!user) return res.status(400).json({ success: false, message: 'User not found' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ success: false, message: 'Invalid password' });

    // Block pending genealogists
    if (user.status === 'pending') {
      return res.status(403).json({ success: false, message: 'Your account is pending admin approval.' });
    }
    if (user.status === 'rejected') {
      return res.status(403).json({ success: false, message: 'Your account registration was not approved.' });
    }

    // Record session login time
    const sessionIndex = user.sessions.push({ loginAt: new Date() }) - 1;
    await user.save();

    // Issue JWT token
    const token = jwt.sign(
      { id: user._id, username: user.username, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      success: true,
      message: 'Logged in!',
      token,
      sessionIndex,
      user: {
        id: user._id,
        username: user.username,
        role: user.role,
        status: user.status
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ── LOGOUT (record session end) ───────────────────────────────────────────────
router.post('/logout', authMiddleware, async (req, res) => {
  try {
    const { sessionIndex } = req.body;
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (sessionIndex !== undefined && user.sessions[sessionIndex]) {
      const loginAt = new Date(user.sessions[sessionIndex].loginAt);
      const logoutAt = new Date();
      const duration = Math.round((logoutAt - loginAt) / 60000); // minutes
      user.sessions[sessionIndex].logoutAt = logoutAt;
      user.sessions[sessionIndex].duration = duration;
      await user.save();
    }

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── GET all users (admin) ─────────────────────────────────────────────────────
router.get('/users', async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error fetching users' });
  }
});

// ── GET pending genealogists (admin) ─────────────────────────────────────────
router.get('/users/pending', async (req, res) => {
  try {
    const pending = await User.find({ role: 'genealogist', status: 'pending' }).select('-password');
    res.json(pending);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── APPROVE / REJECT genealogist (admin) ─────────────────────────────────────
router.put('/users/approve/:id', async (req, res) => {
  try {
    const { status } = req.body; // 'approved' or 'rejected'
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    ).select('-password');
    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── CHANGE ROLE (admin) ───────────────────────────────────────────────────────
router.put('/users/role/:id', async (req, res) => {
  try {
    const { role } = req.body;
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true }
    ).select('-password');
    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error updating role' });
  }
});

// ── GET genealogist dashboard data ───────────────────────────────────────────
router.get('/dashboard', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .select('-password')
      .populate('bookmarks', 'names eventName category eventDate location imageUrl')
      .populate('notes.recordId', 'names eventName category');

    if (!user) return res.status(404).json({ message: 'User not found' });

    // Calculate total time spent
    const totalMinutes = user.sessions.reduce((sum, s) => sum + (s.duration || 0), 0);

    res.json({
      username: user.username,
      role: user.role,
      memberSince: user.createdAt,
      totalSessions: user.sessions.length,
      totalMinutesSpent: totalMinutes,
      recentSearches: user.searchHistory.slice(-20).reverse(),
      bookmarks: user.bookmarks,
      notes: user.notes,
      sessions: user.sessions.slice(-10).reverse()
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── LOG search history ────────────────────────────────────────────────────────
router.post('/activity/search', authMiddleware, async (req, res) => {
  try {
    const { query } = req.body;
    if (!query || !query.trim()) return res.json({ success: true });

    await User.findByIdAndUpdate(req.user.id, {
      $push: {
        searchHistory: {
          $each: [{ query: query.trim(), searchedAt: new Date() }],
          $slice: -100 // keep last 100 searches
        }
      }
    });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── TOGGLE bookmark ───────────────────────────────────────────────────────────
router.post('/activity/bookmark/:recordId', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const recordId = req.params.recordId;
    const isBookmarked = user.bookmarks.some(b => b.toString() === recordId);

    if (isBookmarked) {
      user.bookmarks = user.bookmarks.filter(b => b.toString() !== recordId);
    } else {
      user.bookmarks.push(recordId);
    }

    await user.save();
    res.json({ success: true, bookmarked: !isBookmarked });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── SAVE note on a record ─────────────────────────────────────────────────────
router.post('/activity/note/:recordId', authMiddleware, async (req, res) => {
  try {
    const { text } = req.body;
    const recordId = req.params.recordId;
    const user = await User.findById(req.user.id);

    const existingNote = user.notes.find(n => n.recordId.toString() === recordId);
    if (existingNote) {
      existingNote.text = text;
      existingNote.updatedAt = new Date();
    } else {
      user.notes.push({ recordId, text });
    }

    await user.save();
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── GET bookmarks for current user ───────────────────────────────────────────
router.get('/activity/bookmarks', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .populate('bookmarks', 'names eventName category eventDate location imageUrl');
    res.json(user.bookmarks || []);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
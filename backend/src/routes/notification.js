const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/auth');
const Notification = require('../models/Notification');

// send notification (teacher triggers)
router.post('/send', authMiddleware, async (req,res) => {
  try {
    const { toUserId, message } = req.body;
    const note = await Notification.create({ toUserId, message });
    // emit if socket connected
    const io = req.app.get('io');
    io.to(toUserId.toString()).emit('notification', note);
    res.json(note);
  } catch (err) { res.status(500).json({ message:'err', err }); }
});

// get user's notifications
router.get('/user/:userId', authMiddleware, async (req,res) => {
  try {
    const list = await Notification.find({ toUserId: req.params.userId }).sort({ createdAt: -1 });
    res.json(list);
  } catch (err) { res.status(500).json({ message:'err', err }); }
});

// mark seen
router.put('/mark-seen/:id', authMiddleware, async (req,res) => {
  try {
    const note = await Notification.findByIdAndUpdate(req.params.id, { seen: true }, { new: true });
    res.json(note);
  } catch (err) { res.status(500).json({ message:'err', err }); }
});

module.exports = router;

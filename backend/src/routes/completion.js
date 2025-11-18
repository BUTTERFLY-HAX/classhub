const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/auth');
const Completion = require('../models/Completion');

// mark homework as completed
router.post('/mark', authMiddleware, async (req,res) => {
  try {
    const { homeworkId } = req.body;
    const exists = await Completion.findOne({ homeworkId, studentId: req.user._id });
    if (exists) return res.json({ already: true });
    const rec = await Completion.create({ homeworkId, studentId: req.user._id });
    res.json(rec);
  } catch (err) { res.status(500).json({ message:'err', err }); }
});

// stats for a homework
router.get('/stats/:homeworkId', authMiddleware, async (req,res) => {
  try {
    const { homeworkId } = req.params;
    const count = await Completion.countDocuments({ homeworkId });
    res.json({ count });
  } catch (err) { res.status(500).json({ message:'err', err }); }
});

module.exports = router;

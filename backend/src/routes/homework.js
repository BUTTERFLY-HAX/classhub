const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { authMiddleware, teacherOnly } = require('../middleware/auth');
const Homework = require('../models/Homework');

// multer setup (store in backend/uploads)
const storage = multer.diskStorage({
  destination: (req,file,cb) => cb(null, path.join(__dirname, '..', '..', 'uploads')),
  filename: (req,file,cb) => cb(null, Date.now() + '-' + file.originalname)
});
const upload = multer({ storage });

// create homework (teacher)
router.post('/create', authMiddleware, teacherOnly, upload.array('files', 5), async (req,res) => {
  try {
    const { title, description, dueDate, classId } = req.body;
    const files = (req.files || []).map(f => `/uploads/${f.filename}`);
    const hw = await Homework.create({ title, description, dueDate, files, createdBy: req.user._id, classId });
    // emit socket event
    const io = req.app.get('io');
    io.to(classId).emit('homeworkCreated', { homework: hw });
    res.json(hw);
  } catch (err) { res.status(500).json({ message:'err', err }); }
});

// get class homeworks
router.get('/class/:classId', authMiddleware, async (req,res) => {
  try {
    const { classId } = req.params;
    const homeworks = await Homework.find({ classId }).sort({ createdAt: -1 });
    res.json(homeworks);
  } catch (err) { res.status(500).json({ message: 'err', err }); }
});

// get single homework
router.get('/:id', authMiddleware, async (req,res) => {
  try {
    const hw = await Homework.findById(req.params.id);
    res.json(hw);
  } catch (err) { res.status(500).json({ message:'err', err }); }
});

// edit (teacher)
router.put('/:id', authMiddleware, teacherOnly, upload.array('files', 5), async (req,res) => {
  try {
    const update = req.body;
    if (req.files && req.files.length) update.files = (req.files || []).map(f => `/uploads/${f.filename}`);
    const hw = await Homework.findByIdAndUpdate(req.params.id, update, { new: true });
    const io = req.app.get('io');
    io.to(hw.classId).emit('homeworkUpdated', { homework: hw });
    res.json(hw);
  } catch (err) { res.status(500).json({ message:'err', err }); }
});

// delete (teacher)
router.delete('/:id', authMiddleware, teacherOnly, async (req,res) => {
  try {
    const hw = await Homework.findByIdAndDelete(req.params.id);
    const io = req.app.get('io');
    io.to(hw.classId).emit('homeworkDeleted', { id: hw._id });
    res.json({ success: true });
  } catch (err) { res.status(500).json({ message:'err', err }); }
});

module.exports = router;

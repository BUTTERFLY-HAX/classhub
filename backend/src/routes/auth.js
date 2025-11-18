const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/User');
const OtpSession = require('../models/OtpSession');
const { sendOtpEmail } = require('../utils/mailer');

// register
router.post('/register', async (req,res) => {
  const { name, email, password, role, classId } = req.body;
  try {
    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ message: 'Email exists' });
    const hash = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, password: hash, role, classId });
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
    res.json({ token, user: { id: user._id, name: user.name, role: user.role, classId: user.classId }});
  } catch (err) { res.status(500).json({ message: 'err', err }); }
});

// login
router.post('/login', async (req,res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'Invalid creds' });
    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return res.status(400).json({ message: 'Invalid creds' });
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
    res.json({ token, user: { id: user._id, name: user.name, role: user.role, classId: user.classId }});
  } catch (err) { res.status(500).json({ message: 'err', err }); }
});

// OTP request
router.post('/request-otp', async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ message: 'Email is required' });

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'User not found' });

    const code = crypto.randomInt(100000, 999999).toString();
    const sessionId = crypto.randomUUID();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    await OtpSession.findOneAndUpdate(
      { email },
      { code, sessionId, expiresAt },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    await sendOtpEmail(email, code);

    res.json({ sessionId, expiresIn: 300 });
  } catch (err) {
    console.error('OTP request error:', err.message);
    if (err.message.includes('SMTP')) {
      return res
        .status(500)
        .json({ message: 'Email service not configured. Please try later.' });
    }
    res.status(500).json({ message: 'Unable to send OTP' });
  }
});

// OTP verify
router.post('/verify-otp', async (req, res) => {
  const { email, otp, sessionId } = req.body;
  if (!email || !otp || !sessionId)
    return res
      .status(400)
      .json({ message: 'Email, otp, and sessionId are required' });

  try {
    const session = await OtpSession.findOne({ sessionId });
    if (!session)
      return res.status(400).json({ message: 'Invalid or expired session' });
    if (session.email !== email)
      return res.status(400).json({ message: 'Invalid session' });
    if (session.expiresAt < new Date())
      return res.status(400).json({ message: 'OTP expired' });
    if (session.code !== otp)
      return res.status(400).json({ message: 'Invalid OTP' });

    await OtpSession.deleteOne({ _id: session._id });

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'User not found' });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        role: user.role,
        classId: user.classId,
      },
    });
  } catch (err) {
    console.error('OTP verify error:', err.message);
    res.status(500).json({ message: 'Unable to verify OTP' });
  }
});

module.exports = router;


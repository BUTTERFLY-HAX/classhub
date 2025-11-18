const mongoose = require('mongoose');

const completionSchema = new mongoose.Schema({
  homeworkId: { type: mongoose.Schema.Types.ObjectId, ref: 'Homework' },
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  completedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Completion', completionSchema);

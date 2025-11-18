const mongoose = require('mongoose');

const homeworkSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  dueDate: Date,
  files: [String],
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  classId: String,
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Homework', homeworkSchema);

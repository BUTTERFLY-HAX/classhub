require('dotenv').config();
const express = require('express');
const http = require('http');
const cors = require('cors');
const mongoose = require('mongoose');
const { Server } = require('socket.io');
const authRoutes = require('./routes/auth');
const homeworkRoutes = require('./routes/homework');
const completionRoutes = require('./routes/completion');
const notificationRoutes = require('./routes/notification');
const path = require('path');

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: { origin: process.env.CLIENT_URL || '*' }
});

// simple socket.io rooms by classId
io.on('connection', (socket) => {
  console.log('Socket connected', socket.id);
  socket.on('joinClass', (classId) => {
    socket.join(classId);
  });
  socket.on('leaveClass', (classId) => {
    socket.leave(classId);
  });
});

app.set('io', io);

app.use(cors({ origin: process.env.CLIENT_URL || '*' }));
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

// routes
app.use('/api/auth', authRoutes);
app.use('/api/homework', homeworkRoutes);
app.use('/api/completion', completionRoutes);
app.use('/api/notification', notificationRoutes);

const PORT = process.env.PORT || 5000;

mongoose.connect(process.env.MONGO_URI, { })
  .then(() => {
    console.log('Mongo connected');
    server.listen(PORT, () => console.log('Server running on', PORT));
  })
  .catch(err => console.error(err));

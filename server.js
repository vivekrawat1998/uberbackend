require('dotenv').config();
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const connectDB = require('./db/db');
const captainRoutes = require('./routes/captain.routes');
const userRoutes = require('./routes/user.routes');
const rideRoutes = require('./routes/ride.routes');
const mapRoutes = require('./routes/map.routes');
const { sendMessageToSocketId } = require('./socket');
const cookieParser = require('cookie-parser'); // Add this line

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: '*',
  },
});

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser()); // Add this line

// Connect to database
connectDB();

// Routes
app.use('/captains', captainRoutes);
app.use('/users', userRoutes);
app.use('/rides', rideRoutes);
app.use('/maps', mapRoutes);

// WebSocket connection
io.on('connection', (socket) => {
  console.log('New client connected', socket.id);

  socket.on('disconnect', () => {
    console.log('Client disconnected', socket.id);
  });

  // Add more WebSocket event handlers here
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = { io, sendMessageToSocketId };

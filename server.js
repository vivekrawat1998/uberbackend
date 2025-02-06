require('dotenv').config();
const app = require('./app');
const http = require('http');
const socketio = require('socket.io');
const connectDB = require('./db/db');

const PORT = process.env.PORT || 4000;

// Log environment variables to verify
console.log('MONGODB_URI:', process.env.MONGODB_URI);

const server = http.createServer(app);
const io = socketio(server);

connectDB();

io.on('connection', (socket) => {
  console.log('New WebSocket connection');
});

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

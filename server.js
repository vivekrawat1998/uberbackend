require('dotenv').config();
const app = require('./app');
const http = require('http');
const socketio = require('socket.io');
const connectDB = require('./db/db');

const PORT = process.env.PORT || 4000;

const server = http.createServer(app);
const io = socketio(server);

connectDB();

io.on('connection', (socket) => {
  console.log('New WebSocket connection');
  // ...existing socket.io code...
});

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

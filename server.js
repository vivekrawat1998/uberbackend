require('dotenv').config();
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const connectDB = require('./db/db');
const captainRoutes = require('./routes/captain.routes');
const userRoutes = require('./routes/user.routes');
const rideRoutes = require('./routes/ride.routes');
const mapRoutes = require('./routes/maps.routes'); 
const { sendMessageToSocketId } = require('./socket');
const cookieParser = require('cookie-parser');
const cors = require('cors');

const app = express();
const server = http.createServer(app);

const corsOptions = {
  origin: ['https://uberclonefrontend.vercel.app', 'http://localhost:5173'],
  methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  credentials: true
};

app.use(cors(corsOptions));

// Enable pre-flight requests for all routes
app.options('*', cors(corsOptions));

const io = socketIo(server, {
  cors: {
    origin: ['https://uberclonefrontend.vercel.app', 'http://localhost:5173'],
    methods: ['GET', 'POST'],
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization']
  },
  transports: ['polling', 'websocket'],
  path: '/socket.io/',
  pingTimeout: 60000,
  pingInterval: 25000,
  cookie: false
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

connectDB();

app.use('/captains', captainRoutes);
app.use('/users', userRoutes);
app.use('/rides', rideRoutes);
app.use('/maps', mapRoutes);

io.on('connection', (socket) => {
  console.log('New client connected', socket.id);

  socket.conn.on('upgrade', (transport) => {
    console.log('Transport upgraded to:', transport.name);
  });

  socket.on('disconnect', (reason) => {
    console.log('Client disconnected', socket.id, 'reason:', reason);
  });

  socket.on('error', (error) => {
    console.error('Socket error:', error);
  });

  socket.on('connect_error', (error) => {
    console.error('Connection error:', error);
    // Try to reconnect with polling
    if (socket.conn.transport.name === 'websocket') {
      socket.conn.transport.name = 'polling';
    }
  });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = { io, sendMessageToSocketId };

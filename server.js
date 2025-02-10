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
  origin: [
    'https://uberclonefrontend.vercel.app',
    'https://uberbackend-production.up.railway.app'
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'Origin', 'X-Requested-With'],
  exposedHeaders: ['Access-Control-Allow-Origin', 'Access-Control-Allow-Credentials'],
  credentials: true,
  optionsSuccessStatus: 200,
  preflightContinue: false
};

// Apply CORS middleware before any routes
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', req.headers.origin);
  res.header('Access-Control-Allow-Credentials', true);
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin,X-Requested-With,Content-Type,Accept,Authorization');
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  next();
});

app.use(cors(corsOptions));

// Handle preflight requests
app.options('*', (req, res) => {
  res.status(200).end();
});

const io = socketIo(server, {
  cors: corsOptions
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

  socket.on('disconnect', () => {
    console.log('Client disconnected', socket.id);
  });

  socket.on('error', (err) => {
    console.error('Socket encountered error: ', err.message, 'Closing socket');
    socket.close();
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

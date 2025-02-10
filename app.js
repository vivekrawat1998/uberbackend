const dotenv = require('dotenv');
dotenv.config();
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const app = express();
const http = require('http').createServer(app);

// Single CORS configuration
app.use(cors({
  origin: ['https://uberclonefrontend.vercel.app', 'http://localhost:5173'],
  methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  credentials: true
}));

// Enable pre-flight requests for all routes
app.options('*', cors());

// Socket.IO setup with CORS
const io = require('socket.io')(http, {
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

// Add error handling for Socket.IO
io.on('connect_error', (error) => {
  console.error('Socket.IO connection error:', error);
});

const userRouter = require("./routes/user.routes");
const captainRouter = require('./routes/captain.routes');
const mapRouter = require('./routes/maps.routes');
const riderouter = require("./routes/ride.routes");
const connectDB = require('./db/db');

app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));

connectDB();

app.use('/users', userRouter);
app.use('/captains', captainRouter);
app.use('/maps', mapRouter);
app.use('/ride', riderouter);

app.get('/health', (req, res) => {
  res.status(200).send('Server is healthy');
});

app.get('/', (req, res) => {
  res.send('Hello World');
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

const PORT = process.env.PORT || 5000;
http.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = { app, io };
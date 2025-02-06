const dotenv = require('dotenv');
dotenv.config();
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const app = express();
const http = require('http').createServer(app);

// CORS Configuration
const allowedOrigins = [
  'https://uberclonefrontend.vercel.app',
  'http://localhost:5173'
];

app.use(cors({
  origin: function(origin, callback) {
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Socket.IO setup with CORS
const io = require('socket.io')(http, {
  cors: {
    origin: allowedOrigins,
    methods: ['GET', 'POST'],
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization']
  },
  transports: ['websocket', 'polling'],
  allowEIO3: true
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

// Pre-flight requests
app.options('*', cors());

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

const PORT = process.env.PORT || 5000;
http.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = { app, io };
const dotenv = require('dotenv');
dotenv.config();
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const app = express();
const http = require('http').createServer(app);

// CORS Configuration
const corsOptions = {
  origin: ['https://uberclonefrontend.vercel.app', 'http://localhost:5173'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'Origin', 'X-Requested-With'],
  exposedHeaders: ['Access-Control-Allow-Origin'],
  credentials: true,
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));

// Enable pre-flight requests for all routes
app.options('*', cors(corsOptions));

// Socket.IO setup with CORS
const io = require('socket.io')(http, {
  cors: corsOptions,
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

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

const PORT = process.env.PORT || 5000;
http.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = { app, io };
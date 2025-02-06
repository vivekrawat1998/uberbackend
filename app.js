const dotenv = require('dotenv');
dotenv.config();
const express = require('express');
const app = express();
const cookieparser = require('cookie-parser');
const userRouter = require("./routes/user.routes");
const captainRouter = require('./routes/captain.routes');
const mapRouter = require('./routes/maps.routes');
const riderouter = require("./routes/ride.routes");
const cors = require('cors');
const connectDB = require('./db/db');

app.use(cors({
  origin: 'http://localhost:5173', // Specify the allowed origin
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}));
app.use(cookieparser());
app.use(express.json());
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

module.exports = app;
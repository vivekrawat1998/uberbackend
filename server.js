require("dotenv").config();
const express = require("express");
const http = require("http");
const connectDB = require("./db/db");
const captainRoutes = require("./routes/captain.routes");
const userRoutes = require("./routes/user.routes");
const rideRoutes = require("./routes/ride.routes");
const mapRoutes = require("./routes/maps.routes");
const { initializeSocket } = require("./socket");
const cookieParser = require("cookie-parser");
const cors = require("cors");

const app = express();
const server = http.createServer(app);
const io = initializeSocket(server);

const corsOptions = {
  origin: ["https://uberclonefrontend.vercel.app", "http://localhost:5173"],
  methods: ["GET", "HEAD", "PUT", "PATCH", "POST", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  credentials: true,
};

app.use(cors(corsOptions));

// Enable pre-flight requests for all routes
app.options("*", cors(corsOptions));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

connectDB();

app.use("/captains", captainRoutes);
app.use("/users", userRoutes);
app.use("/rides", rideRoutes);
app.use("/maps", mapRoutes);

app.get("/health", (req, res) => {
  res.status(200).send("Server is healthy");
});

app.get("/", (req, res) => {
  res.send("Hello World");
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Something broke!");
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = { app, io };

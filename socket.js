const socketIo = require("socket.io");
const userModel = require("./models/user.model");
const captainModel = require("./models/captain.model");
const { io } = require("./server");

let io;

function initializeSocket(server) {
  io = socketIo(server, {
    cors: {
      origin: ["https://uberclonefrontend.vercel.app", "http://localhost:5173"],
      methods: ["GET", "POST"],
      credentials: true,
      allowedHeaders: ["Content-Type", "Authorization"],
    },
    transports: ["polling", "websocket"],
    path: "/socket.io/",
    pingTimeout: 60000,
    pingInterval: 25000,
    cookie: false,
  });

  io.on("connect_error", (error) => {
    console.error("Socket.IO connection error:", error);
  });

  io.on("connection", (socket) => {
    console.log(`Client connected: ${socket.id}`);

    socket.on("join", async (data) => {
      const { userId, userType } = data;

      if (userType === "user") {
        await userModel.findByIdAndUpdate(userId, { socketId: socket.id });
      } else if (userType === "captain") {
        await captainModel.findByIdAndUpdate(userId, { socketId: socket.id });
      }
    });

    socket.on("update-location-captain", async (data) => {
      const { userId, location } = data;

      if (!location || !location.ltd || !location.lng) {
        return socket.emit("error", { message: "Invalid location data" });
      }

      await captainModel.findByIdAndUpdate(userId, {
        location: {
          ltd: location.ltd,
          lng: location.lng,
        },
      });
    });

    socket.on("disconnect", () => {
      console.log(`Client disconnected: ${socket.id}`);
    });
  });
}

const sendMessageToSocketId = (socketId, message) => {
  io.to(socketId).emit(message.event, message.data);
};

module.exports = { initializeSocket, sendMessageToSocketId };

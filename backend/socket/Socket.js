const { Server } = require("socket.io");
const http = require("http");

const express = require("express");
const app = express();

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});

// A map to store connected users and their sockets
const connectedUsers = new Map();

io.on("connection", (socket) => {
  console.log("New Client Connected");

  // Handle user identification and store their socket
  socket.on("identify", (userId) => {
    connectedUsers.set(userId, socket);
    console.log(`User ${userId} connected`);
  });

  socket.on("disconnect", () => {
    console.log("Client disconnected");
    // Remove user from the map
    for (const [userId, userSocket] of connectedUsers.entries()) {
      if (userSocket === socket) {
        connectedUsers.delete(userId);
        break;
      }
    }
  });
});

module.exports = { app, io, server, connectedUsers };

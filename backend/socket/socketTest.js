const io = require("socket.io-client");
const socket = io("http://localhost:3000");

// Simulate user connection and identification
socket.on("connect", () => {
  console.log("Connected to server");
  socket.emit("identify", "12");
});

// Listen for new bid notifications
socket.on("newBid", (data) => {
  console.log("New bid notification:", data);
});

// Listen for outbid notifications
socket.on("outbid", (data) => {
  console.log("Outbid notification:", data);
});

// Simulate a bid placed by emitting PlacedBid event
socket.emit("PlacedBid", {
  itemOwnerId: "123",
  itemId: "8",
  bid_amount: 500,
  user_id: "12",
});

socket.on("disconnect", () => {
  console.log("Disconnected from server");
});

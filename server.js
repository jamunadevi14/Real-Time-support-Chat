const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);

// Configure Socket.io with CORS permissions
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

// MongoDB Connection String
const MONGO_URI = "mongodb://localhost:27017/chatdb"; 

mongoose.connect(MONGO_URI)
  .then(() => console.log("MongoDB Connected Successfully"))
  .catch((err) => console.error("MongoDB Connection Error: ", err));

// Define Message Schema and Model
const MessageSchema = new mongoose.Schema({
  sender: String,
  text: String,
  timestamp: { type: Date, default: Date.now }
});
const Message = mongoose.model("Message", MessageSchema);

// REST API Routes
app.get("/api/messages", async (req, res) => {
  try {
    const messages = await Message.find().sort({ timestamp: 1 });
    res.json(messages);
  } catch (error) {
    res.status(500).json({ error: "Failed to load messages" });
  }
});

// Real-Time WebSockets Event Handling
io.on("connection", (socket) => {
  console.log(`User connected: ${socket.id}`);

  // Handle incoming message from a client
  socket.on("send_message", async (data) => {
    console.log("Message received on server:", data);
    
    // Broadcast the message to all other connected users instantly
    socket.broadcast.emit("receive_message", data);

    // Save message to database asynchronously
    try {
      const newMessage = new Message({ sender: data.sender, text: data.text });
      await newMessage.save();
    } catch (err) {
      console.error("Error saving message to database:", err);
    }
  });

  socket.on("disconnect", () => {
    console.log(`User disconnected: ${socket.id}`);
  });
});

// Start Server
const PORT = 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
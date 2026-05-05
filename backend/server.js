const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");
require("dotenv").config();

const app = express();
const server = http.createServer(app);

const allowedOrigins = [
  "http://localhost:3000",
  process.env.FRONTEND_URL,
].filter(Boolean);

const io = new Server(server, {
  cors: { origin: allowedOrigins }
});

app.use(cors({ origin: allowedOrigins }));
app.use(express.json({ limit: "10mb" }));

app.use("/api/auth", require("./routes/auth"));
app.use("/api/workout", require("./routes/workout"));
app.use("/api/streak", require("./routes/streak"));
app.use("/api/chat", require("./routes/chat"));
app.use("/api/nutrition", require("./routes/nutrition"));
app.use("/api/reminder", require("./routes/reminder"));

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.on("workout_started", (data) => {
    io.emit("friend_working_out", data);
  });

  socket.on("disconnect", () => {
    console.log("User disconnected");
  });
});

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected!"))
  .catch((err) => console.log("DB Error:", err));

server.listen(process.env.PORT, () => {
  console.log(`Tejas server running on port ${process.env.PORT}`);
});
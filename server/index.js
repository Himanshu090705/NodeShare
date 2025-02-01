const express = require("express");
const { Server } = require("socket.io");
const cors = require("cors");
const http = require("http");
const { v4: uuidv4 } = require("uuid");

const app = express();
const port = 3001
app.use(cors());
app.use(express.json());

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

const files = {};
const activeUsers = {};

io.on("connection", (socket) => {
  console.log(`User connected: ${socket.id}`);
  activeUsers[socket.id] = true;

  socket.on("uploadFile", ({ fileName, fileData }) => {
    const fileId = uuidv4();
    files[fileId] = { fileName, fileData, uploaderId: socket.id }; // Store uploader's socket ID
    socket.emit("fileUploaded", { fileId });
  });

  socket.on("downloadFile", ({ fileId }) => {
    if (files[fileId]) {
      const { uploaderId } = files[fileId];

      if (activeUsers[uploaderId]) {
        socket.emit("receiveFile", files[fileId]);
      } else {
        socket.emit("fileNotAvailable", "Uploader is not connected.");
      }
    } else {
      socket.emit("fileNotFound", "File not found.");
    }
  });

  socket.on("disconnect", () => {
    console.log(`User disconnected: ${socket.id}`);
    delete activeUsers[socket.id];
  });
});

app.get("/file/:id", (req, res) => {
  const { id } = req.params;
  if (files[id]) {
    const { uploaderId } = files[id];

    if (activeUsers[uploaderId]) {
      res.json({ fileName: files[id].fileName, fileData: files[id].fileData });
    } else {
      res.status(403).json({ error: "Uploader is not connected" });
    }
  } else {
    res.status(404).json({ error: "File not found" });
  }
});

server.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});

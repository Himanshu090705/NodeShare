import express from "express";
import { Server } from "socket.io";
import cors from "cors";
import http from "http";
import cookieParser from "cookie-parser";
import { v4 as uuidv4 } from "uuid";
import path from "path";
import { NODE_ENV } from "../config.js";
import { User } from "./model/user.js";
import dotenv from 'dotenv'
import { supabase } from "./db/connect.js";


dotenv.config({ path: '../.env' });

const app = express();
const port = 3001;
app.use(cors());
app.use(express.json());
app.use(cookieParser());

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
  maxHttpBufferSize: 500000000, // 500Mb
});

const files = {};
const activeUsers = {};

io.on("connection", (socket) => {
  console.log(`User connected: ${socket.id}`);
  activeUsers[socket.id] = true;

  socket.on("uploadFiles", ({ files: fileDataArray }) => {
    const fileId = uuidv4();
    files[fileId] = { fileDataArray, uploaderId: socket.id };
    socket.emit("filesUploaded", { fileId });
  });

  socket.on("downloadFile", ({ fileId }) => {
    if (files[fileId]) {
      const { uploaderId } = files[fileId];

      if (activeUsers[uploaderId]) {
        socket.emit("receiveFiles", files[fileId]);
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

    for (const fileId in files) {
      if (files[fileId].uploaderId === socket.id) {
        io.emit("uploaderDisconnected", { fileId });
      }
    }
  });
});

const __dirname1 = path.resolve();
if (NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname1, "/client/dist")));

  app.get("/api/file/:id", (req, res) => {
    const { id } = req.params;
    if (files[id]) {
      const { uploaderId } = files[id];
      if (activeUsers[uploaderId]) {
        res.json({ files: files[id].fileDataArray });
      } else {
        res.status(403).json({ error: "Uploader is not connected" });
      }
    } else {
      res.status(404).json({ error: "File not found" });
    }
  });

  app.get("*", (req, res) => {
    res.sendFile(path.resolve(__dirname1, "client", "dist", "index.html"));
  });
}

server.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});

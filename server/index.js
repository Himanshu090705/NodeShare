import express from "express";
import { Server } from "socket.io";
import cors from "cors";
import http from "http";
import cookieParser from "cookie-parser";
import { v4 as uuidv4 } from "uuid";
import path from "path";
import { NODE_ENV } from "../config.js";
import { User } from "./model/user.js";

import "./db/connect.js";

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
  maxHttpBufferSize: 1e8, // 100Mb
});

const files = {};
const activeUsers = {};

io.on("connection", (socket) => {
  console.log(`User connected: ${socket.id}`);
  activeUsers[socket.id] = true;

  socket.on("uploadFiles", ({ files: fileDataArray }) => {
    const fileId = uuidv4();
    files[fileId] = { fileDataArray, uploaderId: socket.id }; // Store uploader's socket ID
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

  app.post("/api/login", async (req, res) => {
    const { username, password } = req.body;
    try {
      const user = await User.findOne({
        username: username,
        password: password,
      });
      if (user) {
        res.cookie("username", username, { httpOnly: true , path: "/"});
        res.cookie("password", password, { httpOnly: true , path: "/" });
        res.status(200).send({ messaage: "User found" });
      } else {
        res.status(404).json({ message: "Not found" });
      }
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });
  app.post("/api/signup", async (req, res) => {
    const { fullName, username, email, password } = req.body;
    try {
      const newUser = new User({ fullName, username, email, password });
      const validateEmail = await User.findOne({ email: email });
      const validateUserName = await User.findOne({ username: username });
      if (
        validateEmail ||
        validateUserName ||
        (validateEmail && validateUserName)
      ) {
        res.status(409).json({ message: "Error: Entity already exists" });
      } else {
        const userSave = await newUser.save();
        if (userSave) {
          res.cookie('username', username, { httpOnly: true , path: "/" });
          res.cookie('password', password, { httpOnly: true , path: "/" });
          res.status(201).json({ message: "New User registered" });
        } else {
          res.status(503).json({ message: "Not available" });
        }
      }
    } catch (error) {
      res.status(500).json({ message: "Server error" });
      console.log(error);
    }
  });

  // Fix: Redirect all unknown routes to React's index.html
  app.get("*", (req, res) => {
    res.sendFile(path.resolve(__dirname1, "client", "dist", "index.html"));
  });
}

server.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});

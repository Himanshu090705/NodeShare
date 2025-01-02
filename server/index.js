const express = require("express");
const { Server } = require("socket.io");
const cors = require("cors");
const http = require("http");

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
  },
});

io.on("connection", (socket) => {
  console.log("User is connected at socket: ", socket.id);
  socket.on("send", (data) => {
    const files = data.map((file) => ({
      name: file.name,
      size: file.size,
      type: file.type,
      content: file.content.toString("base64"),
    }));
    console.log(files);
    io.emit("receive", data);
  });

  socket.on("disconnect", (data) => {
    console.log(`Websocket: ${socket.id} is disconnected`);
  });
});

app.get("/", (req, res) => {
  res.send("Hello world");
});
server.listen(3001, () => {
  console.log(`Server running at http://localhost:3001`);
});

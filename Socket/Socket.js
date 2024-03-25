const { Server } = require("socket.io");
const express = require('express');
const http = require('http');
const cors = require('cors');
const { log } = require("console");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "http://localhost:3001",
        methods: ["GET", "POST", "PUT", "PATCH"],
        credentials: true
    }
});



let activeUsers = [];

io.on("connection", (socket) => {
    
    socket.on("new-user-add",(newUserId) => {
      console.log(newUserId,"ddddddddddddddddddddddddddddd")
    if (!activeUsers.some((user) => user.userId === newUserId)) {
      activeUsers.push({userId: newUserId,socketId: socket.id});
    }
    io.emit("get-users",activeUsers);
  });
    



  socket.on("disconnect", () => {
    activeUsers = activeUsers.filter((user) => user.socketId !== socket.id);
    io.emit("get-users", activeUsers);
  });
  

  socket.on("send-message", (data) => {
    const { recieverId } = data;
    const user = activeUsers.find((user) => user.userId === recieverId);
    if (user) {
      io.to(user.socketId).emit("receive-message", data);
    }
  });
 
});

module.exports ={
    app,
    server,
}
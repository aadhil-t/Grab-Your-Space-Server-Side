const { Server } = require("socket.io");
const express = require('express');
const http = require('http');
const cors = require('cors');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  pingTimeout:600000,
    cors: {
        origin: "http://localhost:3001",
        methods: ["GET", "POST", "PUT", "PATCH"],
        credentials: true
    }
});



let activeUsers = [];
io.on("connection", (socket) => {
    socket.on("new-user-add",(newUserId) => {
    if (!activeUsers.some((user) => user.userId === newUserId)) {
      activeUsers.push({userId: newUserId,socketId: socket.id});
    }
    io.emit("get-users",activeUsers);
  });
    

  socket.on("send-message", (data) => {
      const { receiverId } = data;

      const user = activeUsers.find((user) => user.userId === receiverId);
      if (user) {
         io.to(user.socketId).emit("receive-message",data);
  }
});


  socket.on("disconnect", () => {
    activeUsers = activeUsers.filter((user) => user.socketId !== socket.id);
    io.emit("get-users", activeUsers);
  });
  


 
});

module.exports ={
    app,
    server,
}
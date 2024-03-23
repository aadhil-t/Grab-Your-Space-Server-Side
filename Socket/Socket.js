const { Server } = require("socket.io");
const express = require('express');
const http = require('http');
const cors = require('cors');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "http://localhost:5173",
        methods: ["GET", "POST", "PUT", "PATCH"],
        credentials: true
    }
});



let activeUsers = []

io.on('connection', (socket) => {
    socket.on('new-user-add', (newUserId) => {
        if (!activeUsers.some((user) => user.userId === newUserId)) {
            activeUsers.push({
                userId: newUserId,
                socketId: socket.id
            })
        }
        // console.log("Connected Users", activeUsers);
        io.emit('get-users', activeUsers)
        console.log(activeUsers,"Socket io")
    })

    socket.on("send-message", (data) => {
        const { receiverId } = data;
        // console.log(receiverId, '--------------ddddgdsnetertbfgdb----------------');
        const user = activeUsers.find((user) => user.userId === receiverId);
        // console.log(user, "equal?");
        if (user) {
            io.to(user.socketId).emit("receive-message", data);
        } else {
            // console.log("User not found for receiverId:", receiverId);
        }
    });

    socket.on('typing',(room)=>socket.in(room).emit('typing'))
    socket.on('stop typing',(room)=>socket.in(room).emit('stop typing'))

    socket.on("disconnect", () => {
        activeUsers = activeUsers.filter((user) => user.socketId !== socket.id)
        // console.log("User Disconnected", activeUsers);

        io.emit('get-users', activeUsers)
    })
});

module.exports ={
    app,
    server,
}
const express = require('express');
const messageRoute = express(); 
const MessageController = require("../Controller/MessageController");
const {userAuth} = require("../Middlewares/Auth.js")

messageRoute.post("/messagesend/:chatid",userAuth,MessageController.AddMessage);
messageRoute.get("/getmessages/:chatId",MessageController.GetMessages);

module.exports = messageRoute
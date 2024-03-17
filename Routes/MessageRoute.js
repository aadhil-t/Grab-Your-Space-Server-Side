const express = require('express');
const messageRoute = express(); 
const MessageController = require("../Controller/MessageController");


messageRoute.post("/",MessageController.AddMessage);
messageRoute.get("/:chatId",MessageController.GetMessages);

module.exports = messageRoute
const express = require("express");
const chatRoute = express();
const ChatController = require("../Controller/ChatController");
const { userAuth } = require("../Middlewares/Auth.js");
const { adminAuth } = require("../Middlewares/Auth.js");
////////////////// User Chat Route /////////////////
chatRoute.get("/:adminId/:userId", ChatController.CreateChat);
chatRoute.get("/:AdminId", ChatController.UserChats);
chatRoute.get("/find/:firstId/:secondId", ChatController.FindChat);

////////////////// Admin Chat Route /////////////////

module.exports = chatRoute;

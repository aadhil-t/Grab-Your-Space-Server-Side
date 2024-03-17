const express = require("express");
const  chatRoute = express();
const ChatController = require("../Controller/ChatController")
const {userAuth} = require("../Middlewares/Auth.js")

chatRoute.get("/:adminId/:userId", ChatController.CreateChat);

// chatRoute.get("/:adminId",UserAuth.userAuth,ChatController.UserChats);
chatRoute.get("/:AdminId",ChatController.UserChats);
chatRoute.get("/find/:firstId/:secondId",ChatController.FindChat);
module.exports = chatRoute
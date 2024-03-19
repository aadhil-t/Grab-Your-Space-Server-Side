const express = require('express');
const hubadminRoute = express();
const HubAdminController = require('../Controller/HubAdminController');
const Auth = require("../Middlewares/Auth")
const multer = require("../Middlewares/Multer")
const ChatController = require('../Controller/ChatController')
const MessageController = require('../Controller/MessageController')
hubadminRoute.post('/signup',HubAdminController.HubAdminSingup)
hubadminRoute.get("/verifyemail/:id/:token",HubAdminController.VerifyEmail)
hubadminRoute.post("/login",HubAdminController.HubAdminLogin)
hubadminRoute.get("/profile",Auth.hubadminAuth,HubAdminController.HubProfile)
hubadminRoute.post('/editprofile',Auth.hubadminAuth,HubAdminController.EditHubProfile)
hubadminRoute.post(
    '/createhub',
    multer.uploadOption.fields([{ name: 'images', maxCount: 4 }, { name: 'certificate', maxCount: 1 }]),
    Auth.hubadminAuth,
    HubAdminController.HubCreate
  );
hubadminRoute.get('/hubdata',Auth.hubadminAuth,HubAdminController.HubDataList)
hubadminRoute.get('/bookedhistory',Auth.hubadminAuth,HubAdminController.BookedHistory)
hubadminRoute.post('/addoffer',Auth.hubadminAuth,HubAdminController.AddOffer)
hubadminRoute.get('/offerlist',Auth.hubadminAuth,HubAdminController.OfferList)
hubadminRoute.post('/offerdelete',Auth.hubadminAuth,HubAdminController.OfferDelete)
hubadminRoute.get('/dashboardchart',Auth.hubadminAuth,HubAdminController.DashboardChart)

///////////////////// Aadmin Chat //////////////////// 
hubadminRoute.get("/adminchat/:AdminId", ChatController.AdminChat);
hubadminRoute.get("/getadminmessage/:AdminChatId", MessageController.GetAdminMessages);
hubadminRoute.post("/adminmessagesend/:chatId",Auth.hubadminAuth,MessageController.AddAdminMessage);

module.exports = hubadminRoute
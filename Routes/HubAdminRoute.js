const express = require('express');
const hubadminRoute = express();
const HubAdminController = require('../Controller/HubAdminController');
const Auth = require("../Middlewares/Auth")
hubadminRoute.post('/signup',HubAdminController.HubAdminSingup)
hubadminRoute.get("/verifyemail/:id/:token",HubAdminController.VerifyEmail)
hubadminRoute.post("/login",HubAdminController.HubAdminLogin)
hubadminRoute.get("/profile",Auth.hubadminAuth,HubAdminController.HubProfile)
hubadminRoute.post('/editprofile',Auth.hubadminAuth,HubAdminController.EditHubProfile)
hubadminRoute.post('/createhub',Auth.hubadminAuth,HubAdminController.HubCreate)
hubadminRoute.get('/hubdata',Auth.hubadminAuth,HubAdminController.HubDataList)
module.exports = hubadminRoute
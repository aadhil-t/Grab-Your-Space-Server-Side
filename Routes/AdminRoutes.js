const express = require('express');
const adminRoute = express()
const adminController = require("../Controller/AdminController");
const Auth = require("../Middlewares/Auth")

adminRoute.post('/login',adminController.AdminLogin);
adminRoute.get('/users',Auth.adminAuth,adminController.ViewUserList);
adminRoute.put('/userblock/:id',adminController.UserBlock);
adminRoute.get('/hubadminlist',adminController.HubAdminListing);
adminRoute.get('/hubapprovaldetails',adminController.HubApproval);
adminRoute.post('/hubverifychange',Auth.adminAuth,adminController.HubAdminVerify);
module.exports = adminRoute
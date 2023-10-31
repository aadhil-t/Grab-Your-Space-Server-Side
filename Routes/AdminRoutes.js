const express = require('express');
const adminRoute = express()
const adminController = require("../Controller/AdminController");


adminRoute.post('/login',adminController.AdminLogin);
adminRoute.get('/users',adminController.ViewUserList);
adminRoute.put('/userblock/:id',adminController.UserBlock);
module.exports = adminRoute
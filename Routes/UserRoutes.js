const express = require('express')
// const router = express.Router()
const router = express()
const Auth = require("../Middlewares/Auth.js")
const userController = require('../Controller/UserController.js')
const multer = require("../Middlewares/Multer.js")


// *********  USER SIGN IN ******** //
router.post('/signup',userController.UserSignin);
router.post('/login',userController.userLogin);
router.get('/profile',Auth.userAuth,userController.ViewProfile);
router.put('/editProfile',Auth.userAuth,userController.EditProfile);
router.put('/editupdate',userController.UpdateEdit);
router.post("/googleSignup",userController.SignupWithGoogle);
router.post("/otpverified",userController.UserOtpVerify)
router.post('/forgotmail',userController.SentForgotPasswordMail);
router.post('/changepass',userController.ChangePassword);
router.post('/passotverify',userController.PassOtpVerify);
router.get('/hublisting',Auth.userAuth,userController.HubListing)
router.get('/singlehub/:objId',Auth.userAuth,userController.SingleHub)
router.post('/booking',Auth.userAuth,userController.StoreBookedData)
router.get('/bookeddetails/:bookedId',Auth.userAuth,userController.BookedData)
router.put("/updatepaystatus",Auth.userAuth,userController.UpdateStatus)
router.get("/bookedhistory",Auth.userAuth,userController.BookedHistory)
router.post("/changepropass",Auth.userAuth,userController.ChangeProfilePassword)
router.post("/setnewpass",Auth.userAuth,userController.SetNewPassword)
router.post("/resendotp",userController.ResendUserOtpVerify)
router.post("/dpchange",multer.uploadOption.single("dp"),Auth.userAuth,userController.ChangeDp)

module.exports = router 
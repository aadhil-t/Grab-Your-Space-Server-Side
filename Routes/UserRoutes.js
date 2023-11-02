const express = require( 'express')
// const router = express.Router()
const router=express()

const userController = require('../Controller/UserController.js')


// *********  USER SIGN IN ******** //
router.post('/signup',userController.UserSignin);
router.post('/login',userController.userLogin);
router.get('/profile/:id',userController.ViewProfile);
router.put('/editProfile',userController.EditProfile);
router.put('/editupdate',userController.UpdateEdit);
router.post("/googleSignup",userController.SignupWithGoogle);
router.post("/otpverified",userController.UserOtpVerify)
router.post('/forgotmail',userController.SentForgotPasswordMail);
router.post('/changepass',userController.ChangePassword);
router.post('/passotverify',userController.PassOtpVerify);
module.exports = router 
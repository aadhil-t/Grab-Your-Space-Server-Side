const User = require('../Models/UserModel')
const HubAdmin = require('../Models/HubAdminModel')
const HubModel = require('../Models/HubModel')
const BookedData = require('../Models/BookingModel')
const nodemailer = require('nodemailer')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')



const securePassword = async(password)=>{
    try {
        const passwordHash =await bcrypt.hash(password,10);
        return passwordHash;
    } catch (error) {
        console.log(error.message);
    }
}


const SendMailer = async(name, email, text)=>{
    let content;
        if(text == "Hub Verify Email"){
        content =  `<html>
        <body>
        <h1>Welcome to Grab Your Space!</h1>
            <p>Dear Hub Admin,</p>
            <p>Your hub '${name}' has been Verified successfully.</p>
            <p>Thank you for using our platform.</p>
        </body>
    </html>`
        }
    
        let transporter = nodemailer.createTransport({
            host:"smtp.gmail.com",
            service:"Gmail",
            secure: true,
            port: 465,
            auth: {
                user: process.env.MyEmail,
                pass:process.env.MailPass,
            },
        })
    
        const message = {
            from:`Grab Your Space ${process.env.MyEmail}`,
            to: email,
            subject: text,
            html: content,  
        };
    
        transporter.sendMail(message,(err,info)=>{
            if(err){
                console.log(err,"its not working");
            }else{
                console.log("Email send");
            }
        });
    };
    

const AdminLogin = async(req,res)=>{
    try {
        console.log("admin login")
        const {email,password} = req.body
        const emailExist = await User.findOne({email:email});
        if(emailExist){
            if(emailExist.is_admin === true){
                const access = await bcrypt.compare(password,emailExist.password)
                if(access){
                    const adminToken = jwt.sign({ adminId: emailExist._id},process.env.AdminSecret,{ expiresIn: "1h"})
                    res.json({adminData:emailExist,status:true,adminToken});
                }else{
                    res.json({alert:"Invalid user name and password"})
                }
            }else{
                res.json({alert:"you are not an admin"})
            }
        }else{
            res.json({alert:"Email does not exist"});
        }
    } catch (error) {
        console.log(error)
    }
}

const ViewUserList = async(req,res)=>{
    try {
        const UserDetails = await User.find({is_admin:false})
        res.json({UserData:UserDetails})
    } catch (error) {
        console.log(error)
    }
}


const UserBlock = async(req,res)=>{
   try {
    console.log("njan ivida undu")
    const id = req.params.id;
    const user = await User.findById(id);
    
    if(user){
        console.log(user.is_blocked)
        await User.updateOne(
            {_id:id},
            {$set: { is_blocked: !user.is_blocked }}
        );
         return res.status(200).json({message: user.is_blocked ? "User blocked" : "User Unblocked"});
    }
    else{
        res.status(400).json({message: "User not Found"})
    }   
   } catch (error) {
    console.log(error)
   }
}

const HubAdminListing = async(req,res)=>{
    try {
        console.log("Entered in Admin Controller")
        const data = await HubAdmin.find({})
        console.log(data)
        if(data){
            res.status(200).json({ data, message:"successfull"})
        }else{
            res.status(400).json({message:"Something went"})
        }
    } catch (error) {
        console.log(error)
    }
}

const HubApproval = async(req,res)=>{
    try {
        console.log("Enter in HubApproval")
        const data = await HubModel.find({is_verified:false})
        console.log(data,"data gott ")
        if(data){
            res.status(200).json({data,message:"successfull"})
        }else{
            res.status(400).json({message:"Something went wrong"})
        }
    } catch (error) {
        console.log(error)
    }
}

const HubAdminVerify = async(req,res)=>{
    try {
        console.log(req.body,"Reached Hub Admin verify controller")
        const HubName = req.body.Data.hubname
        console.log(HubName)
        const HubData = await HubModel.findOneAndUpdate({ _id : req.body.Data._id },{ $set: { is_verified : true }})
        console.log(HubData)
        if(HubData){
            SendMailer(
                HubName, 
                HubData.hubemail,
                "Hub Verify Email")
                res.status(200).json({ HubData, message:"Successfully Verified" }) 
        }else{
            res.status(400).json({ message:"Failed to Verified" }) 
        }
        console.log()        
    } catch (error) {
     console.log(error)   
    }
}
module.exports={
    AdminLogin,
    ViewUserList,
    UserBlock,
    HubAdminListing,
    HubApproval,
    HubAdminVerify,
    SendMailer,
}
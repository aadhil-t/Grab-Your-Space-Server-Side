const HubAdmin = require('../Models/HubAdminModel')
const HubModel = require("../Models/HubModel")
const BookingModel = require("../Models/BookingModel")
const mailToken = require('../Models/TokenModel')
const nodemailer = require('nodemailer')
const jwt = require('jsonwebtoken')
const crypto = require('crypto')
const bcrypt = require('bcrypt');
const { SendMail } = require('./UserController');
// const { info } = require('console')
const { clearScreenDown } = require('readline')




const securepassword = async (password)=>{
    try {
        const passwordHash = await bcrypt.hash(password,10)
        return passwordHash
    } catch (error) {
        console.log(error.message);
    }
};

const SendMailer = async(name, email, url, text)=>{
let content;
    if(text == "Hub Admin Verify Email"){
    content = `<div>
                    <h1>Grab Your Space</h1>
                    <p>Hi ${name}</p>
                    <p>
                        Than you for choosing Grab Your Space.
                        This mail is a verification message.
                        Please click the link below to verify your mail.
                        the link will remain valid for 2 minutes.
                        <a href="${url}">Verify Email</a>
                    </p>
               </div>`
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

const HubAdminSingup = async(req,res)=>{
    try {   
        const {name,email,mobile,password} = req.body
        const spassword = await securepassword(password)
        const Emailexist = await HubAdmin.findOne({ email:email })
        
        if(Emailexist){
            return res.status(400).json({ message:"Email already exist"});
        }
        else{
            const hubadmin = new HubAdmin({
                name,
                email,
                mobile,
                password:spassword,
            })
            const userData = await hubadmin.save()

            if(userData){
                const id = userData._id;
                const token = await new mailToken({
                    userId: id,
                    token: crypto.randomBytes(32).toString("hex"),}).save();
                    const url=`${process.env.OrginPort}/hub/dashboard/${userData._id}/${token.token}`;
                    SendMailer(userData.name, userData.email, url, "Hub Admin Verify Email");
                    res.status(200).json({message:"Email send successfully please verify" });
                 }else{
                    res.status(400).json({message:"Can't register something went wrong"})
                 }
        }
    } catch (error) {
        console.log(error.message);
    }
}


const VerifyEmail = async(req,res)=>{
    try {
        const verifyLink = await HubAdmin.findOne({_id: req.params.id});
        if(!verifyLink){
           return res.status(400).json({message:"invalid link"})
        }else{
            const HubAdminToken = await mailToken.findOne({ 
                token: req.params.token,
                userId: verifyLink,
            })

            if(!HubAdminToken){
              return res.status(400).json({message:"You verification link have expired."})
            }else{
                const Hubadmin = await HubAdmin.findOne({ _id: verifyLink.id })
                
                if(!Hubadmin){
                    return res.status(400).json({message:"unable to find user to verify please Signup."})
                }else{
                    const update = await HubAdmin.updateOne(
                        {_id: verifyLink.id},
                        { $set:{ is_verified:true },}
                         );

                         if(update){  
                            const hubdata = await HubAdmin.findOne({_id: verifyLink.id})
                            const hubtoken = jwt.sign({userId: hubdata.id},process.env.HubAdminSecret,{ expiresIn:"1h"})

                            return res.status(200).json({status:true, hubdata, hubtoken, message:"your account has been successfully verified"})
                         }
                }
            }
        }
    } catch (error) {
        
    }
}


const HubAdminLogin = async(req,res)=>{
    try {
        const {email,password} = req.body;
        const emailExist = await HubAdmin.findOne({email:email});
        if(!emailExist){
            return res.status(400).json({message:" Email is invalid "})
        }else{
            const passMatch = await bcrypt.compare(password, emailExist.password);
            if(!passMatch){
                return res.status(400).json({message:"entered password is incorrect"});
            }else{
                if(emailExist.is_blocked){
                    return res.status(400).json({message:"Your account is blocked"})
                }else{
                    if(!emailExist.is_verified){
                        return res.status(400).json({message:"Your account is not verified"})
                    }else{
                        const Hubadmindata = emailExist;
                        const hubadmintoken = jwt.sign({ userId: emailExist.id},process.env.HubAdminSecret,{expiresIn:"1h"})

                        return res.status(200).json({ status:true, Hubadmindata, hubadmintoken,message:"Your account loged successfully"})
                    }
                }
            }
        }
    } catch (error) {
        
    }
}


const HubProfile = async(req,res)=>{
    try {
        const HubAdminId = await HubAdmin.findById({_id: req.body.userId});
        if(HubAdminId){
            return res.status(200).json({ profile: HubAdminId, message:"Success"})
        }else{
            return res.status(400).json({message:"not found "})
        }
        
    } catch (error) {
        
    }
}


const EditHubProfile = async(req,res)=>{
    try {
        const HubAdminId = req.body.userId
        const {name,mobile} = req.body
        const HubData = await HubAdmin.findByIdAndUpdate(
            { _id : HubAdminId },
            {$set:{
                name:name,
                mobile:mobile,
            }},
            {new : true }
    );
            if(HubData){
                return res.status(200).json({ updated:true, data:HubData, message:"successfully updated"})
            }else{
                return res.status(400).json({ updated:false, message:"failed to update"})
            }
    } catch (error) {
        console.log(error);
    }
}


const HubCreate = async(req,res)=>{
    try {
        const HubAdminId = req.body.userId;
        const {name,email,mobile,location,seatcount,price} = req.body

        const Hubs = new HubModel({

            hubadminId: HubAdminId,
           hubname: name,
            hubemail: email,
            hubmobile: mobile,
           hublocation: location,
            seatcount,
            price: price,
        })

        const HubData = await Hubs.save();
        console.log(HubData,"fffffffff")
       return res.status(200).json({message:"Hub Added successfully"})

    } catch (error) {
        console.log(error);
    }
}


const HubDataList = async(req,res)=>{
    try {
        let hubData = await HubModel.find({hubadminId:req.body.userId}).populate('hubadminId')
        if(hubData){
            res.status(200).json(hubData)
        }
    } catch (error) {
        
    }
}


const BookedHistory = async(req,res)=>{
    try {
        console.log("Entered in Bookedhistory backend");
        console.log(req.body.userId)
        const data = await BookingModel.find({AdminId:req.body.userId}).populate('bookeduserid').populate('bookedhubid')
        console.log(data)   
        if(data){
            res.status(200).json({ data , message:"successfull"})
        }else{
            res.status(200).json({ data , message:"successfull"})
        }
    } catch (error) {
        
    }
}

module.exports={
    HubAdminSingup,
    SendMailer,
    VerifyEmail,
    HubAdminLogin,
    HubProfile,
    EditHubProfile,
    HubCreate,
    HubDataList,
    BookedHistory,
}
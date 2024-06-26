const HubAdmin = require('../Models/HubAdminModel')
const UserModel = require('../Models/UserModel')
const HubModel = require("../Models/HubModel")
const BookingModel = require("../Models/BookingModel")
const mailToken = require('../Models/TokenModel')
const OfferModel = require('../Models/OfferModel')
const nodemailer = require('nodemailer')
const jwt = require('jsonwebtoken')
const crypto = require('crypto')
const bcrypt = require('bcrypt');
const { MultiUploadCloudinary, uploadToCloudinary } = require('../Utils/cloudinary')
const { SendMail } = require('./UserController');
// const { info } = require('console')
const { clearScreenDown } = require('readline')
const { query } = require('express')
const { errorMonitor } = require('events')
const { find } = require('../Models/UserModel')




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
                            console.log("Update...............")
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
        const HubAdminId = await HubAdmin.findById({_id: req.body.userId})
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
        console.log("ooooooooooooooo")
        const HubAdminId = req.body.userId;
        const {name,email,mobile,location,seatcount,price} = req.body
        // const img = req.files
        let { images, certificate } = req.files;

     
        // Check if images is an array, if not convert it to an array
        if (!Array.isArray(images)) {
            images = [images];
        }


        // Upload certificate image to Cloudinary if exists
        let uploadedCertificate = null;
        if (certificate) {
            uploadedCertificate = await uploadToCloudinary(certificate[0].path, 'hubimages');
        }

        // const uploadImg = await MultiUploadCloudinary(img, "hubimages")

        // console.log(uploadImg,"This Is Image")

        // Upload images to Cloudinary
        const uploadedImages = await MultiUploadCloudinary(images, "hubimages");


        const Hubs = new HubModel({

            hubadminId: HubAdminId,
           hubname: name,
            hubemail: email,
            hubmobile: mobile,
           hublocation: location,
            seatcount,
            price: price,
            // images:uploadImg,
            images: uploadedImages,
            certificate: uploadedCertificate ? uploadedCertificate.url : null,
        })

        const HubData = await Hubs.save();
        console.log(HubData,"fffffffff")
       return res.status(200).json({message:"Hub Added successfully"})

    } catch (error) {
        console.log(error);
        return res.status(500).json({ error: "Internal Server Error" });

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

const AddOffer = async(req,res)=>{
    try {
        console.log("object")
        console.log(req.body)
        const {hubAdminId, hubId, offername, offerpercentage, seatcount} = req.body;
        console.log(hubId, offername, offerpercentage, seatcount,"Reached at AddOffer backend")
        const OfferExist = await OfferModel.find({hubId:hubId})
        if(OfferExist.length > 0){
            res.status(403).json({message:"One Offer is Already Exist"})
            console.log(OfferExist,"ldldldlddl")
        }
        else{
            console.log("object")
            const offer = new OfferModel({
                hubId,
                AdminId:hubAdminId,
                offername,
                offerpercentage,
                seatcount,
            })
            const OfferData = await offer.save();
        
        if(OfferData){
            res.status(200).json({OfferData:OfferData, message:"Successfully Added offer"})
        }
        else{
            res.status(400).json({message:"Something Went wrong"})
        }
        console.log(OfferData,"added offer")
    }
    } catch (error) {
        console.log(error)
    }
}

    const OfferList = async (req, res) => {
        try {
            const userid = req.body.userId; // Extract userId from the request body
            console.log(userid);
            console.log("Reached at Offer list Backend ");
            const OfferData = await OfferModel.find({AdminId:userid}) // Find offers by userId
            if (OfferData) {
                res.status(200).json({ OfferData, message: "Successfull" });
            } else {
                res.status(400).json({ message: "Something went wrong!" });
            }
            console.log(OfferData);
        } catch (error) {
            console.log(error);
            res.status(500).json({ message: "Internal Server Error" });
        }
    }

    const OfferDelete = async(req,res)=>{
        try {
            console.log(req.body)
            const DeleteData = await OfferModel.findByIdAndDelete({_id:req.body.id})
            if(DeleteData){
                res.status(200).json({DeleteData, message:"Offer Deleted Successfully"});
            }else{
                res.status(400).json({message:"Something Went Wrong!"});
            }
            console.log(DeleteData)
        } catch (error) {
            console.log(error)
        }
    }

    const DashboardChart = async (req, res) => {
        try {
            const Adminid = req.body.userId;
            console.log(Adminid, "Reached at dashboard Chart Backend");
    
            // Get today's date
            const EndDate = new Date(); // End date (today)
            const PresentMonthStartDate = new Date(EndDate.getFullYear(), EndDate.getMonth(), 1); // Start of present month
            const PreviousMonthStartDate = new Date(EndDate.getFullYear(), EndDate.getMonth() - 1, 1); // Start of previous month
            const TwoMonthsAgoStartDate = new Date(EndDate.getFullYear(), EndDate.getMonth() - 2, 1); // Start of month before previous month
            
            const boo = await BookingModel.find({AdminId:Adminid})
            console.log(boo,"kkkkkkkkkk");

            const PresentUserBookedData = await BookingModel.find({
                AdminId: Adminid,
                paymentstatus: "success",
                date: {
                    $gte: PresentMonthStartDate,
                    $lt: EndDate // End date (today)
                }
            }).countDocuments();
            
            const PreviousUserBookedData = await BookingModel.find({
                AdminId: Adminid,
                paymentstatus: "success",
                date: {
                    $gte: PreviousMonthStartDate,
                    $lt: PresentMonthStartDate
                }
            }).countDocuments();
            
            const TwoMonthsAgoUserBookedData = await BookingModel.find({
                AdminId: Adminid,
                paymentstatus: "success",
                date: {
                    $gte: TwoMonthsAgoStartDate,
                    $lt: PreviousMonthStartDate
                }
            }).countDocuments();
            
            
            const TotalUserBooked = ( PresentUserBookedData + PreviousUserBookedData + TwoMonthsAgoUserBookedData);

            const bookings = await BookingModel.find({ AdminId: Adminid, paymentstatus:"success" });
              let totalAmount = 0;
               for (const booking of bookings) 
               {
              totalAmount += booking.totalamount;
               }

            console.log(totalAmount, "Total amount of sales");              
            console.log(TotalUserBooked, "user Data for TotalUserBooked");  
            console.log(PresentUserBookedData, "user Data for Present Month");
            console.log(PreviousUserBookedData, "user Data for Previous Month");
            console.log(TwoMonthsAgoUserBookedData, "user Data for Two Months Ago");
            console.log(PresentMonthStartDate, "Present Month Start Date");
            console.log(PreviousMonthStartDate, "Previous Month Start Date");
            console.log(TwoMonthsAgoStartDate, "Two Months Ago Start Date");
    
            res.status(200).json({ PresentMonthStartDate, PreviousMonthStartDate, TwoMonthsAgoStartDate, PresentUserBookedData, PreviousUserBookedData, TwoMonthsAgoUserBookedData, TotalUserBooked, totalAmount});
        } catch (error) {
            console.log(error);
            res.status(500).json({ error: "Internal server error" });
        }
    };
    

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
    AddOffer,
    OfferList,
    OfferDelete,
    DashboardChart,
}
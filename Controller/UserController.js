const User = require("../Models/UserModel");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const nodemailer = require("nodemailer");
const HubModel = require("../Models/HubModel");
const Booking = require("../Models/BookingModel");
const randomstring = require("randomstring");
const Stripe = require("stripe");
const booked = require("../Models/BookingModel");
const { uploadToCloudinary } = require("../Utils/cloudinary");
require("dotenv").config();

const securePassword = async (password) => {
  try {
    const passwordHash = await bcrypt.hash(password, 10);
    return passwordHash;
  } catch (err) {
    console.log(err.message);
  }
};

const UserSignin = async (req, res) => {
  try {
    const { name, email, mobile, password } = req.body;
    const Spassword = await securePassword(password);
    const emailExist = await User.findOne({ email: email });

    if (emailExist) {
      return res.status(400).json({ message: "Email already exists" });
    } else {
      const user = new User({
        name,
        email,
        mobile,
        password: Spassword,
        is_admin: 0,
      });
      const userData = await user.save();

      if (userData) {
        SendMail(
          userData.name,
          userData.email,
          userData._id,
          "user verification"
        );
        return res.json(userData);
      } else {
        return res.status(400).json({
          message: "Can't register, something went wrong",
        });
      }
    }
  } catch (error) {
    console.log(error.message);
    res.status(500).json({
      message: "Internal server error",
    });
  }
};

// const token = jwt.sign({userId:userData._id},"mysecret",{expiresIn:'1h'})
//     return res.json({userData,alert:'Registration',status:true})

// const userLogin = async(req,res)=>{
//     try {

//         const {email,password} = req.body
//         console.log(req.body)
//         const emailExist = await User.findOne({email:email})
//         if(emailExist){
//             const access = await bcrypt.compare(password,emailExist.password);
//             console.log(access);
//             if(access){
//                 const token = jwt.sign({ userId: emailExist.id},process.env.UserSecret,{expiresIn: '1h'})
//                 res.status(200).json({created:true,userData:emailExist,status:true,token});
//             }else{
//                 res.status(400).json({alert:"password is incorrect"})
//             }
//         }else{
//             res.json({alert:"No account in this email",status:false})
//         }
//     } catch (error) {
//         console.log(error)
//     }
// }

const userLogin = async (req, res) => {
  try {
    const { email, password, id } = req.body;

    if (id) {
      const exist = await User.findOne({ password: id });
      console.log(exist, "anas");
      if (!exist) {
        return res
          .status(400)
          .json({ message: "You don't have Account please sign up" });
      } else {
        if (exist.is_blocked == true) {
          return res
            .status(400)
            .json({ message: "Your Account is blocked by admin" });
        } else {
          const token = jwt.sign({ userId: exist.id }, process.env.UserSecret, {
            expiresIn: "4h",
          });
          console.log(token);
          return res
            .status(200)
            .json({ created: true, userData: exist, status: true, token });
        }
      }
    } else {
      const emailExist = await User.findOne({ email: email });
      if (!emailExist) {
        return res.status(400).json({ message: "User not found" });
      } else {
        const access = await bcrypt.compare(password, emailExist.password);
        if (!access) {
          return res
            .status(400)
            .json({ message: "Entered password is incorrect" });
        } else {
          if (emailExist.is_blocked) {
            return res
              .status(400)
              .json({ message: "Your Account is blocked by admin" });
          } else {
            if (!emailExist.is_verified) {
              return res.status(400).json({
                message: "Your Account is not verified please sign up",
              });
            } else {
              const token = jwt.sign(
                { userId: emailExist.id },
                process.env.UserSecret,
                { expiresIn: "4h" }
              );
              return res.status(200).json({
                created: true,
                userData: emailExist,
                status: true,
                token,
                message: "Successfully log in",
              });
            }
          }
        }
      }
    }
  } catch (error) {
    console.log(error);
  }
};

const ViewProfile = async (req, res) => {
  try {
    const id = req.body.userId;
    const data = await User.findById(id);
    if (data) {
      
      return res.status(200).json({ profile: data, message: "success" });
    } else {
      return res.status(400).json({ message: "Data not found" });
    }
  } catch (error) {
    console.log(error.message);
  }
};

const EditProfile = async (req, res) => {
  try {
    const userId = req.body.userId;
    const { name, mobile } = req.body;
    console.log(req.body);
    console.log();
    const editUser = await User.findByIdAndUpdate(userId, {
      $set: {
        name: name,
        mobile: mobile,
      },
    });
    console.log(editUser);
    if (editUser) {
      console.log("edit");
      return res
        .status(200)
        .json({ data: editUser, message: "Profile edited successfully" });
    } else {
      return res.status(400).json({ message: "Failed to edit profil" });
    }
  } catch (error) {
    console.log(error);
  }
};

const UpdateEdit = async (req, res) => {
  try {
    const { name, email } = req.body;

    const userId = req.body.id;
    let userData = await User.findOneAndUpdate(
      { _id: userId },
      { $set: { name: name, email: email } },
      { new: true }
    );
    if (userData) {
      return res.status(200).json({
        updated: true,
        data: userData,
        message: "updated successfully",
      });
    }
    res.status(404).json({ updated: false, message: "Failed update" });
  } catch (error) {
    console.log(error);
  }
};

const SignupWithGoogle = async (req, res) => {
  try {
    const { name, email, id } = req.body;
    console.log(name, email, id);
    const exist = await User.findOne({ email: email });
    if (exist) {
      return res
        .status(200)
        .json({ created: false, message: "email Already exist" });
    } else {
      const newUser = new User({
        name: name,
        email: email,
        password: id,
      });
      let user = await newUser.save().then(console.log("saved"));
      await User.updateOne({ _id: user._id }, { $set: { verified: true } });
      const token = jwt.sign({ userId: user._id }, process.env.UserSecret, {
        expiresIn: "24hr",
      });
      return res.status(200).json({
        created: true,
        token: token,
        user,
        message: "Account registered",
      });
    }
  } catch (error) {
    console.log(error);
  }
};

const SendMail = async (name, email, id, purpose, token) => {
  try {
    console.log(name, "kkkkk");
    let otp = "";
    const digits = "0123456789";
    for (let i = 0; i < 4; i++) {
      otp += digits[Math.floor(Math.random() * 10)];
    }
    console.log(id, "adfghj");

    const v = await User.updateOne({ _id: id }, { $set: { otp: otp } });
    console.log(v, "opkjh");

    let content;
    if (purpose == "user verification") {
      content = `<html>
            <body>
                 <h1>Grab Your Space User Verfication</h1>
                 <p>Hi ${name},</p>
                 <p>Thank you for signing up with Grab Your Space. your otp is ${otp}</p>
            </body>
            </html>`;
    } else if (purpose === "forgot password") {
      content = `<html>
                <body>
                      <h1>Grab Your Space Forgot Password Verfication</h1>
                      <img src="https://img.freepik.com/premium-vector/cyber-security-illustration-concept-with-characters-data-security-protected-access-control-privacy-data-protection_269730-48.jpg?size=626&ext=jpg&ga=GA1.1.1978292054.1686055633&semt=sph" width="500" height="500">
                      <p>Hi ${name},</p>
                      <p>Thank you for signing up with Grab Your Space. your otp is ${otp}</p>
                </body>
            </html>`;
    } else {
      content = `<html>
      <body>
      <h1>Grab Your Space User Verfication</h1>
      <p>Hi ${name},</p>
      <p>Thank you for signing up with Grab Your Space. your Resended otp is ${otp}</p>
 </body>
            </html>`;
    }

    await User.updateOne({ _id: id }, { $set: { otp: otp } });
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false,
      requireTLS: true,
      auth: {
        user: process.env.MyEmail,
        pass: process.env.MailPass,
      },
    });

    const mailOption = {
      from: "GRAB YOUR SPACE",
      to: email,
      subject: "For Verification Mail",
      html: content,
    };

    transporter.sendMail(mailOption, function (error) {
      if (error) {
        console.log(error);
      } else {
        console.log("Email send successfully");
      }
    });
  } catch (error) {}
};

const UserOtpVerify = async (req, res) => {
  try {
    const { otp, id } = req.body;
    const userData = await User.findOne({ _id: id });

    if (otp == userData.otp) {
      await User.updateOne({ _id: id }, { is_verified: true, otp: "" });
      const token = jwt.sign({ userId: userData._id }, process.env.UserSecret, {
        expiresIn: "1h",
      });
      res.json(token);
    } else {
      res.status(400).json({ message: "Otp is incorrect" });
    }
  } catch (error) {}
};

const SentForgotPasswordMail = async (req, res) => {
  try {
    const email = req.body.email;
    const UserData = await User.findOne({ email: email });
    const token = randomstring.generate();
    await User.updateOne({ email: email }, { $set: { token: token } });
    if (UserData) {
      SendMail(
        UserData.name,
        UserData.email,
        UserData._id,
        "forgot password",
        token
      );
      res.status(200).json({ message: "Check your email", id: UserData._id });
    } else {
      res.status(400).json({ message: "Something went wrong" });
    }
  } catch (error) {
    console.log(error);
  }
};

const ChangePassword = async (req, res) => {
  try {
    const { password, id, token } = req.body;
    const pass = await bcrypt.genSalt(10);
    const hashPassword = await bcrypt.hash(password, pass);

    const tokenCheck = await User.findOne({ token: token });
    if (!tokenCheck) {
      res.status(400).json({ message: "Time expired try again" });
    }

    const userData = await User.updateOne(
      { _id: id },
      { $set: { password: hashPassword } }
    );
    if (userData) {
      res.status(200).json({ message: "Password successfully changed" });
    } else {
      res.status(400).json({ message: "Something went wrong" });
    }
  } catch (error) {
    console.log(error);
  }
};

const PassOtpVerify = async (req, res) => {
  try {
    const { otp, id } = req.body;
    const userData = await User.findOne({ _id: id });
    if (otp == userData.otp) {
      return res.status(200).json({ message: "OTP is valid" });
    } else {
      return res.status(400).json({ message: "OTP is incorrect" });
    }
  } catch (error) {}
};

const HubListing = async (req, res) => {
  try {
    let HubData = await HubModel.find();
    if (HubData) {
      res.status(200).json(HubData);
    }
  } catch (error) {
    console.log(error);
  }
};

const SingleHub = async (req, res) => {
  try {
    const objid = req.params.objId;
    console.log(req.params, "iiiiiiiiipppppppppppp");
    const singleData = await HubModel.findById(objid);
    if (singleData) {
      res.status(200).json(singleData);
    }
    console.log(singleData);
  } catch (error) {
    console.log(error);
  }
};

const StoreBookedData = async (req, res) => {
  try {
    console.log(req.body, "enter in backend booking ");
    const { userId, selected, selectedDate, TotalAmount, SingleHubData} = req.body;
    const booked = new Booking({
      bookeduserid: userId,
      bookedhubid: SingleHubData,
      AdminId: SingleHubData.hubadminId,
      date: selectedDate,
      selectedseats: selected,
      totalamount: TotalAmount,
    });
    console.log(booked)
    const bookedData = await booked.save();
    if (bookedData) {
      res.status(200).json({ booked: true, data: bookedData });
    } else {
      return res
        .status(400)
        .json({ booked: false, message: "Can't book Something went wrong!!" });
    }
    // console.log(bookedData, "successfully booked");
  } catch (error) {
    console.log(error);
  }
};

const BookedData = async (req, res) => {
  try {
    const bookedId = req.params.bookedId;
    console.log(bookedId, "entered in backend bookedData");
    const data = await Booking.find({ _id: bookedId })
      .populate("bookedhubid")
      .populate("bookeduserid");
    const stripe = new Stripe(
      "sk_test_51O11IzSJfBiixPMTuMIQ5XnJMHD2niq1bWmFC9qjOQ11GIMxsADIsMfJ4azYq8PKqCKkp5KEmFkLzaZsmdoguEZl00WG2wrBwR"
    );
    const amount = data[0].totalamount;
    const paymentintent = await stripe.paymentIntents.create({
      amount: amount * 100,
      currency: "inr",
      automatic_payment_methods: { enabled: true },
    });
    console.log(paymentintent, "intent");
    res.status(200).json({ data, clientSecret: paymentintent.client_secret });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const UpdateStatus = async (req, res) => {
  try {
    console.log("enter into UpdateStatus");
    const update = await booked.updateOne(
      { _id: req.body.id },
      { $set: { paymentstatus: "success" } }
    );
    console.log(update);
    res.status(200).json({ update, message: "update succeessfully" });
  } catch (error) {
    console.log(error);
  }
};

const BookedHistory = async (req, res) => {
  try {
    console.log("reached backend BookedHistory");
    const userId = req.body.userId;
    const data = await booked
      .find({ bookeduserid: userId })
      .populate("bookedhubid")
      .populate("bookeduserid");
    if (data) {
      res.status(200).json({ data, message: "successfull" });
    } else {
      res.status(400).json({ message: "something went wrong !" });
    }
  } catch (error) {
    console.log(error);
  }
};

const ChangeProfilePassword = async (req, res) => {
  try {
    console.log(req.body,"kkkkkkkkk")
    const userData = await User.findById(req.body.userId);
    const compare = await bcrypt.compare(
      req.body.changepassword,
      userData.password
    );
    if (compare) {
      res.status(200).json({ compare, message: "successfull" });
    } else {
      res.status(400).json({ message: "Something Went Wrong !" });
    }
  } catch (error) {
    console.log(error);
  }
};

const SetNewPassword = async (req, res) => {
  try {
    console.log("reached SetNewPassword backendaaaaaa ");
    const pass = req.body.ConfirmPassword;
    const hashnewpass = await bcrypt.hash(pass, 10);
    console.log(hashnewpass);
    const userData = await User.findById(req.body.userId);
    console.log(userData.password);
    const access = await bcrypt.compare(pass, userData.password);

    console.log(access);
    if (!access) {
      const userData = await User.updateOne(
        { _id: req.body.userId },
        { $set: { password: hashnewpass } }
      );
      res.status(200).json({ message: "successfully updated" });
      console.log(userData);
    } else {
      res.status(400).json({ userData, message: "Wrong !!" });
    }
  } catch (error) {
    console.log(error);
  }
};

const ResendUserOtpVerify = async (req, res) => {
  try {
    console.log("reached at resent");
    console.log(req.body.id);
    const userData = await User.findOne({ _id: req.body.id });
    console.log(userData);
    if (userData) {
      SendMail(
        userData.name,
        userData.email,
        userData._id,
        "resent otp"
      );
      res.status(200).json({userData, message:"Successfully Resent otp"})
    }else{
      res.status(400).json({message:"Something Went Wrong On Resent otp"})      
    }
  } catch (error) {
    console.log(error);
  }
};

const ChangeDp = async(req,res)=>{
  try {
    console.log("Reached at backend")
    console.log(req.file.path,"path to the picture")
    console.log(req.body.userId,"user id")
    const img = req.file.path
    const UploadDp = await uploadToCloudinary(img , "dp");
    const UpdateDp = await User.findOneAndUpdate(
      {_id : req.body.userId},
      {$set:{
        profileimage : UploadDp.url
      }}
    )
    if(UpdateDp){
      console.log(UpdateDp,"DP SUCCESSFULLY UPDATED")
      res.status(200).json({UpdateDp, message:"Successfully updated"})
    }else{
      res.status(400).json({message:"Something Went Wrong"})
    }
  } catch (error) {
    console.log(error)
  }
}

module.exports = {
  UserSignin,
  userLogin,
  ViewProfile,
  EditProfile,
  UpdateEdit,
  SignupWithGoogle,
  SendMail,
  UserOtpVerify,
  SentForgotPasswordMail,
  ChangePassword,
  PassOtpVerify,
  HubListing,
  SingleHub,
  StoreBookedData,
  BookedData,
  UpdateStatus,
  BookedHistory,
  ChangeProfilePassword,
  SetNewPassword,
  ResendUserOtpVerify,
  ChangeDp,
};

const User = require("../Models/UserModel");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const nodemailer = require("nodemailer");
const randomstring = require("randomstring");
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
    console.log("innnnnn")
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
        console.log("munessssss");
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
    console.log("login");
    const { email, password, id } = req.body;
    console.log(email, id);
    if (id) {
      const exist = await User.findOne({ password: id });
      console.log(exist, "anas");
      if (!exist) {
        res
          .status(400)
          .json({ message: "You don't have Account please sign up" });
      } else {
        const token = jwt.sign({ userId: exist.id }, process.env.UserSecret, {
          expiresIn: "1h",
        });
        res
          .status(200)
          .json({ created: true, userData: exist, status: true, token });
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
              return res
                .status(400)
                .json({
                  message: "Your Account is not verified please sign up",
                });
            } else {
              const token = jwt.sign(
                { userId: emailExist.id },
                process.env.UserSecret,
                { expiresIn: "1h" }
              );
              res
                .status(200)
                .json({
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
   
        
    const id = req.headers.userId;
    console.log(id)
    const data = await User.findById(id);
    if (data) {
     return res.status(200).json({ data: data });
    } else {
     return res.status(200).json({ message: "Data not found" });
    }
  } catch (error) {
    console.log(error.message);
  }
};

const EditProfile = async (req, res) => {
  try {
    console.log("enter edit")
    const { userId, name, email, mobile } = req.body;
    const editUser = await User.updateOne(
      { _id: userId },
      {
        $set: {
          name: name,
          email: email,
          mobile: mobile,
        },
      }
    );
    if (editUser) {
      return res
        .status(200)
        .json({ data: editUser, message: "Profile edited successfully" });
    } else {
      return res.status(200).json({ message: "Failed to edit profil" });
    }
  } catch (error) {
    console.log(error);
  }
};

const UpdateEdit = async (req, res) => {
  try {
    const { name, email } = req.body;

    const userId = req.body.id;
    console.log(userId);
    let userData = await User.findOneAndUpdate(
      { _id: userId },
      { $set: { name: name, email: email } },
      { new: true }
    );
    if (userData) {
      return res
        .status(200)
        .json({
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
    console.log(req.body, "nnnnnnnnnn");
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
      return res
        .status(200)
        .json({
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
    } else {
      content = `<html>
                <body>
                      <h1>Grab Your Space Forgot Password Verfication</h1>
                      <img src="https://img.freepik.com/premium-vector/cyber-security-illustration-concept-with-characters-data-security-protected-access-control-privacy-data-protection_269730-48.jpg?size=626&ext=jpg&ga=GA1.1.1978292054.1686055633&semt=sph" width="500" height="500">
                      <p>Hi ${name},</p>
                      <p>Thank you for signing up with Grab Your Space. your otp is ${otp}</p>
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
    console.log("monusee");
    console.log(req.body);
    const { otp, id } = req.body;
    console.log(id, otp);
    const userData = await User.findOne({ _id: id });
    console.log(userData);

    if (otp == userData.otp) {
      console.log("enter");
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
    console.log(req.body);
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
    console.log(userData, "userdata");
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
    console.log(otp, id);
    console.log(req.body);

    const userData = await User.findOne({ _id: id });
    console.log(userData.otp);

    if (otp == userData.otp) {
      return res.status(200).json({ message: "OTP is valid" });
    } else {
      return res.status(400).json({ message: "OTP is incorrect" });
    }
  } catch (error) {}
};

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
};

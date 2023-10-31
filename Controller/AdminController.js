const User = require('../Models/UserModel')
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


const AdminLogin = async(req,res)=>{
    try {
        const {email,password} = req.body
        const emailExist = await User.findOne({email:email});
        if(emailExist){
            if(emailExist.is_admin === 1){
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
        console.log("kkkk")
        const UserDetails = await User.find({is_admin:0})
        console.log(UserDetails,"hahaha")
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


module.exports={
    AdminLogin,
    ViewUserList,
    UserBlock,
}
const jwt = require("jsonwebtoken");
const User = require("../Models/UserModel");
const dotenv = require("dotenv");

dotenv.config();
 
export const userAuth = async(req,res,next)=>{
    try {
        console.log(req.headers.authorization,"ddddddd")
        if(req.headers.authorization){
            let token = req.headers.authorization.split(" ")[1];
            const decode = jwt.verify(token,process.env.UserSecret);
            const user = await User.findOne({
                _id:decode.userId
            });
            
            if(user){
                if(user.is_blocked == false){
                    next()
                }
                else{
                    return res.status(403).json({ data: {message:"You are blocked by admin"}})
                }
            }
            else{
                return res.status(400).json({message:"user not authorised or invalid user"})
            }
                }
                else{
                    return res.status(400).json({message:"user not authorised"})
                }
    } catch (error) {
        console.log(error)
    }
}


export const adminAuth = async(req,res,next)=>{
    try {
        if(req.headers.authorization){
            let token = req.headers.authorization.split(" ")[1];
            const decoded = jwt.verify(token,process.env.AdminSecret);
            const admin = await User.findOne({
                _id: decoded.adminId,
                is_admin: true,
            })
            
            if(admin){
                next()
            }
            else{
                return res.status(400).json({message:"User not authorised or invalid user"});
            }
        }
        else{
            return res.status(400).json({message:"User not authorised"})
        }
    } catch (error) {
        console.log(error)
    }
}
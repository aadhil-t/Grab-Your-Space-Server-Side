const jwt = require("jsonwebtoken");
const User = require("../Models/UserModel");
const Hubadmin = require("../Models/HubAdminModel")
const dotenv = require("dotenv");

dotenv.config();
 
 const userAuth = async(req,res,next)=>{
     
    try {
        if(req.headers.authorization){ 
            let token = req.headers.authorization.split(" ")[1];
            const decode = jwt.verify(token,process.env.UserSecret);
            const user = await User.findOne({
                _id:decode.userId
            });
           
            if(user){
                if(user.is_blocked == false){
                    req.body.userId = decode.userId
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
        console.log(error.message)
    }
}


 const adminAuth = async(req,res,next)=>{
    try {
        if(req.headers.authorization){
            console.log(req.headers,"momomoomom")
            let token = req.headers.authorization.split(" ")[1];
            console.log(token,"kkkkkkk")
            const decoded = jwt.verify(token,process.env.AdminSecret);
            const admin = await User.findOne({
                _id: decoded.adminId,
                is_admin: true,
            })
            
            if(admin){
                req.body.adminId = decoded.adminId
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
        console.log(error.message)
    }
}


const hubadminAuth = async(req,res,next)=>{
    try {
        if(req.headers.authorization){
            const Hubtoken = req.headers.authorization.split(" ")[1];
            const decode = jwt.verify(Hubtoken,process.env.HubAdminSecret);
            const HubAdmin = await Hubadmin.findOne({
                _id: decode.userId
            })
             
            if(HubAdmin){
                if(HubAdmin.is_blocked == false){
                    req.body.userId = decode.userId;
                    
                    next()
                }else{
                    return res.status(400).json({message:"Your Account has been blocked by Admin"});
                }
            }else{
                return res.status(400).json({message:"User not autherised or invalid user"})
            }

        }else{
            return res.status(400).json({message:"User not Autherised"})
        }
        
    } catch (error) {
        
    }
}
module.exports={
    userAuth,
    adminAuth,
    hubadminAuth

}
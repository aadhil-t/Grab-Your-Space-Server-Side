const HubAdmin = require('../Models/HubAdminModel')
const bcrypt = require('bcrypt');



const securepassword = async (password)=>{
    try {
        const passwordHash = await bcrypt.hash(password,10)
        return passwordHash
    } catch (error) {
        console.log(error.message);
    }
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
        }
    } catch (error) {
        console.log(error.message);
    }
}
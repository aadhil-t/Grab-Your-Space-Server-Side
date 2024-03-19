const ChatModel = require('../Models/ChatModel');

///////////////// User Chat Section ////////////////
const CreateChat = async(req,res)=>{
    try {
    console.log("bodyReached CreateChat")
    const {adminId,userId} = req.params 
    console.log(adminId,"Para CreateChat")
    console.log(userId,"Para CreateChat")
    const newChat = new ChatModel({
        members: [userId, adminId],
    });
        const result = await newChat.save();
        if(result){
            res.status(200).json(result)
        }
     } catch (error) {
        res.status(500).json(error);
     }
}

const UserChats = async(req,res)=>{
    try {
        console.log("Reached UserChat Backend")
        const {AdminId} = req.params;
        console.log(AdminId,"Got it")
        const Chat = await ChatModel.find({
            members: {$in : [AdminId]}
        }).populate({
            path:"members",
            select:"name",
            match:{_id: {$eq:AdminId}},
            model:"hubadmin"
        })
        console.log(Chat)
        res.status(200).json(Chat);
    } catch (error) {
        res.status(500).json(error);
    }
}

const FindChat = async(req,res)=>{
    try {
        const chat = await ChatModel.findOne({
            members: {$all : [req.params.firstId, req.params.secondId]}
        })
        res.status(200).json(chat)
    } catch (error) {
        res.status(500).json(error);
    }
} 

///////////////// Admin Chat Section ////////////////
const CreateAdminChat = async(req,res)=>{
    try {
    console.log("bodyReached CreateChat")
    const {adminId,userId} = req.params 
    console.log(adminId,"Para CreateChat")
    console.log(userId,"Para CreateChat")
    const newChat = new ChatModel({
        members: [userId, adminId],
    });
        const result = await newChat.save();
        if(result){
            res.status(200).json(result)
        }
     } catch (error) {
        res.status(500).json(error);
     }
}

module.exports={
    CreateChat,
    UserChats,
    FindChat,
}
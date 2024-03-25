const { adminAuth } = require('../Middlewares/Auth');
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
        console.log("Reached UserChat Backend-----------------------")
        const {AdminId} = req.params;
        console.log(AdminId,"ggggggggggggggggggggggggggggggggggg");
        console.log(req.body.userId,"Got it")
        const Chat = await ChatModel.find({
            members: {$in : [req.body.userId]}
        }).populate({
            path:"members",
            select:"name",
            // match:{_id: {$eq:AdminId}}, 
            model:"hubadmin"
        })

        // const chat = await ChatModel.find({_id:})

        console.log(Chat,"iiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiii")
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
const AdminChat = async (req, res) => {
    try {
        console.log("Reached AdminChat Backend by ar");
        const { AdminId } = req.params
        console.log( AdminId,"admin Id from params");
        const chat = await ChatModel.find({
            members: {$in : [AdminId]}
        }).populate({
            path:"members",
            select:"name profileimage",
            // match:{_id: {$ne:AdminId}},
            model:"user"
        })
        console.log(chat)
        res.status(200).json({chat,message:"Reached AdminChat Backend"});
    } catch (error) {
        res.status(500).json(error);
    }
};


const FindAdminChat = async(req,res)=>{
    try {
        console.log('reavhed at FinAdmin Chat')
        const chat = await ChatModel.findOne({
            members: {$all : [req.params.firstId, req.params.secondId]}
        })
        res.status(200).json(chat)
    } catch (error) {
        res.status(500).json(error);
    }
} 


module.exports={
    CreateChat,
    UserChats,
    FindChat,

    AdminChat,
    FindAdminChat,
}
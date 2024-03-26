const MessageModel = require('../Models/MessageModel');


const AddMessage = async(req,res)=>{
    const senderId = req.body.userId
    const { receverId } = req.params
    const {newMessage} = req.body
    const message = new MessageModel({
        chatId: receverId,
        receiverId:receverId,
        senderId: senderId,
        text: newMessage,
    });
    try {
        const result = await message.save()
        res.status(200).json(result);
    } catch (error) {
        res.status(500).json(error);
    }
}

const GetMessages = async(req,res)=>{
    console.log("Reached at Get Message Backend")
    const {chatId} = req.params;
    try {
        const result = await MessageModel.find({chatId});
        res.status(200).json(result);
    } catch (error) {
        res.status(500).json(error)
    }
}


/////////////////// Admin Messages /////////////

const GetAdminMessages = async(req,res)=>{
    const {AdminChatId} = req.params;
    try {
        const result = await MessageModel.find({chatId:AdminChatId});
        res.status(200).json(result);
    } catch (error) {
        res.status(500).json(error)
    }
}

const AddAdminMessage = async(req,res)=>{
    try {
    const senderId = req.body.userId
    const { receverId } = req.params
    const {newMessage} = req.body
    const message = new MessageModel({
        chatId: receverId,
        receiverId:receverId,
        senderId: senderId,
        text: newMessage,
    });
    const result = await message.save()
        return  res.status(200).json(result);
    } catch (error) {
        res.status(500).json(error);
    }
}
module.exports ={
    AddMessage,
    GetMessages,
    GetAdminMessages,
    AddAdminMessage
}
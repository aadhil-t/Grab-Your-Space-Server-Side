const MessageModel = require('../Models/MessageModel');


const AddMessage = async(req,res)=>{
    const senderId = req.body.userId
    const { chatid } = req.params
    console.log(req.params,"chatid Id")
    const {newMessage} = req.body
    const message = new MessageModel({
        chatId: chatid,
        senderId: senderId,
        text: newMessage,
    });
    try {
        const result = await message.save();
        res.status(200).json(result);
    } catch (error) {
        res.status(500).json(error);
    }
}

const GetMessages = async(req,res)=>{
    console.log("Reached at Get Message Backend")
    const {chatId} = req.params;
    console.log(chatId,"chat id")
    try {
        const result = await MessageModel.find({chatId});
        res.status(200).json(result);
    } catch (error) {
        res.status(500).json(error)
    }
}

module.exports ={
    AddMessage,
    GetMessages
}
const mongoose = require("mongoose")
const { Schema } = mongoose;

const HubSchema = new Schema({  

    hubadminId: {
        type: Schema.Types.ObjectId,
        ref: "hubadmin", // Replace with the actual model name you are referencing
        required: true,
    },


    hubname:{
        type:String,
        required:true
    },

    hubemail:{
        type:String,
        required:true
    },

    hubmobile:{
        type:String,
        required:true
    },

    hublocation:{
        type:String,
        
    },

    seatcount:{
        type:Number,
        required:true
    },

    price:{
        type:Number,
        required:true
    },

    images:{
        type:Array,
    },
})

const Hub = mongoose.model("Hub",HubSchema);
module.exports = Hub
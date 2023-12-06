const mongoose = require("mongoose")

const HubSchema = new Schema({

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

})

const Hub = mongoose.model("Hub",HubSchema);
module.exports = Hub
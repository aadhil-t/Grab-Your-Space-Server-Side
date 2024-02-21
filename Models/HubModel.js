const mongoose = require("mongoose")
const { Schema } = mongoose;

const HubSchema = new Schema({  

    hubadminId: {
        type: Schema.Types.ObjectId,
        ref: "hubadmin", // Replace with the actual model name you are referencing
        required: true,
    },

    // bookedData:{
    //     type:Schema.Types.ObjectId,
    //     ref:"booked",
    //     required: true,
    //    },
  
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

    certificate:{
        type:String,
        default:""
    },

    is_verified:{
        type:Boolean,
        default:false
    }
})

const Hub = mongoose.model("Hub",HubSchema);
module.exports = Hub
const mongoose = require("mongoose");
const {Schema} = mongoose;

const OfferSchema = new Schema ({

    hubId:{
        type:Schema.Types.ObjectId,
        ref:"Hub",
        required:true,
    },
    
    offername:{
        type:String,
        required:true,
    },

    offerpercentage:{
        type:Number,
        required:true,
    },

    seatcount:{
        type:Number,
        required:true,
    },
})

const offer = mongoose.model("offer",OfferSchema);
module.exports = offer
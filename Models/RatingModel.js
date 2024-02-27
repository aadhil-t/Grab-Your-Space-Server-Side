const mongosee = require("mongoose");
const {Schema} = mongosee;

const RatingSchema = new Schema({

    userId:{
        type:Schema.Types.ObjectId,
        ref:"user",
    },

    hubId:{
        type:Schema.Types.ObjectId,
        ref:"Hub",
    },

    rating:{
        type:Number,
        required:true,
    },

    review:{
        type:String,
        required:true,
    }
})

const rating = mongosee.model("rating",RatingSchema)
module.exports = rating
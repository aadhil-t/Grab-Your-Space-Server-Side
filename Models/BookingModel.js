const mongoose = require('mongoose');
const {Schema} = mongoose;


const BookingSchema = new mongoose.Schema({

     bookeduserid :{
        type:Schema.Types.ObjectId,
        ref:"user",
        required: true,
     },

     bookedhubid:{
        type:Schema.Types.ObjectId,
        ref:"Hub",
        required: true,
     },

     AdminId:{
      type:Schema.Types.ObjectId,
      ref:"hubadmin",
      required: true,
     },

     selectedseats:{
        type: Array,
        required: true,
     },

     date:{
        type: Date,
        required: true,
     },

     totalamount:{
        type: Number,
        
     },

     paymentstatus:{
        type:String,
        default:"pending",
    },

    transactionid:{
      type:String,
    }

})

const booked = mongoose.model("booked",BookingSchema);
module.exports = booked;
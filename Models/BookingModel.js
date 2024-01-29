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

     selectedseats:{
        type: Array,
        required: true,
     },

     date:{
        type: Date,
        required: true,
     }

})

const booked = mongoose.model("booked",BookingSchema);
module.exports = booked;
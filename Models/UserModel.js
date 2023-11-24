const mongoose = require('mongoose')

const UserSchema = new mongoose.Schema({

    name:{
        type:String,
        required:true
    },

    email:{
        type:String,
        required:true
    },

    mobile:{
        type:Number,
        
    },

    password:{
        type:String,
        required:true
    },

    profileimage:{
        type:String,
        default:""
    },

    is_admin:{
        type:Boolean,
        default:false
        
    },

    is_verified:{
        type:Boolean,
        default:false
    },
    
    otp:{
        type:String,
        default:""
    },

    is_blocked:{
        type:Boolean,
        default:false
    }
})

const user = mongoose.model('user',UserSchema)
module.exports = user
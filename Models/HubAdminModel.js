const mongoose = require('mongoose')

const HubAdminSchema = new mongoose.Schema({

    name:{
        type:String,
        required:true,
    },

    email:{
        type:String,
        required:true,
    },

    mobile:{
        type:Number,
    },

    password:{
        type:String,
        required:true,
    },

    is_verified:{
        type:Boolean,
        default:false,
    },

    is_blocked:{
        type:Boolean,
        default:false,
    }
})

const hubadmin = mongoose.model('hubadmin',HubAdminSchema)
module.exports = hubadmin
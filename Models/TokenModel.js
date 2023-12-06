const mongoose = require('mongoose');
const { Schema } = mongoose;

const tokenSchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: "User", // Replace with the actual model name you are referencing
        required: true,
    },
    token: {
        type: String,
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
        expires: 3600,
    }
});

// Assuming you have a model named 'Token' for this schema
const Token = mongoose.model('Token', tokenSchema);

module.exports = Token;

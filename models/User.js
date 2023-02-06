const mongoose = require("mongoose");

const UserSchema= new mongoose.Schema({
    
    username: {type: String, required: true, unique: true},
    email: {type: String, unique: true, required: true},
    password: {type: String, required: true},
    avatar: {type: String, default: ""},
    isAdmin: {type: Boolean, default: false},
    country: {type: String},
    numberPhone: {type: Number},
    address: {type: String}
    },
    {timestamps: true}
);

module.exports = mongoose.model("User", UserSchema);
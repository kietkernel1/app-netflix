const mongoose = require("mongoose");

const AuthSchema = mongoose.Schema({
    idUser: {type: String, required: true, unique: true},
    refreshToken: {type: String, required: true, unique: true},
    isAdmin: {type:Boolean, default: false}

}, {timestamps: true});

module.exports= mongoose.model("Auth", AuthSchema)
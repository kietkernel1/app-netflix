const express = require('express');
const router = express.Router();
const User = require("../models/User");
const Auth = require("../models/Auth")
const CryptoJS = require('crypto-js');
const jwt = require('jsonwebtoken');

// REGISTER
router.post("/register", async (req, res)=>{
    console.log(req.body.username)
    const newUser = new User({
        "username": req.body.username,
        "email": req.body.email,
        "password": CryptoJS.AES.encrypt(req.body.password, process.env.KEY_ACCESS_TOKEN).toString(),
        isAdmin: req.body.isAdmin,
        country: req.body.country,
        numberPhone: req.body.numberPhone,
        address: req.body.address,
        avatar: req.body.avatar
    })
    try{
    await newUser.save();
    
    res.status(201).json("success");
    }catch(err){
        console.log(err)
        res.status(400).json(err);
    }
});
// LOGIN
router.post("/login", async (req, res) => {
    try{
        const user= await User.findOne({username: req.body.username})
        if(!user)
        {res.status(401).json("Your account is wrong")
        return;    
        }

        var bytes  = CryptoJS.AES.decrypt(user.password, process.env.KEY_ACCESS_TOKEN);
        var originalPassword = bytes.toString(CryptoJS.enc.Utf8);
        if(originalPassword !== req.body.password) {
            res.status(401).json("Your account is wrong");
        return;
        }

        const accessToken = jwt.sign(
            {id: user._id, isAdmin: user.isAdmin},
            process.env.KEY_ACCESS_TOKEN,
            {expiresIn: '0.5h'}
            )
        
        try{
            const auth= await Auth.findOne({idUser: user._id});
            if(auth){
                await Auth.findOneAndDelete(auth);
            }
        }catch(err){
            res.status(500).json(err)
        }

        const refreshToken = jwt.sign(
            {id: user._id},
            process.env.KEY_REFRESH_TOKEN,
            {expiresIn: '5h'}
            )
        
        const newAuth= new Auth({
            idUser: user._id,
            refreshToken: refreshToken,
            isAdmin: user.isAdmin
            },)
        try{
            await newAuth.save();

        }catch(err){
                res.status(500).json(err);
        }

        res.cookie("refreshToken", refreshToken, {
            expires: new Date(Date.now()+3*24*60*60),
            httpOnly: true,
            secure: true
            
        })

        const {password,...info} = user._doc;
       
        res.status(200).json({...info, accessToken});
    }catch(err){
        console.log({err})
        res.status(500).json(err);
    }
})

router.get("/refreshToken", async (req, res) =>{
    
    const cookie= req.cookies;
    if(!cookie){
        res.status(401).json("You not be unauthorized")
        return;
    }
    let refreshToken= "";
    
    try{
    
    const existToken= await Auth.findOne({refreshToken: cookie.refreshToken});
    
    if(!existToken){

        res.status(401).json("You not be unauthorized")
        return;
    }

    await new Promise((resolve)=>{
        jwt.verify(existToken.refreshToken, process.env.KEY_REFRESH_TOKEN, (err, data)=>{
        
            if(err){
               return res.status(403).json(err);
            }
            
            refreshToken= jwt.sign(
                {idUser: data.idUser},
                process.env.KEY_REFRESH_TOKEN,
                {expiresIn: "5h"})
            resolve()
        });
    })
     

    await Auth.findOneAndUpdate(
        existToken,
        {$set: {
            refreshToken: refreshToken
        }},
        {new: true}
        );

    const accessToken= jwt.sign(
        {id: existToken.idUser, isAdmin: existToken.isAdmin},
        process.env.KEY_ACCESS_TOKEN,
        {expiresIn: "0.5h"});
        console.log(accessToken)
    res.cookie("refreshToken", refreshToken, {
        expires: new Date(Date.now()+3*24*60*60),
        httpOnly: true,
        secure: true
    });
    res.status(200).json({accessToken})
    }catch(err){
        console.log(err)
        res.status(500).json(err);
    }

})

router.delete("/logout", async (req, res)=>{
    const cookie= req.cookies;
    if(!cookie){
        res.clearCookie("refreshToken")
        res.status(200).json("Request Successfully")
    }
    try{
        await Auth.findOneAndDelete({refreshToken: cookie.refreshToken})
        res.clearCookie("refreshToken")
        res.status(200).json("Request Successfully")

    }catch(err){
        console.log(err)
        res.status(500).json(err)
    }
})

module.exports = router;
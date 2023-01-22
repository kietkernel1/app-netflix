const router= require("express").Router();
const User= require("../models/User");
const verifyToken= require("../verify-token");
const CryptoJS= require("crypto-js");
//UPDATE
router.put("/:id", verifyToken, async (req, res)=>{
    if(req.user.id !== req.params.id || !req.user.isAdmin){
    res.status(401).json("You not allow to update your account");
    return;
    }
    try{
        const user= await User.findByIdAndUpdate(
        req.user.id,
        {$set:{
            username: req.body.username,
            password: CryptoJS.AES.encrypt(req.body.password, process.env.SECRET_KEY).toString()
        }
        },
        {new: true}
        )

        res.status(200).json(user);
    }catch(err){
        res.status(500).json(err);
    }
})

// DELETE
router.delete("/delete/:id", verifyToken, async (req, res)=>{

    if(!req.user.isAdmin || req.user.id === req.params.id){
        console.log(req.user.id, req.params.id)
        res.status(401).json("You can't delete your account")
        return;
    }
    try{
        await User.findByIdAndDelete(req.params.id);
        res.status(200).json("Your account is deleted");
    }
    catch(err){
        res.status(500).json(err);
    }
})

//GET
router.get("/find/:id", verifyToken, async (req, res)=>{
    if(!req.user.isAdmin){
        res.status(401).json("You not allow to get this account")
        return;
    }
    try{
        const user= await User.findById(req.params.id);
        const {password, ...info}= user._doc;
        res.status(200).json(info);
    }catch(err){
        res.status(500).json(err);
    }
})

//GET ALL
router.get("/", verifyToken, async (req, res)=>{
    
    try{
        const query= (req.query.new==='true');
        const user= query ? await User.find().limit(5).sort('-createdAt'): await User.find();
        const info= user.map(item =>{
            const {password, ...info}= item._doc;
            return info;
        })
        res.status(200).json(info);
    }catch(err){
        res.status(500).json(err);
    }
})

//GET STATS
router.get("/stats", verifyToken, async (req, res)=>{
    if(!req.user.isAdmin){
        res.status(401).json("you not allow to check the stats")
        return;
    }
    
    try{
    const info= await User.aggregate([{
        $project:{
            month:{$month: '$createdAt'},
        }
    },{
        $group:{
            _id: "$month",
            total: {$sum: 1}
        }
    }
])  
    
    res.status(200).json(info);
    }catch(err){

        res.status(500).json(err);
    }
    
})
module.exports= router;
const router= require("express").Router();
const List= require("../models/List");
const verifyToken= require("../verify-token");

router.post("/upload", verifyToken, async (req, res)=>{
    if(!req.user.isAdmin){
        res.status(401).json("You not allow to upload list")
        return;
    }
    try{
        const newList= new List(req.body);
        const list= await newList.save();
        res.status(200).json(list);
    }catch(err){
        res.status(500).json(err);
    }
})

router.put("/update/:id", verifyToken, async (req, res)=>{
    if(!req.user.isAdmin){
        res.status(401).json("You not allow to update list")
        return;
    }
    try{
        const list= await List.findByIdAndUpdate(
            req.params.id,
            {$set: req.body},
            {new: true})
        res.status(200).json(list);
    }catch(err){
        res.status(500).json(err);
    }
})

router.delete("/delete/:id", verifyToken, async (req, res)=>{
    if(!req.user.isAdmin){
        res.status(401).json("You not allow to delete movie list")
        return;
    }
    try{
        await List.findByIdAndDelete(req.params.id);
        res.status(200).json("This movie list was deleted")
    }catch(err){
        res.status(500).json(err);
    }
})

router.get("/", verifyToken, async (req, res)=>{
    const type= req.query.type;
    const genre= req.query.genre;
    let list= [];
    try{
        
        
        if(type && genre){
        list= await List.aggregate([
            {$match:{type: type, genre: genre}},
            {$sample: {size: 10}}
        ])
        }else if(type){
            list= await List.aggregate([
                {$match:{type: type}},
                {$sample: {size: 10}}
            ])
        }else{
            
            list= await List.aggregate([
                {$sample: {size: 2}}
            ])

        }
        res.status(200).json(list);
    }catch(err){

        res.status(500).json(err);
    }
})

module.exports= router;
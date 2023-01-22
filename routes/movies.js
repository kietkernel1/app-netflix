const router = require('express').Router();
const Movie = require('../models/Movie');
const verifyToken = require('../verify-token');

router.post("/upload", verifyToken, async (req, res)=>{
    if(!req.user.isAdmin){
        res.status(401).json("You not allow to upload movie")
        return;
    }
    try{
        const newMovie= new Movie(req.body);
        await newMovie.save();
        res.status(200).json("success!!");
    }catch(err){
        res.status(500).json(err);
    }
})

router.put("/update/:id", verifyToken, async (req, res)=>{
    if(!req.user.isAdmin){
        res.status(401).json("You not allow to update movie")
        return;
    }
    try{
        const movie= await Movie.findByIdAndUpdate(
            req.params.id,
            {$set: req.body},
            {new: true})
        res.status(200).json(movie);
    }catch(err){
        res.status(500).json(err);
    }
})

router.delete("/delete/:id", verifyToken, async (req, res)=>{
    if(!req.user.isAdmin){
        res.status(401).json("You not allow to update movie")
        return;
    }
    try{
        await Movie.findByIdAndDelete(req.params.id);
        res.status(200).json("This movie was deleted")
    }catch(err){
        res.status(500).json(err);
    }
})

router.get("/find/:id", verifyToken, async (req, res)=>{
    if(!req.user.isAdmin){
        res.status(401).json("You not allow to get this movie")
        return;
    }
    try{
        const movie= await Movie.findById(req.params.id);
        res.status(200).json(movie);
    }catch(err){
        res.status(500).json(err);
    }
})

router.get("/random", verifyToken, async (req, res)=>{
    if(!req.user.isAdmin){
        res.status(401).json("You not allow to update movie")
        return;
    }
    const type= req.query.type;
    try{
        if(type === "series"){
            const movie = await Movie.aggregate([
                {$match:{isSeries: true}},
                {$sample: {size: 1}}
            ])
            res.status(200).json(movie);
        }else{
            const movie = await Movie.aggregate([
                {$match:{isSeries: false}},
                {$sample: {size: 1}}
            ])
            res.status(200).json(movie);
        }
    }catch(err){
        res.status(500).json(err);
    }
})

router.get("/", verifyToken, async (req, res)=>{
    try{
        const query= req.query.new;
        const movieList= query? await Movie.find().limit(5).sort('-createdAt') : await Movie.find();
        res.status(200).json(movieList.reverse());
    }catch(err){
        res.status(500).json(err);
    }
})

module.exports= router;
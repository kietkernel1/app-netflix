const express = require("express");
const app= express();
const mongoose =require("mongoose");
const dotenv = require("dotenv");
const authRoute = require("./routes/auth");
const userRoute = require("./routes/users");
const movieRoute = require("./routes/movies");
const listRoute = require("./routes/lists");
const cookieParser = require("cookie-parser")


const cors = require("cors");

dotenv.config();
// ["https://client-netflix-8aaujho2e-kietkernel1.vercel.app","https://admin-netflix-iku2v7qw3-kietkernel1.vercel.app"]
app.use(cors({credentials: true, origin: "https://admin-netflix-iku2v7qw3-kietkernel1.vercel.app"}));

app.use(function (req, res, next){
    res.setHeader("Access-Control-Allow-Origin", ["https://client-netflix-8aaujho2e-kietkernel1.vercel.app","https://admin-netflix-iku2v7qw3-kietkernel1.vercel.app"])
    res.setHeader("Access-Control-Allow-Methods", 'GET, POST, OPTIONS, PUT, PATCH, DELETE')
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, x-requested-with")
    res.setHeader("Access-Control-Allow-Credentials", true)
    next()
})

app.use(cookieParser())

app.use(express.json())

app.use(express.urlencoded({ extended: true }))

mongoose.connect(process.env.MONGO_URL)
    .then(()=>{
        console.log("DB connection successfully!!")
    })
    .catch((err)=>{
        console.log(err);
    });
app.use("/api/auth", authRoute);

app.use("/api/users", userRoute);

app.use("/api/movies", movieRoute);

app.use("/api/list", listRoute);

app.listen(8000, ()=>{
    console.log("Backend server is running!!!")
});
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

app.use(cors({credentials: true, origin: ["https://admin-netflix.vercel.app/","https://client-netflix.vercel.app/"]}));



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
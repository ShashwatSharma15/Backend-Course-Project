import express from "express";
import cors from "cors"
import cookieParser from "cookie-parser";

const app = express();

// app.use(cors())
app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}))

//all kinds of forms, direct, json ,..
// we need limit on json files coming else server will crash
//express.json to config to accept json
// earlier json could not acccept. we needed body-parser. not now
//multer is used for file sharing
app.use(express.json({limit: "16kb"}))

//extended to get onbjects inside obejcts
app.use(express.urlencoded({extended: true, limit: "16kb"}))

//to make public folder, files, pdf, images to store in my server only
app.use(express.static("public"))

app.use(cookieParser()) 

export { app };

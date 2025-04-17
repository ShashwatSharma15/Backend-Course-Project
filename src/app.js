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

//extended to get objects inside obejcts
app.use(express.urlencoded({extended: true, limit: "16kb"}))

//to make public folder, files, pdf, images to store in my server only
app.use(express.static("public"))

app.use(cookieParser()) 


//routes import
import userRouter from "./routes/user.routes.js";

//routes declaration
// /user becomes prefix
// /api/v1 - imp, good industrial practice 
app.use("/api/v1/users", userRouter)

//  http://localhost:8000/users -> contol goes to /users
// router routes to eg /register
//so http://localhost:8000/users/register
// so finally http://localhost:8000/api/v1/users/register

export { app };

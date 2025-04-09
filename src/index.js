//not cool. neeche import yaha require :(
// require('dotenv').config()
// proper syntax
// require('dotenv').config({path: './env'})

import dotenv from "dotenv";
import connectDB from "./db/db_index.js";

dotenv.config({
  path: "./env",
});

connectDB();

/* 1st approach

import mongoose, { mongo } from "mongoose"
import {DB_NAME} from "./constants";

//approaach where app.js also in index So all app.listen and get also ni this file
import express from "express"
const app = express()

//1st approach
// function connectDB(){}
// connectDB()

//ifi - better
;( async () => {
    try{
        await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
        app.on("error", (error) =>{
            console.log("ERRR:", error)
            throw error
        })

        app.listen(process.env.PORT, () =>{
            console.log(`app is listening on port ${process.env.PORT}`);
        })
    }catch(error){
        console.error("Error: ", error)
        throw err
    }
})()
*/

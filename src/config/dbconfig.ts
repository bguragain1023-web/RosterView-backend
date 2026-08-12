import mongoose from "mongoose";

const MONGO_URL = process.env.MONGO_URL || "mongodb://localhost:27017/Rosterview"

export const connectDB = async ()=>{
    try {
        const conn = await mongoose.connect(MONGO_URL)
        conn && console.log("Database connected")
        

    } catch (error) {
        console.log(error)
    }
}


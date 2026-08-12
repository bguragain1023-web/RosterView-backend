import express from "express"
import cors from "cors"
import { connectDB } from "./config/dbconfig";

const app = express();
const PORT = process.env.PORT || 8000;

// connect mongodb
connectDB();



app.use(cors());
app.use(express.json())

app.listen(PORT,()=>{
   
    console.log(`Server is running at http://localhost:${PORT}`)
})
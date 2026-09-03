import "./types/express";
import express from "express";
import cors from "cors";
import { connectDB } from "./config/dbconfig";
import userRouter from "./routers/userRouter";
import { errorHandler } from "./middleware/errorHandler";
import clientRouter from "./routers/clientRouter";
import shiftRouter from "./routers/shiftRouter";
import swapShiftRouter from "./routers/swapShiftRouter";

const app = express();
const PORT = process.env.PORT || 8000;

app.use(cors());
app.use(express.json());

// connect mongodb
connectDB();

app.use("/api/v1/users", userRouter);
app.use("/api/v1/clients", clientRouter);
app.use("/api/v1/shifts", shiftRouter);
app.use("/api/v1/swapShift", swapShiftRouter);
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});

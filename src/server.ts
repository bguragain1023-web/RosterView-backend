import "dotenv/config";
import "./types/express";
import express from "express";
import cors from "cors";
import { connectDB } from "./config/dbconfig";
import userRouter from "./routers/userRouter";
import { errorHandler } from "./middleware/errorHandler";
import clientRouter from "./routers/clientRouter";
import shiftRouter from "./routers/shiftRouter";
import swapShiftRouter from "./routers/swapShiftRouter";
import teamRouter from "./routers/teamRouter";
import availabilityRouter from "./routers/availabilityRouter";
import leaveRequestRouter from "./routers/leaveRequestRouter";
import permissionRouter from "./routers/permissionRouter";
import { completePastShifts } from "./models/shift/shiftModel";

const app = express();
const PORT = process.env.PORT || 8000;

app.use(cors());
app.use(express.json());

app.use("/api/v1/users", userRouter);
app.use("/api/v1/clients", clientRouter);
app.use("/api/v1/shifts", shiftRouter);
app.use("/api/v1/swapShift", swapShiftRouter);
app.use("/api/v1/teams", teamRouter);
app.use("/api/v1/availability", availabilityRouter);
app.use("/api/v1/leaverequest", leaveRequestRouter);
app.use("/api/v1/permissions", permissionRouter);
app.use(errorHandler);

const ONE_HOUR = 60 * 60 * 1000;

// Keep shift statuses up to date: past assigned shifts become completed.
const runCompletePastShifts = async () => {
  try {
    const result = await completePastShifts();
    if (result.modifiedCount > 0) {
      console.log(`Marked ${result.modifiedCount} past shift(s) as completed`);
    }
  } catch (error) {
    console.error("Failed to complete past shifts:", error);
  }
};

// Only accept requests once the database is connected.
const start = async () => {
  try {
    await connectDB();
    // Once now (catches anything missed while the server was off), then hourly.
    await runCompletePastShifts();
    setInterval(runCompletePastShifts, ONE_HOUR);
    app.listen(PORT, () => {
      console.log(`Server is running at http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Failed to connect to MongoDB, server not started:", error);
    process.exit(1);
  }
};

start();

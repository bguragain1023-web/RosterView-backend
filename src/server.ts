import "./types/express";
import express from "express";
import cors from "cors";
import { connectDB } from "./config/dbconfig";
import userRouter from "./routers/userRouter";
import coordinatorRouter from "./routers/coordinatorRouter";
import adminRouter from "./routers/adminRouter";

import { auth } from "./middleware/authMiddleware";

import { errorHandler } from "./middleware/errorHandler";

const app = express();
const PORT = process.env.PORT || 8000;

app.use(cors());
app.use(express.json());

// connect mongodb
connectDB();

app.use("/api/v1/users", userRouter);
app.use(
  "/api/v1/coordinator",
  auth,

  coordinatorRouter,
);
app.use("/api/v1/admin", auth, adminRouter);
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});

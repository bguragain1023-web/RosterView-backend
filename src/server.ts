import express from "express";
import cors from "cors";
import { connectDB } from "./config/dbconfig";
import userRouter from "./routers/userRouter";
import coordinatorRouter from "./routers/coordinatorRouter";
import { requireCoordinate } from "./middleware/coordinatorAuth";
import { auth } from "./middleware/authMiddleware";
import { requirePermission } from "./middleware/permissionMiddleware";
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
  requirePermission("user", "approve"),
  coordinatorRouter,
);
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});

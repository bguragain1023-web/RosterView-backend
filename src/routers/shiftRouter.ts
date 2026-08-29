import express from "express";
import { auth } from "../middleware/authMiddleware";
import { requirePermission } from "../middleware/permissionMiddleware";
const router = express.Router();

//create user

router.post("/createuser", auth, requirePermission("shift", "create"));

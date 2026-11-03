import express from "express";
import { auth } from "../middleware/authMiddleware";
import { requirePermission } from "../middleware/permissionMiddleware";
import { fetchAllPermissions } from "../controllers/permissionController";

const router = express.Router();

// List every permission. Only staff managers need this (to grant permissions).
router.get("/", auth, requirePermission("user", "update"), fetchAllPermissions);

export default router;

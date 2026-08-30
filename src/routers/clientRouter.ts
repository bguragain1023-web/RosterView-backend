import express from "express";
import { auth } from "../middleware/authMiddleware";
import { requirePermission } from "../middleware/permissionMiddleware";
import { createClient, getClients } from "../controllers/clientController";
import { validateCreateClient } from "../middleware/validation/clientValidation";

const router = express.Router();

//create Client

router.post(
  "/createclient",
  auth,
  requirePermission("user", "create"),
  validateCreateClient,
  createClient,
);

router.get("/", auth, requirePermission("user", "read"), getClients);

export default router;

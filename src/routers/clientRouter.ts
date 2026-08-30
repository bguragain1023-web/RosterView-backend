import express from "express";
import { auth } from "../middleware/authMiddleware";
import { requirePermission } from "../middleware/permissionMiddleware";
import {
  createClient,
  getClients,
  getSingleClient,
  updateClient,
} from "../controllers/clientController";
import {
  validateCreateClient,
  ValidateUpdateClient,
} from "../middleware/validation/clientValidation";

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

router.get("/:id", auth, requirePermission("user", "read"), getSingleClient);

router.patch(
  "/updateclient/:id",
  auth,
  requirePermission("user", "update"),
  ValidateUpdateClient,
  updateClient,
);

export default router;

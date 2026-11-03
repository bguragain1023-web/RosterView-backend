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
  requirePermission("client", "create"),
  validateCreateClient,
  createClient,
);

router.get("/", auth, requirePermission("client", "read"), getClients);

router.get("/:id", auth, requirePermission("client", "read"), getSingleClient);

router.patch(
  "/updateclient/:id",
  auth,
  requirePermission("client", "update"),
  ValidateUpdateClient,
  updateClient,
);

export default router;

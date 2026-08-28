import express from "express";
import { auth } from "../middleware/authMiddleware";
import {
  validateCreateUser,
  validateUpdateUser,
} from "../middleware/validation/userValidation";
import {
  createUser,
  getUsers,
  loginUser,
  updateUser,
  updateUserPermission,
} from "../controllers/userController";
import { requirePermission } from "../middleware/permissionMiddleware";
import { validatePermissions } from "../middleware/validation/permissionValidation";

const router = express.Router();

//create user

router.post(
  "/createuser",
  auth,
  requirePermission("user", "create"),
  validateCreateUser,
  createUser,
);

// get users
router.get("/readuser", auth, requirePermission("user", "read"), getUsers);

//update Users
router.patch<{ id: string }>(
  "/updateuser/:id",
  auth,
  requirePermission("user", "update"),
  validateUpdateUser,
  updateUser,
);

//update Additional Permissions
router.patch<{ id: string }>(
  "/updateuser/:id/permissions",
  auth,
  requirePermission("user", "update"),
  validatePermissions,
  updateUserPermission,
);

//login
router.post("/login", loginUser);

export default router;

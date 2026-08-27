import express from "express";
import { generatePassword } from "../helper/generatePassword";
import { requirePermission } from "../middleware/permissionMiddleware";
import {
  validateCreateUser,
  validateUpdateUser,
} from "../middleware/validation/userValidation";
import { hashedPassword } from "../utlis/bcrypt";
import { getRoleByName } from "../models/role/roleModel";
import { AppError } from "../utlis/AppError";
import {
  addUser,
  getAllUsers,
  updateUserDetailById,
} from "../models/user/userModel";
import { getTeamByName } from "../models/team/teamModel";

const router = express.Router();

// create user

router.post(
  "/createuser",
  requirePermission("user", "create"),
  validateCreateUser,
  async (req, res, next) => {
    try {
      const tempPassword = generatePassword();

      const hashPassword = await hashedPassword(tempPassword);

      const userRole = await getRoleByName(req.body.role);
      console.log(userRole);
      if (!userRole) {
        throw new AppError("Role Not Found", 404);
      }
      const { role, ...rest } = req.body;
      console.log(rest);
      const userObj = {
        ...rest,
        password: hashPassword,
        roleId: userRole._id,
        mustChangePassword: true,
        additionalPermissions: [],
      };
      const user = await addUser(userObj);
      console.log(user);

      const { password, ...userDetail } = user.toObject();
      res.json({
        status: "success",
        message:
          " New staff added successfully with following detail : userName",
        userDetail,
        tempPassword,
      });
    } catch (error) {
      next(error);
    }
  },
);

router.get(
  "/readuser",
  requirePermission("user", "read"),
  async (req, res, next) => {
    try {
      const allUsers = await getAllUsers();
      console.log(allUsers);

      res.json({
        status: "success",
        message: "All user fetched",
        allUsers,
      });
    } catch (error) {
      next(error);
    }
  },
);

router.patch<{ id: string }>(
  "/updateuser/:id",
  requirePermission("user", "update"),
  validateUpdateUser,
  async (req, res, next) => {
    try {
      const { id } = req.params;
      const { role, team, ...rest } = req.body;

      let updateObj = { ...rest };
      if (!id) {
        throw new AppError("User id not found", 404);
      }

      if (role) {
        const roleUpdate = await getRoleByName(role);
        if (!roleUpdate) {
          throw new AppError("Role not found", 404);
        }

        updateObj.roleId = roleUpdate._id;
      }

      if (team) {
        const teamUpdate = await getTeamByName(team);
        if (!teamUpdate) {
          throw new AppError("Team not found ", 404);
        }

        updateObj.teamId = teamUpdate._id;
      }

      const result = await updateUserDetailById(id, updateObj);

      if (result.matchedCount === 0) {
        throw new AppError("User not found", 404);
      }

      res.json({
        status: "success",
        message: "user update successfully",
      });
    } catch (error) {
      next(error);
    }
  },
);
export default router;

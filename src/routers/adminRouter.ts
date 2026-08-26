import express from "express";
import { generatePassword } from "../helper/generatePassword";
import { requirePermission } from "../middleware/permissionMiddleware";
import { validateCreateUser } from "../middleware/validation/userValidation";
import { hashedPassword } from "../utlis/bcrypt";
import { getRoleByName } from "../models/role/roleModel";
import { AppError } from "../utlis/AppError";
import { addUser } from "../models/user/userModel";

const router = express.Router();

router.post(
  "/createuser",
  requirePermission("user", "create"),
  validateCreateUser,
  async (req, res, next) => {
    try {
      const tempPassword = generatePassword();
      console.log(tempPassword);
      const hashPassword = await hashedPassword(tempPassword);
      console.log(hashPassword);
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

export default router;

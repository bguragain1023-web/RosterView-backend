import express from "express";
import { comparePassword, hashedPassword } from "../utlis/bcrypt";
import { addUser, getUserbyEmail } from "../models/user/userModel";
import { signJwt } from "../utlis/jwt";
import { auth } from "../middleware/authMiddleware";
import { getRoleByName } from "../models/role/roleModel";
import { AppError } from "../utlis/AppError";
import { validateCreateUser } from "../middleware/validation/userValidation";

const router = express.Router();

//create temp post method for admin

router.post("/", validateCreateUser, async (req, res, next) => {
  try {
    const hashPassword = await hashedPassword(req.body.password);
    const { password: _, ...rest } = req.body;
    const role = await getRoleByName("admin");
    if (!role) {
      throw new AppError("Role Not Found", 404);
    }
    const userObj = {
      ...rest,
      password: hashPassword,
      roleId: role._id,
    };

    const user = await addUser(userObj);

    const { password, ...userDetail } = user.toObject();

    res.json({
      status: "success",
      message: "user created",
      userDetail,
    });
  } catch (error) {
    next(error);
  }
});

//login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (email && password) {
      const user = await getUserbyEmail(email);
      if (user) {
        const isMatched: boolean = await comparePassword(
          password,
          user.password,
        );

        if (isMatched) {
          const accessJWT: string = signJwt({
            email: user.email,
            id: user._id.toString(),
            roleId: user.roleId.toString(),
          });
          const { password, ...userDetail } = user.toObject();
          res.json({
            status: "success",
            message: " login succeefull",
            userDetail,
            accessJWT,
          });
          return;
        }
      }
    }
    res.json({
      status: "error",
      message: "Email or password didn't match",
    });
  } catch (error) {
    res.json({
      status: "error",
      message: error,
    });
  }
});

//get User

router.get("/", auth, async (req, res) => {
  try {
    res.json({
      status: "success",
      message: " User detail fetched successfully",
      user: req.userInfo,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Something went wrong";
    res.status(500).json({ status: "error", message });
  }
});

// get error
router.get("/testerror", (req, res) => {
  throw new AppError("This is a test Error", 400);
});

export default router;

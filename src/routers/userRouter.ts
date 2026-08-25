import express from "express";
import { comparePassword, hashedPassword } from "../utlis/bcrypt";
import { getUserbyEmail } from "../models/user/userModel";
import { signJwt } from "../utlis/jwt";
import { auth } from "../middleware/authMiddleware";

const router = express.Router();

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

export default router;

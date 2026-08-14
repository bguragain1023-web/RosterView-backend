import express from "express";
import { comparePassword, hashedPassword } from "../utlis/bcrypt";
import { addUser, getUserbyEmail } from "../models/user/userModel";
import { signJwt } from "../utlis/jwt";
import { auth } from "../middleware/authMiddleware";

const router = express.Router();

// add new staff
router.post("/", async (req, res) => {
  try {
    console.log(req.body);
    req.body.password = await hashedPassword(req.body.password);
    const user = await addUser(req.body);
    console.log(req.body.password);

    user?._id
      ? res.status(200).json({
          status: "success",
          message: " New worker added",
          user,
        })
      : res.json({
          status: "error",
          message: "Couldn't add user!! Please try agan later",
        });
  } catch (error) {
    res.json({
      status: "error",
      message: error,
    });
  }
});

//login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log(email);

    if (email && password) {
      const user = await getUserbyEmail(email);
      console.log(user);
      if (user) {
        const isMatched: Boolean = await comparePassword(
          password,
          user.password,
        );
        console.log(isMatched);
        if (isMatched) {
          const accessJWT: string = signJwt({
            email: user.email,
            id: user._id.toString(),
            role: user.role,
          });
          console.log(accessJWT);
          const { password, ...userDetail } = user.toObject();
          console.log(userDetail);
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

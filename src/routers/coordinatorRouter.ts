import express from "express";
import { hashedPassword } from "../utlis/bcrypt";
import { addUser } from "../models/user/userModel";

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

export default router;

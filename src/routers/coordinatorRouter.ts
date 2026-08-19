import express from "express";
import { hashedPassword } from "../utlis/bcrypt";
import { addUser, getAllUsers } from "../models/user/userModel";

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

router.get("/", async (req, res) => {
  try {
    const users = await getAllUsers();
    res.json({
      status: "success",
      message: users.length ? "All user fetched" : "No staffs found",
      users,
    });
    //get all user
    // send all users to frontend
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "something went wrong";
    res.status(500).json({
      status: "error",
      message: message,
    });
  }
});

export default router;

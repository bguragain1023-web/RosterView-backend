import express from "express";
import { hashedPassword } from "../utlis/bcrypt";
import { addUser, getAllUsers, updateUser } from "../models/user/userModel";
import { addNewShift } from "../models/shift/shiftModel";
import { calculateTotalHours } from "../helper/calculation";

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

//get all the staff
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
// update staff
router.patch("/:id", async (req, res) => {
  try {
    const updatedUser = await updateUser(req.params.id, req.body);
    if (!updateUser) {
      return res.status(404).json({
        status: "error",
        message: "User not found!!",
      });
    }
    res.json({
      status: "success",
      message: " User Updated successfully",
      user: updatedUser,
    });
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

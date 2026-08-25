import express from "express";

const router = express.Router();

router.get("/test", (req, res) => {
  try {
    console.log("permissions passed");
  } catch (error) {
    res.json({
      status: "error",
      message: "test error",
    });
  }
});

export default router;

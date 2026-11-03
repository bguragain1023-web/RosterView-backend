import mongoose from "mongoose";

export const connectDB = async () => {
  // Read when called, not on import, so .env has been loaded by then.
  const mongoUrl =
    process.env.MONGO_URL || "mongodb://localhost:27017/Rosterview";

  await mongoose.connect(mongoUrl);
  console.log("Database connected");
};

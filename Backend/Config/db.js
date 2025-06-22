import mongoose from "mongoose";

// connecting the mongoose
const ConnectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URL);
    console.log("MongoDb connected");
  } catch (err) {
    console.error("Error:", err);
    process.exit(1);
  }
};

export default ConnectDB;

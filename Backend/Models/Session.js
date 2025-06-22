import mongoose from "mongoose";

// creating the session schema
const SessionSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    subject: { type: String, required: true },
    date: { type: String, required: true },
    startTime: { type: String },
    endTime: { type: String },
    duration: { type: String },
    priority: {
      type: String,
      enum: ["high", "medium", "low"],
      default: "medium",
    },
   bookmarked: { type: Boolean, default: false },
   notes:{type: String},
    status: {
      type: String,
      enum: ["upcoming", "completed"],
      default: "upcoming",
    },
    topics:{type:String},
  },
  { timestamps: true }
);

// exporting the session Schema

export default mongoose.model("Session", SessionSchema);

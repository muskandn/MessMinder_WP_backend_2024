import mongoose from "mongoose";

const complaintSchema = mongoose.Schema(
  {
    userId: {
      type: String,
      ref: "user",
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    count: [
      {
        userId: {
          type: String,
          required: true,
        },
      },
    ],
    status: {
      type: String,
      enum: ["pending", "inProgess", "resolved", "confirmed", "rejected"],
      default:"pending"
    },
  },
  { timestamps: true, expires: 60 * 60 * 24 * 365 * 5 }
);

export default mongoose.model.complaints ||
  mongoose.model("complaint", complaintSchema);

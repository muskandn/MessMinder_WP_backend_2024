import mongoose from "mongoose";

const complaintSchema = mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.ObjectId,
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
          type: mongoose.Schema.ObjectId,
          ref: "user",
          required: true,
        },
        vote: {
          type: Number,
          enum:[1,-1],
          default: 0,
        },
      },
    ],
    noOfVotes:{
      type:Number,
      default: 0
    },
    status: {
      type: String,
      enum: ["pending", "inProgess", "resolved", "confirmed", "rejected"],
      default: "pending",
    },
  },
  { timestamps: true, expires: 60 * 60 * 24 * 365 * 5 }
);

export default mongoose.model.complaints ||
  mongoose.model("Complaint", complaintSchema);

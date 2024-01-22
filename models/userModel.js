import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: [true, "Provide Institute Email"],
      unique: [true, "Email already exists"],
    },

    userId: {
      type: String,
      required: [true, "Provide userId"],
      unique: [true, "userId already exists"],
    },

    password: {
      type: String,
      required: [true, "Provide password"],
    },

    role: {
      type: String,
      required: [true, "Provide role"],
    },

    name: {
      type: String,
      default: "",
    },

    gender: {
      type: String,
      default: "",
    },

    mobile: {
      type: Number,
      default: "",
    },

    hostel: {
      type: String,
      default: "",
    },

    room: {
      type: Number,
      default: "",
    },

    profilePic: {
      type: String,
      default: "",
    },

    idCard: {
      type: String,
      default: "",
    },
  },
  { timestamps: true, expires: 60 * 60 * 24 * 365 * 5 }
);

userSchema.index(
  { createdAt: 1 },
  { expireAfterSeconds: 60 * 60 * 24 * 365 * 5 }
);
export default mongoose.model.users || mongoose.model("user", userSchema);

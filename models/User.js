import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String },
    password: { type: String, required: true },
    role: { type: String, enum: ["user", "admin", "manager"], default: "user" },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    profileComplete: { type: Boolean, default: false },
    employeeCode: { type: String },
    designation: { type: String },
    process: { type: String },
    dateOfJoining: { type: String },
    shiftTiming: { type: String },
    workLocation: { type: String },
    currentCity: { type: String },
    systemServiceTag: { type: String },
    employmentType: { type: String },
    holdingAssets: { type: String },
    managerAssign: { type: String },
    profileImage: { type: String },
    customFields: {
      type: Map,
      of: String,
      default: {},
    },
  },
  { timestamps: true }
);

const User = mongoose.models.User || mongoose.model("User", userSchema);

export default User;

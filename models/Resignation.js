import mongoose from "mongoose";

const resignationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    managerEmail: {
      type: String,
      required: true,
    },
    resignationDate: {
      type: Date,
      default: Date.now,
      required: true,
    },
    lastWorkingDay: {
      type: Date,
      required: true,
    },
    noticePeriod: { // in days
      type: Number,
      required: true,
    },
    reason: {
      type: String,
      enum: ['Better Opportunity', 'Personal Reason', 'Higher Studies', 'Relocation', 'Health Issues', 'Others'],
      required: true,
    },
    otherReason: {
      type: String,
      // Required only if reason is 'Others'
      required: function() { return this.reason === 'Others'; }
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
  },
  { timestamps: true }
);

const Resignation = mongoose.models.Resignation || mongoose.model("Resignation", resignationSchema);

export default Resignation;

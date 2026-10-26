import mongoose from "mongoose";

// Fixed: Use mongoose.Schema instead of mongoose.model for sub-documents
const attendenceHitorySchema = new mongoose.Schema({
  date: {
    type: Date,
    default: Date.now,
  },
  action: { type: String, enum: ["CHECK_IN", "CHECK_OUT", "STATUS_CHANGE"] },
  status: {
    type: String,
    enum: ["Present", "Absent", "Half-day"],
  },
  changedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  reason: {
    type: String,
    required: true,
  },
});

const attendenceSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    status: {
      type: String,
      enum: ["Present", "Absent", "Half-day"],
      default: "Present",
    },
    checkInTime: { type: Date, default: null },
    checkOutTime: { type: Date, default: null },
    totalWorkingHours: { type: Number, default: 0 },
    history: [attendenceHitorySchema],
  },
  { timestamps: true },
);

attendenceSchema.index({ user: 1, date: 1 }, { unique: true });

const Attendence = mongoose.model("Attendence", attendenceSchema);

export default Attendence;

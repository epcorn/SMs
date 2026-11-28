import mongoose from "mongoose";

const attendenceHitorySchema = new mongoose.Schema({
  date: {
    type: Date,
    default: Date.now,
  },
  action: {
    type: String,
    enum: [
      "CHECK_IN",
      "MID_DAY",
      "MID_EVE",
      "CHECK_OUT",
      "AUTO_CHECK_OUT",
      "STATUS_CHANGE",
    ],
  },
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
  location: {
    type: { type: String, default: "Point" },
    coordinates: [Number],
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
    midDayTime: { type: Date, default: null },
    midEveningTime: { type: Date, default: null },
    totalWorkingHours: { type: Number, default: 0 },
    history: [attendenceHitorySchema],
  },
  { timestamps: true },
);

attendenceSchema.index({ user: 1 }, { unique: true });

const Attendence = mongoose.model("Attendence", attendenceSchema);

export default Attendence;

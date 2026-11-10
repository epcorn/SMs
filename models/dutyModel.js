import mongoose from "mongoose";

const dutySchema = new mongoose.Schema(
  {
    instruction: { type: String, required: true },
    startTime: { type: Date, required: true },
    endTime: { type: Date, required: true },
    status: {
      type: String,
      enum: ["Pending", "Completed", "Missed"],
      default: "Pending",
    },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    site: { type: mongoose.Schema.Types.ObjectId, ref: "Site" },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true, id: false },
    toObject: { virtuals: true, id: false },
  },
);
const Duty = mongoose.model("Duty", dutySchema);

export default Duty;

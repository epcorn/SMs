import mongoose from "mongoose";

const siteSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true },
    contractNumber: { type: String, default: "" },
    address: { type: String, required: true, unique: true },
    location: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
        required: true,
      },
      coordinates: {
        type: [Number], // [longitude, latitude] format is required by MongoDB!
        required: true,
      },
    },
    radius: { type: Number, default: 100 },
  },
  { timestamps: true },
);

siteSchema.index({ location: "2dsphere" });
const Site = mongoose.model("Site", siteSchema);

export default Site;

import mongoose from "mongoose";

const siteSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true },
    contractNumber: { type: String, unique: true },
    location: { type: String, required: true, unique: true },
    address: { type: String, required: true, unique: true },
    coords: { longitude: Number, latitude: Number },
  },
  { timestamps: true },
);

const Site = mongoose.model("Site", siteSchema);

export default Site;

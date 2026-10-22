import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const familyMemberSchema = new mongoose.Schema({
  name: { type: String, default: "N/A" },
  relation: { type: String, default: "N/A" },
  email: { type: String, default: "N/A" },
  phone: { type: String, default: "N/A" },
  emergency: { type: Boolean, default: false },
});

const bankDetailsSchema = new mongoose.Schema({
  name: { type: String, default: "N/A" },
  number: { type: String, default: "N/A" },
  IFSC: { type: String, default: "N/A" },
});

const salaryRecordSchema = new mongoose.Schema({
  amount: { type: Number, required: true },
  effectiveDate: { type: Date, default: Date.now },
  incrementAmount: { type: Number, default: 0 },
  reason: { type: String, default: "Annual Revision" },
});

const medicalRecordSchema = new mongoose.Schema({
  name: { type: String, default: "N/A" },
  number: { type: String, default: "N/A" },
  file: { type: String, default: "N/A" },
});

const advanceSchema = new mongoose.Schema({
  amount: { type: String },
  givenBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  date: { type: Date, default: Date.now },
});

const userSchema = new mongoose.Schema(
  {
    firstname: { type: String },
    middlename: { type: String },
    lastname: { type: String },
    gender: { type: String },
    email: { type: String, unique: true },
    password: { type: String, select: false },
    role: {
      type: String,
      enum: ["admin", "employee", "operator"],
      default: "employee",
    },
    photo: { type: String, default: "" },

    active: { type: Boolean, default: true },

    userType: { type: String, default: "" },
    dob: { type: Date },
    advance: [advanceSchema],
    currAddress: { type: String, default: "" },
    residAddress: { type: String, default: "" },
    bloodGroup: { type: String, default: "N/A" },

    site: { type: mongoose.Schema.Types.ObjectId, ref: "Site" },
    attendence: { type: mongoose.Schema.Types.ObjectId, ref: "Attendence" },

    salaryDetails: {
      currentSalary: { type: String, default: 0 },
      basicPay: { type: String, default: 0 },
      PT: { type: String, default: 0 },
      ESIC: { type: String, default: "" },
      UAN: { type: String, default: "" },
    },

    salaryHistory: [salaryRecordSchema],

    resume: { type: String },
    govtIds: { id: String, name: String },
    joiningDate: { type: Date, default: null },
    policeVerification: { type: String, default: "notDone" },

    medicalDetails: [medicalRecordSchema],
    familyDetails: [familyMemberSchema],
    bankDetails: [bankDetailsSchema],

    location: {
      type: { type: String, default: "Point" },
      coordinates: [Number],
    },
  },
  { timestamps: true },
);

userSchema.virtual("attendenceRecords", {
  ref: "Attendence",
  localField: "_id",
  foreignField: "user",
});

userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

userSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

userSchema.set("toObject", { virtuals: true, getters: true });
userSchema.set("toJSON", { virtuals: true, getters: true });
const User = mongoose.model("User", userSchema);

export default User;

async function createUser() {
  await User.create({
    firstname: "vipul",
    lastname: "gehlot",
    email: "vipulgehlot43@gmail.com",
    password: "12345",
    role: "admin",
  });
  console.log("usercreated");
}
// createUser();

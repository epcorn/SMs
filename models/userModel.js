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

const allowanceSchema = new mongoose.Schema({
  name: { type: String },
  amount: { type: Number },
  date: { type: Date, default: Date.now },
});

const medicalRecordSchema = new mongoose.Schema({
  name: { type: String, default: "N/A" },
  number: { type: String, default: "N/A" },
  file: { type: String, default: "N/A" },
});

const advanceSchema = new mongoose.Schema({
  amount: { type: String },
  note: { type: String },
  image: { type: String },
  givenBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  date: { type: Date, default: Date.now },
});

const educationSchema = new mongoose.Schema({
  degree: { type: String },
  institute: { type: String },
  image: { type: String },
  grade: { type: String },
});

const fcmTokenSchema = new mongoose.Schema(
  {
    deviceId: { type: String, required: true },
    token: { type: String, required: true },
    deviceName: { type: String, default: "Web Browser" },
    lastActive: { type: Date, default: Date.now },
  },
  { _id: false },
);

const addressFields = {
  l1: { type: String, default: "", trim: true },
  l2: { type: String, default: "", trim: true },
  l3: { type: String, default: "", trim: true },
  state: { type: String, default: "", trim: true },
  city: { type: String, default: "", trim: true },
  pincode: { type: String, default: "", trim: true },
};

const yesNoField = {
  status: {
    type: String,
    enum: ["yes", "no"],
    default: "no",
    lowercase: true,
    trim: true,
  },
  text: {
    type: String,
    default: "",
    trim: true,
  },
};

const userSchema = new mongoose.Schema(
  {
    firstname: { type: String },
    middlename: { type: String },
    lastname: { type: String },
    gender: {
      type: String,
      default: "",
      enum: ["male", "female", "other", ""],
    },
    religion: {
      type: String,
      default: "hindu",
      enum: [
        "hindu",
        "muslim",
        "christian",
        "sikh",
        "buddhist",
        "jain",
        "parsi",
        "jewish",
        "other",
      ],
    },
    email: { type: String, unique: true },
    phone: { type: String, unique: true },
    password: { type: String, select: false },
    role: {
      type: String,
      enum: ["admin", "employee", "operator"],
      default: "employee",
    },
    photo: { type: String, default: "" },

    department: { type: String, default: "" },
    active: { type: Boolean, default: true },

    userType: { type: String, default: "" },
    dob: { type: Date },
    advance: [advanceSchema],

    address: { present: addressFields, permanent: addressFields },
    bloodGroup: {
      type: String,
      default: "N/A",
      enum: ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-", "N/A"],
    },

    site: { type: mongoose.Schema.Types.ObjectId, ref: "Site" },
    attendence: { type: mongoose.Schema.Types.ObjectId, ref: "Attendence" },

    salaryDetails: {
      currentSalary: { type: String, default: 0 },
      basicPay: { type: String, default: 0 },
      PT: { type: String, default: 0 },
      ESIC: { type: String, default: "" },
      UAN: { type: String, default: "" },
      allowance: [allowanceSchema],
    },

    salaryHistory: [salaryRecordSchema],

    duty: {
      date: { type: Date, default: null },
      startTime: { type: String, default: "10:00", trim: true },
      endTime: { type: String, default: "19:00", trim: true },
      site: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Site",
        default: null,
      },
      instruction: { type: String, default: "", trim: true },
      updatedAt: { type: Date, default: null },
    },
    resume: { type: String },
    govtIds: {
      adhaar_number: String,
      adhaar_card: String,
      pan_number: String,
      pan_card: String,
      voter_number: String,
      voter_card: String,
    },

    joiningDate: { type: Date, default: null },
    policeVerification: { type: String, default: "notDone" },

    eduDetails: [educationSchema],
    medicalDetails: [medicalRecordSchema],
    familyDetails: [familyMemberSchema],
    bankDetails: [bankDetailsSchema],

    hospitalised: yesNoField,
    physically_disabled: yesNoField,
    political_conn: yesNoField,

    location: {
      type: { type: String, default: "Point" },
      coordinates: [Number],
    },

    //for push notification
    fcmTokens: {
      type: [fcmTokenSchema],
      default: [],
      select: false,
    },
    reminderSentOn: { type: Date, default: null },
    refreshTokens: { type: [String], select: false, default: [] },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

userSchema.virtual("attendenceRecords", {
  ref: "Attendence",
  localField: "_id",
  foreignField: "user",
});

userSchema.virtual("dutyRecords", {
  ref: "Duty",
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

userSchema.set("toObject", { virtuals: true, getters: true, id: false });
userSchema.set("toJSON", { virtuals: true, getters: true, id: false });

const User = mongoose.model("User", userSchema);

export default User;

async function createUser() {
  await User.create({
    firstname: "vipul",
    lastname: "gehlot",
    email: "vipulgehlot43@gmail.com",
    password: "nananana",
    role: "admin",
  });
  console.log("usercreated");
}
// createUser();

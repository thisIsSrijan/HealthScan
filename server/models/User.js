const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    default: "User",
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  password: {
    type: String,
    required: true,
  },
  age: {
    type: Number,
    required: true,
    min: 1,
  },
  gender: {
    type: String,
    enum: ["Male", "Female", "Other"],
    required: true,
  },
  height: {
    type: [Number], // Array to track height over time
    default: [],
  },
  weight: {
    type: [Number], // Array to track weight over time
    default: [],
  },
  allergies: {
    type: [String],
    default: [],
  },
  medicalConditions: {
    type: [String],
    default: [],
  },
  medications: {
    type: [String],
    default: [],
  },
  ABHA_Id : {
    type: Number,
    default: null,
    required: false,
  },
}, { timestamps: true });

const User = mongoose.model("User", userSchema);
module.exports = User;

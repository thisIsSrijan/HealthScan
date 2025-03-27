const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
  age: Number,
  allergies: [String],
  medicalConditions: [String],
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("User", UserSchema);

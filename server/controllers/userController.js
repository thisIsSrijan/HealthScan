const User = require("../models/User");

//Update basic user details (name, age, gender, height, weight)
exports.updateBasicDetails = async (req, res) => {
  try {
    const userId = req.user.userId; // Extract user ID from authenticated request
    // console.log("user : ", req.user);
    const { name, age, gender, height, weight } = req.body;

    let user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }

    // Update fields only if provided (Keep existing values if not updated)
    if (name) user.name = name;
    if (age) user.age = age;
    if (gender) user.gender = gender;
    if (height) user.height.push(height); // Append new height entry
    if (weight) user.weight.push(weight); // Append new weight entry

    await user.save();
    res.status(200).json({ message: "Basic details updated successfully.", user });
  } catch (error) {
    console.error("Error updating basic details:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

//Update medical history (allergies, medical conditions, medications)
exports.updateMedicalHistory = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { allergies, medicalConditions, medications } = req.body;

    let user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }

    // Update fields only if provided
    if (allergies) user.allergies = allergies;
    if (medicalConditions) user.medicalConditions = medicalConditions;
    if (medications) user.medications = medications;

    await user.save();
    res.status(200).json({ message: "Medical history updated successfully.", user });
  } catch (error) {
    console.error("Error updating medical history:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

exports.getUserDetails = async (req, res) => {
  try {
    const userId = req.user.userId; // Extract user ID from auth middleware
    const user = await User.findById(userId).select("-password"); // Exclude password from response

    if (!user) return res.status(404).json({ error: "User not found" });

    res.status(200).json({
      name: user.name,
      age: user.age,
      gender: user.gender,
      height: user.height, // Array of past height records
      weight: user.weight, // Array of past weight records
      bmiHistory: user.height.map((h, i) => ({
        height: h,
        weight: user.weight[i] || null, // Match height with corresponding weight entry
        bmi: h && user.weight[i] ? (user.weight[i] / (h * h)).toFixed(2) : null, // BMI formula
      })),
      allergies: user.allergies,
      medicalConditions: user.medicalConditions,
      medications: user.medications,
    });
  } catch (error) {
    console.error("Error fetching user details:", error);
    res.status(500).json({ error: "Server error fetching user data" });
  }
};
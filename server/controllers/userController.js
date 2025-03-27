const User = require("../models/User");

//Update basic user details (name, age, gender, height, weight)
exports.updateBasicDetails = async (req, res) => {
  try {
    const userId = req.user.id; // Extract user ID from authenticated request
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
    const userId = req.user.id;
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

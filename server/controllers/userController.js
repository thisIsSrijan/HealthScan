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

// Helper function to update user fields
// const updateUserField = async (req, res, field) => {
//   try {
//     const  id  = req.user.userId; // Assuming user ID is extracted from authentication middleware
//     const { value } = req.body;
//     // console.log("req.user : ", req.user);
//     // console.log("req.body : ", value);


//     if (!value) {
//       return res.status(400).json({ message: "Value is required" });
//     }
//         // Check if value already exists in the specified field
//         if (user[field] && user[field].includes(value)) {
//           return res.status(409).json({ message: `${value} already exists in ${field}` });
//         }

//     const update = { $addToSet: { [field]: value } }; // Prevents duplicate entries
//     const user = await User.findByIdAndUpdate(id, update, { new: true });
//     console.log("user : ", user);
    

//     if (!user) return res.status(404).json({ message: "User not found" });

//     res.status(200).json({ message: `${field} added successfully`, user });
//   } catch (error) {
//     res.status(500).json({ message: "Internal server error", error });
//   }
// };

const updateUserField = async (req, res, field) => {
  try {
    const id = req.user.userId; // Extract user ID from authentication middleware
    const { value } = req.body;

    if (!value) {
      return res.status(400).json({ message: "Value is required" });
    }

    // Fetch user data to check if value already exists
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if value already exists in the specified field
    if (user[field] && user[field].includes(value)) {
      return res.status(409).json({ message: `${value} already exists in ${field}` });
    }

    // Add the new value using $addToSet (to avoid duplicates)
    const updatedUser = await User.findByIdAndUpdate(
      id,
      { $addToSet: { [field]: value } },
      { new: true }
    );

    res.status(200).json({ message: `${field} added successfully`, user: updatedUser });
  } catch (error) {
    res.status(500).json({ message: "Internal server error", error });
  }
};


// Helper function to remove user fields
const removeUserField = async (req, res, field) => {
  try {
    const id  = req.user.userId;
    const { value } = req.body;
    // console.log(value);
    if (!value) {
      return res.status(400).json({ message: "Value is required" });
    }

    const update = { $pull: { [field]: value } }; // Removes the specific value
    const user = await User.findByIdAndUpdate(id, update, { new: true });

    if (!user) return res.status(404).json({ message: "User not found" });

    res.status(200).json({ message: `${field} removed successfully`, user });
  } catch (error) {
    res.status(500).json({ message: "Internal server error", error });
  }
};

// Add & Remove Allergies
exports.addAllergy = (req, res) => updateUserField(req, res, "allergies");
exports.removeAllergy = (req, res) => removeUserField(req, res, "allergies");

// Add & Remove Medical Conditions
exports.addMedicalCondition = (req, res) =>
  updateUserField(req, res, "medicalConditions");
exports.removeMedicalCondition = (req, res) =>
  removeUserField(req, res, "medicalConditions");

// Add & Remove Medications
exports.addMedication = (req, res) => updateUserField(req, res, "medications");
exports.removeMedication = (req, res) =>
  removeUserField(req, res, "medications");
const express = require("express");
const { updateBasicDetails, updateMedicalHistory } = require("../controllers/userController");
const userController = require("../controllers/userController");
const authMiddleware = require("../middleware/authMiddleware");
const { getUserDetails } = require("../controllers/userController");

const router = express.Router();

// Route to update basic user details (name, age, gender, height, weight)
router.patch("/update-basic", authMiddleware, updateBasicDetails);

// Route to update medical history (allergies, medical conditions, medications)
router.patch("/update-medical", authMiddleware, updateMedicalHistory);

// send real time data to frontend
router.get("/me", authMiddleware, getUserDetails);

// Route to update allergies
// Allergies Routes
router.patch("/allergies/add", authMiddleware, userController.addAllergy);
router.patch("/allergies/remove", authMiddleware, userController.removeAllergy);

// Medical Conditions Routes
router.patch("/conditions/add", authMiddleware, userController.addMedicalCondition);
router.patch("/conditions/remove", authMiddleware, userController.removeMedicalCondition);

// Medications Routes
router.patch("/medications/add", authMiddleware, userController.addMedication);
router.patch("/medications/remove", authMiddleware, userController.removeMedication);


module.exports = router;

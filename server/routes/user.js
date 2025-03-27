const express = require("express");
const { updateBasicDetails, updateMedicalHistory } = require("../controllers/userController");
const authMiddleware = require("../middlewares/authMiddleware");

const router = express.Router();

// Route to update basic user details (name, age, gender, height, weight)
router.patch("/update-basic", authMiddleware, updateBasicDetails);

// Route to update medical history (allergies, medical conditions, medications)
router.patch("/update-medical", authMiddleware, updateMedicalHistory);

module.exports = router;

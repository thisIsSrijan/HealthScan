const multer = require("multer");
const axios = require("axios");
const User = require("../models/User");

// Set max upload size (5MB)
const MAX_SIZE = 5 * 1024 * 1024; // 5MB

// Multer storage (in-memory)
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: MAX_SIZE },
}).single("image");

// External APIs
const GOOGLE_OCR_API = process.env.GOOGLE_OCR_API;
const AI_MODEL_API = process.env.AI_MODEL_API;

exports.uploadImage = async (req, res) => {
  try {
    upload(req, res, async (err) => {
      if (err) return res.status(400).json({ error: "File upload failed or exceeds size limit (5MB)." });
      if (!req.file) return res.status(400).json({ error: "No image provided." });

      const userId = req.user.id; // Assuming authentication middleware is used
      const user = await User.findById(userId).select("-password");
      if (!user) return res.status(404).json({ error: "User not found." });

      // Store user medical history in a temporary JSON
      const userMedicalHistory = {
        age: user.age,
        gender: user.gender,
        height: user.height,
        weight: user.weight,
        allergies: user.allergies,
        medicalConditions: user.medicalConditions,
        medications: user.medications,
      };

      // Convert image buffer to Base64
      const imageBase64 = req.file.buffer.toString("base64");

      // Step 1: Send image to Google OCR API for text extraction
      const ocrResponse = await axios.post(GOOGLE_OCR_API, {
        requests: [{
          image: { content: imageBase64 },
          features: [{ type: "TEXT_DETECTION" }]
        }]
      });

      if (!ocrResponse.data.responses || !ocrResponse.data.responses[0].fullTextAnnotation) {
        return res.status(500).json({ error: "Failed to extract text from image." });
      }

      const extractedText = ocrResponse.data.responses[0].fullTextAnnotation.text; // Extracted ingredients

      //------ NOTE: WE MAY SEND THE EXTRACTED TEXT AND USER MEDICAL HISTORY TO GROX API DIRECTLY IF MODEL IS NOT READY --------

      // Step 2: Send extracted ingredients + user medical history to AI Model API
      const aiResponse = await axios.post(AI_MODEL_API, {
        ingredients: extractedText,
        userMedicalHistory
      });

      if (!aiResponse.data || !aiResponse.data.analysis) {
        return res.status(500).json({ error: "AI model failed to analyze ingredients." });
      }

      // Step 3: Send AI response back to client
      res.status(200).json({
        message: "Analysis completed.",
        analysis: aiResponse.data.analysis
      });
    });
  } catch (error) {
    console.error("Error in uploadImage:", error);
    res.status(500).json({ error: "Server error during image processing." });
  }
};

const multer = require("multer");
const vision = require("@google-cloud/vision");
const User = require("../models/User");

const MAX_SIZE = 5 * 1024 * 1024; // 5MB limit

//in-memory storage instead of saving to uploads
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: MAX_SIZE },
}).single("image");

// const AI_MODEL_API = process.env.AI_MODEL_API;

//Google Vision API client
const client = new vision.ImageAnnotatorClient({
  keyFilename: "ingredient-scanner-ocr-service.json",
});

// Function to extract structured information from OCR text
const extractStructuredInfo = (text) => {
    const ingredientsPattern = /INGREDIENTS:([\s\S]*?)(?=NUTRITIONAL INFORMATION|CONTAINS)/i;
    const nutritionPattern = /NUTRITIONAL INFORMATION[\s\S]+?Per 100 g[\s\S]+?(Energy.*)/i;

    // Extract Ingredients
    const ingredientsMatch = text.match(ingredientsPattern);
    const ingredientsList = ingredientsMatch
        ? ingredientsMatch[1]
              .replace(/\n/g, " ") // Remove newlines inside ingredients
              .split(/,|\n/) // Split by comma or new line
              .map((item) => item.trim())
              .filter(Boolean)
        : [];

    // Extract Nutrition Information
    const nutritionMatch = text.match(nutritionPattern);
    const nutritionText = nutritionMatch ? nutritionMatch[1].replace(/\n/g, " ") : "";

    const nutritionData = {};
    const nutrientPattern = /([\w\s\-]+)\s*\(?(kcal|g|mg|%)?\)?\s*(\d+\.?\d*)?\s*(\d+\.?\d*)?\s*(\d+\.?\d*)?/gi;

    let match;
    while ((match = nutrientPattern.exec(nutritionText)) !== null) {
        const [_, nutrient, unit, per_100g, per_serving, rda] = match;

        // Store only if at least one value is found
        if (per_100g || per_serving || rda) {
            nutritionData[nutrient.trim()] = {
                unit: unit || "",
                per_100g: per_100g ? parseFloat(per_100g) : null,
                per_serving: per_serving ? parseFloat(per_serving) : null,
                rda_per_serving: rda ? parseFloat(rda) : null,
            };
        }
    }

    return {
        ingredients: ingredientsList,
        nutrition_info: nutritionData,
    };
};

exports.uploadImage = async (req, res) => {
  try {
    upload(req, res, async (err) => {
      if (err) return res.status(400).json({ error: "File upload failed or exceeds size limit (5MB)." });
      if (!req.file) return res.status(400).json({ error: "No image provided." });

      const userId = req.user.userId; // Assuming authentication middleware is used
      const user = await User.findById(userId).select("-password");
      if (!user) return res.status(404).json({ error: "User not found." });

      // const userMedicalHistory = {
      //   age: user.age,
      //   gender: user.gender,
      //   height: user.height,
      //   weight: user.weight,
      //   allergies: user.allergies,
      //   medicalConditions: user.medicalConditions,
      //   medications: user.medications,
      // };

      // Step 1: Use Google Vision API for OCR on the uploaded image
      const [result] = await client.textDetection(req.file.buffer);
      //extracted data from image
      const extractedText = result.textAnnotations.length ? result.textAnnotations[0].description : "No text found";

      const processedText = extractStructuredInfo(extractedText);

      // Step 2: PENDING Send extracted ingredients + user medical history to AI Model API
      // const aiResponse = await axios.post(AI_MODEL_API, {
      //   ingredients: processedText.ingredients,
      //   userMedicalHistory
      // });

      // if (!aiResponse.data || !aiResponse.data.analysis) {
      //   return res.status(500).json({ error: "AI model failed to analyze ingredients." });
      // }

      res.status(200).json({
        message: "Analysis completed.",
        analysis: processedText, //to test send extracted text
      });
    });
  } catch (error) {
    console.error("Error in uploadImage:", error);
    res.status(500).json({ error: "Server error during image processing." });
  }
};

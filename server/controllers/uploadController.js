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
// const extractStructuredInfo = (text) => {
//     const ingredientsPattern = /INGREDIENTS:([\s\S]*?)(?=NUTRITIONAL INFORMATION|CONTAINS)/i;
//     const nutritionPattern = /NUTRITIONAL INFORMATION[\s\S]+?Per 100 g[\s\S]+?(Energy.*)/i;

//     // Extract Ingredients
//     const ingredientsMatch = text.match(ingredientsPattern);
//     const ingredientsList = ingredientsMatch
//         ? ingredientsMatch[1]
//               .replace(/\n/g, " ") // Remove newlines inside ingredients
//               .split(/,|\n/) // Split by comma or new line
//               .map((item) => item.trim())
//               .filter(Boolean)
//         : [];

//     // Extract Nutrition Information
//     const nutritionMatch = text.match(nutritionPattern);
//     const nutritionText = nutritionMatch ? nutritionMatch[1].replace(/\n/g, " ") : "";

//     const nutritionData = {};
//     const nutrientPattern = /([\w\s\-]+)\s*\(?(kcal|g|mg|%)?\)?\s*(\d+\.?\d*)?\s*(\d+\.?\d*)?\s*(\d+\.?\d*)?/gi;

//     let match;
//     while ((match = nutrientPattern.exec(nutritionText)) !== null) {
//         const [_, nutrient, unit, per_100g, per_serving, rda] = match;

//         // Store only if at least one value is found
//         if (per_100g || per_serving || rda) {
//             nutritionData[nutrient.trim()] = {
//                 unit: unit || "",
//                 per_100g: per_100g ? parseFloat(per_100g) : null,
//                 per_serving: per_serving ? parseFloat(per_serving) : null,
//                 rda_per_serving: rda ? parseFloat(rda) : null,
//             };
//         }
//     }

//     return {
//         ingredients: ingredientsList,
//         nutrition_info: nutritionData,
//     };
// };

// Function to extract structured information from OCR text
const extractStructuredInfo = (text) => {
  // Patterns to extract different sections
  const ingredientsPattern = /INGREDIENTS:([\s\S]*?)(?=NUTRITIONAL INFORMATION|CONTAINS|ALLERGEN|STORE|$)/i;
  const allergenPattern = /CONTAINS\s([^.]*?)(?=\.|MAY|$)/i;
  const servingSizePattern = /\((\d+\s*g)\)/i;
  
  // Extract Ingredients
  const ingredientsMatch = text.match(ingredientsPattern);
  const ingredientsList = ingredientsMatch
      ? ingredientsMatch[1]
            .replace(/\n/g, " ")
            .split(/,(?=\s*[A-Z])/)  // Split by comma followed by uppercase letter
            .map((item) => item.trim())
            .filter(Boolean)
      : [];
  
  // Extract Allergen Info
  const allergenMatch = text.match(allergenPattern);
  const allergens = allergenMatch
      ? allergenMatch[1]
            .split(/,|\.|;/)
            .map(item => item.trim())
            .filter(Boolean)
      : [];
  
  // Extract serving size
  const servingSizeMatch = text.match(servingSizePattern);
  const servingSize = servingSizeMatch ? servingSizeMatch[1] : null;
  
  // Extract Nutrition Information
  let nutritionData = {};
  
  // First identify the nutrition section
  const nutritionSectionMatch = text.match(/NUTRITIONAL INFORMATION[\s\S]*$/i);
  
  if (nutritionSectionMatch) {
      const nutritionSection = nutritionSectionMatch[0];
      
      // Split the text into lines and normalize
      let lines = nutritionSection
          .split('\n')
          .map(line => line.trim())
          .filter(Boolean);
      
      // Find the nutrition data start line
      let dataStartIndex = 0;
      for (let i = 0; i < lines.length; i++) {
          if (/^Energy|^Calorie/i.test(lines[i])) {
              dataStartIndex = i;
              break;
          }
      }
      
      // Process the nutrition data
      // Use a more robust approach: look for nutrient lines followed by numeric values
      for (let i = dataStartIndex; i < lines.length; i++) {
          // Skip lines that are just numbers
          if (/^[\d.-]+$/.test(lines[i])) continue;
          
          // Skip lines that appear to be footnotes
          if (lines[i].startsWith('*')) continue;
          
          // Check if this is a nutrient line
          const nutrientMatch = lines[i].match(/^(-\s*)?([\w\s\-%]+?)(?:\s*\(([^)]+)\))?$/);
          if (!nutrientMatch) continue;
          
          const [_, indent, nutrient, unit] = nutrientMatch;
          
          // Now look ahead for numeric values (up to 3)
          const values = [];
          let j = i + 1;
          while (j < lines.length && values.length < 3) {
              if (/^[\d.-]+$/.test(lines[j])) {
                  // Convert to number or null if it's a dash
                  const value = lines[j] === '-' ? null : parseFloat(lines[j]);
                  values.push(value);
                  j++;
              } else {
                  // Stop if we hit a non-numeric, non-dash line
                  break;
              }
          }
          
          // Only process if we found any numeric values
          if (values.length > 0) {
              nutritionData[nutrient.trim()] = {
                  indent: Boolean(indent),
                  unit: unit || "",
                  per_100g: values[0] || null,
                  per_serve: values[1] || null,
                  rda_percentage: values[2] || null
              };
              
              // Skip the lines we've processed
              i = j - 1;
          }
      }
  }
  
  // Handle footnotes
  const footnotes = [];
  const footnotePattern = /\*([^*\n]+)/g;
  let footnoteMatch;
  
  while ((footnoteMatch = footnotePattern.exec(text)) !== null) {
      footnotes.push(footnoteMatch[1].trim());
  }
  
  return {
      ingredients: ingredientsList,
      allergens: allergens,
      serving_size: servingSize,
      nutrition_info: nutritionData,
      footnotes: footnotes
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

      const userMedicalHistory = {
        age: user.age,
        gender: user.gender,
        height: user.height,
        weight: user.weight,
        allergies: user.allergies,
        medicalConditions: user.medicalConditions,
        medications: user.medications,
      };

      // Step 1: Use Google Vision API for OCR on the uploaded image
      const [result] = await client.textDetection(req.file.buffer);
      //extracted data from image
      const extractedText = result.textAnnotations.length ? result.textAnnotations[0].description : "No text found";

      const processedText = extractStructuredInfo(extractedText);

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

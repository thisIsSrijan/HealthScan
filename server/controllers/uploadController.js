const multer = require("multer");
const vision = require("@google-cloud/vision");
const User = require("../models/User");
const { Groq } = require("groq-sdk");
const e = require("express");

const MAX_SIZE = 5 * 1024 * 1024; // 5MB limit

//in-memory storage instead of saving to uploads
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: MAX_SIZE },
}).single("image");


//Google Vision API client
const client = new vision.ImageAnnotatorClient({
  keyFilename: "ingredient-scanner-ocr-service.json",
});

// Groq API client
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
})

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

// Function to analyze ingredients using Groq API
// const analyzeWithGroq = async (ingredients, userMedicalHistory) => {
//   const prompt = `
//     You are a nutrition and health expert. 
//     Given the following ingredients: ${ingredients}, 
//     and a user with the following medical history: ${JSON.stringify(userMedicalHistory)},
//     provide a detailed analysis of whether these ingredients are safe, any potential risks, 
//     and recommendations for the user.
//   `;

//   const response = await groq.chat.completions.create({
//     model: "llama3-8b-8192", // Choose an available Groq model
//     messages: [{ role: "user", content: prompt }],
//   });

//   return response.choices[0].message.content;
// };

const analyzeWithGroq = async (extractedData, userMedicalHistory, processedText) => {
  const prompt = `
    You are an AI nutrition and health expert. Analyze the given extracted food data in relation to the user's medical history and return only a valid JSON object.  
    DO NOT include explanations, introductions, or any text outside JSON format.  

    *User Medical History:*  
    ${JSON.stringify(userMedicalHistory)}

    *Extracted Food Data:*  
    ${JSON.stringify(extractedData)}

    *Nutrition Information:*
    ${JSON.stringify(processedText.nutrition_info)}

    *Instructions:*  
    - Evaluate ingredient safety based on health concerns and categorize each as *"safe", **"caution", **"danger", or **"info"*.
    - For EVERY ingredient, provide a detailed "description" that explains what the ingredient is, its purpose in food, and its potential health effects.
    - If an ingredient is risky due to the user's allergies, add a *"warning"* field.
    - Provide *nutritional comments* based on \nutrition_info\ (e.g., high sugar, sodium, fat).
    - Determine an *overall rating*:
      - \"Safe"\ → If all ingredients are safe.
      - \"Caution"\ → If some ingredients raise concerns.
      - \"Danger"\ → If any ingredient is highly unsafe.
    - Assign *overallColor* based on \overallRating\:
      - \"Safe"\ → \"text-green-500 dark:text-green-400"\
      - \"Caution"\ → \"text-yellow-500 dark:text-yellow-400"\
      - \"Danger"\ → \"text-red-500 dark:text-red-400"\
    - Include the complete nutrition_info in your response.

    *Output Format (Strict JSON)*:  
    \\\`json
    {
      "overallRating": "Caution",
      "overallColor": "text-yellow-500 dark:text-yellow-400",
      "userSpecificWarning": "Contains soy and wheat (you have a soy allergy)",
      "ingredients": [
        {
          "name": "Refined Wheat Flour (Maida)",
          "safety": "caution",
          "description": "Highly processed flour with minimal fiber and nutrients, may impact blood sugar levels. It is made by grinding wheat grains after removing the bran and germ, resulting in a fine, white flour that is commonly used in baked goods."
        },
        {
          "name": "Soy",
          "safety": "danger",
          "description": "A common allergen that can cause severe reactions in sensitive individuals. Soy is a legume that contains complete protein and is used as an emulsifier, protein filler, and flavor enhancer in many processed foods.",
          "warning": "You have a soy allergy listed in your profile."
        },
        {
          "name": "High Fructose Corn Syrup",
          "safety": "caution",
          "description": "A sweetener that may contribute to weight gain and metabolic issues when consumed in excess. It is made from corn starch and contains more fructose than regular corn syrup, which may metabolize differently in the body than other sugars."
        }
      ],
      "nutritionalComments": [
        "High in total fat and saturated fat, which may not be ideal for heart health.",
        "Contains added sugars above recommended daily intake.",
        "High sodium content, which may impact blood pressure."
      ],
      "nutrition_info": {
        "Energy": {
          "unit": "kcal",
          "per_100g": 250,
          "per_serve": 125,
          "rda_percentage": 10
        },
        "Total Fat": {
          "unit": "g",
          "per_100g": 15,
          "per_serve": 7.5,
          "rda_percentage": 20
        },
        "Saturated Fat": {
          "unit": "g",
          "per_100g": 5,
          "per_serve": 2.5,
          "rda_percentage": 25
        },
        "Trans Fat": {
          "unit": "g",
          "per_100g": 0.2,
          "per_serve": 0.1,
          "rda_percentage": null
        },
        "Cholesterol": {
          "unit": "mg",
          "per_100g": 30,
          "per_serve": 15,
          "rda_percentage": 10
        },
        "Sodium": {
          "unit": "mg",
          "per_100g": 500,
          "per_serve": 250,
          "rda_percentage": 22
        },
        "Carbohydrates": {
          "unit": "g",
          "per_100g": 50,
          "per_serve": 25,
          "rda_percentage": 18
        },
        "Sugars": {
          "unit": "g",
          "per_100g": 20,
          "per_serve": 10,
          "rda_percentage": 35
        },
        "Protein": {
          "unit": "g",
          "per_100g": 10,
          "per_serve": 5,
          "rda_percentage": 12
        },
        "Fiber": {
          "unit": "g",
          "per_100g": 3,
          "per_serve": 1.5,
          "rda_percentage": 10
        },
        "Calcium": {
          "unit": "mg",
          "per_100g": 120,
          "per_serve": 60,
          "rda_percentage": 15
        },
        "Iron": {
          "unit": "mg",
          "per_100g": 2.5,
          "per_serve": 1.2,
          "rda_percentage": 18
        }
      }
    }
    \\\`

    IMPORTANT: 
    1. EVERY ingredient MUST have a detailed description explaining what it is and its effects, regardless of safety level.
    2. Include the complete nutrition_info from the provided data.
    3. Return only the JSON object above. Do not include any additional text.  
  `;

  const response = await groq.chat.completions.create({
    model: "llama3-8b-8192",
    messages: [{ role: "user", content: prompt }],
  });

  try {
    // Extract the JSON part of the response
    const jsonString = response.choices[0].message.content.trim();
    const parsedResponse = JSON.parse(jsonString);
    
    // If nutrition_info wasn't included in the AI response, add it directly from processedText
    if (!parsedResponse.nutrition_info && processedText && processedText.nutrition_info) {
      parsedResponse.nutrition_info = processedText.nutrition_info;
    }
    
    return parsedResponse;
  } catch (error) {
    console.error("Failed to parse Groq response:", error, "Response:", response.choices[0].message.content);
    return { 
      error: "Invalid AI response format",
      nutrition_info: processedText ? processedText.nutrition_info : {}
    };
  }
};

// Function to handle image upload and analysis

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

      //------------Step 3: Send data to Groq AI Model for analysis-------------
      const groqResponse = await analyzeWithGroq(extractedText, userMedicalHistory,processedText);

      res.status(200).json({
        // message: "Analysis completed.",
        // extracted_data: processedText, //to test send extracted text
        groqResponse, //to test send extracted text
      });
    });
  } catch (error) {
    console.error("Error in uploadImage:", error);
    res.status(500).json({ error: "Server error during image processing." });
  }
};

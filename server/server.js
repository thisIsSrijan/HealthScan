const express = require("express");
const multer = require("multer");
const vision = require("@google-cloud/vision");
const cors = require("cors");
const fs = require("fs");
const dotenv = require("dotenv");

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());


const upload = multer({ dest: "uploads/" });


const client = new vision.ImageAnnotatorClient({
  keyFilename: "ingredient-scanner-ocr-service.json", 
});

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

// API Endpoint for uploaded image
app.post("/ocr", upload.single("image"), async (req, res) => {
// app.post("/ocr", async (req, res) => {

  try {

    const filePath = req.file.path;
    // const [result] = await client.textDetection(filePath);
    // const extractedText = result.textAnnotations.length ? result.textAnnotations[0].description : "No text found";

    const extractedText = `INGREDIENTS: RICE GRITS, SEASONING (REFINED PALMOLEIN,
SUGAR, "SPICES AND CONDIMENTS, IODIZED SALT, REFINED
WHEAT FLOUR (MAIDA), BLACK SALT, TAMARIND POWDER,
NATURE IDENTICAL FLAVOURING SUBSTANCES, TOMATO
POWDER (0.3%), JAGGERY POWDER, NATURAL FLAVOURS AND
NATURAL FLAVOURING SUBSTANCES AND HYDROLYZED
VEGETABLE PROTEIN), REFINED PALMOLEIN, DEGERMED CORN
GRITS AND BENGAL GRAM GRITS.
USED AS FLAVOURING AGENTS.
CONTAINS SOY, WHEAT. MAY CONTAIN MILK.
DO NOT BUY THE PACK IF FOUND TAMPERED WITH.
STORE IN A COOL, DRY AND HYGIENIC PLACE.
NUTRITIONAL INFORMATION (Approx. Values)
Per Serve"
%RDA
Per 100 g
(20 g)
per serve
Energy (kcal)
527
105
5.3
Protein (g)
6.4
1.3
Carbohydrate (g)
60.5
12.1
-Total Sugars (g)
7.0
1.4
-Added Sugars (g)
5.5
1.1
2.2
Total fat (g)
29.5
5.9
8.8
-Trans fat (g)
0.1
0.02
1.0
-Saturated fat (g)
13.8
2.8
12.5
Sodium (mg)
792.1
158.4
7.9
*Other than naturally occurring trans fat`

    // Cleanup
    fs.unlinkSync(filePath);

    const processedText = extractStructuredInfo(extractedText);
    res.json({ processedText });
    // res.json({ extractedText });

  } catch (error) {

    console.error("OCR Error:", error);
    res.status(500).json({ error: "Failed to process image" });

  }

});


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

const express = require("express");
const multer = require("multer");
const Product = require("../models/Product");

const router = express.Router();

// Multer storage
const storage = multer.memoryStorage();
const upload = multer({ storage });

router.post("/", upload.single("image"), async (req, res) => {
  try {
    const imageBuffer = req.file.buffer;
    const newProduct = new Product({ imageUrl: "stored-later", extractedIngredients: [], analysisResult: "" });
    await newProduct.save();
    res.status(201).json({ message: "Image uploaded successfully" });
  } catch (error) {
    res.status(500).json({ error: "Upload failed" });
  }
});

module.exports = router;

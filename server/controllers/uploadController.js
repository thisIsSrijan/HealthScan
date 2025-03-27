const multer = require("multer");
const Product = require("../models/Product");

// Set max file size to 5MB (5 * 1024 * 1024 bytes)
const MAX_FILE_SIZE = 5 * 1024 * 1024; 

// Multer storage (in-memory) with size limit
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: MAX_FILE_SIZE },
}).single("image");

exports.uploadImage = async (req, res) => {
  try {
    upload(req, res, async (err) => {
      if (err) {
        // Handle Multer errors
        if (err.code === "LIMIT_FILE_SIZE") {
          return res.status(400).json({ error: "File size exceeds the 5MB limit" });
        }
        return res.status(500).json({ error: "Upload failed" });
      }

      if (!req.file) {
        return res.status(400).json({ error: "No image uploaded" });
      }

      const imageBuffer = req.file.buffer;

      const newProduct = new Product({
        imageUrl: "stored-later",
        extractedIngredients: [],
        analysisResult: "",
      });

      await newProduct.save();

      res.status(201).json({ message: "Image uploaded successfully" });
    });
  } catch (error) {
    res.status(500).json({ error: "Upload failed" });
  }
};

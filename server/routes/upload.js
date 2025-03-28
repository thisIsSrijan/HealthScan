const express = require("express");
const { uploadImage } = require("../controllers/uploadController");
const authMiddleware = require("../middleware/authMiddleware");
const multer = require("multer");

// const upload = multer({ dest: "uploads/" }); // Temporary storage for uploaded files

const router = express.Router();

// router.post("/", authMiddleware, upload.single("image"), uploadImage);
router.post("/", authMiddleware, uploadImage)

module.exports = router;

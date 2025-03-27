const express = require("express");
const { chatWithBot } = require("../controllers/chatbotController");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/", authMiddleware, chatWithBot);

module.exports = router;

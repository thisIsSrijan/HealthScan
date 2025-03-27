const express = require("express");
const axios = require("axios");

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const { message } = req.body;
    const response = await axios.post("http://localhost:5001/chatbot", { message });
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: "Chatbot error" });
  }
});

module.exports = router;

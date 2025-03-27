const axios = require("axios");

exports.chatWithBot = async (req, res) => {
  try {
    const { message } = req.body;
    const response = await axios.post("http://localhost:5001/chatbot", { message }); //dummy for now,
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: "Chatbot error" });
  }
};

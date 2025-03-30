const User = require("../models/User");
const { Groq } = require("groq-sdk");

exports.chatWithBot = async (req, res) => {
  const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY,
  });

  try {
    const userId = req.user.userId; // Assuming authentication middleware is used
    const user = await User.findById(userId).select("-password");
    if (!user) return res.status(404).json({ error: "User not found." });

    const { message } = req.body;
    if (!message || message.trim() === "") {
      return res.status(400).json({ error: "Message cannot be empty" });
    }

    // Enhanced system prompt with structured response instructions and HTML formatting
    const systemPrompt = `You are a smart medical assistant chatbot. Your responses must be structured in JSON format with the following keys:
    
{
  "overview": "A brief summary of the advice.",
  "warnings": [
    {
      "drugCombination": "The specific drug combination or medical interaction that is harmful.",
      "reason": "Explanation why it is harmful.",
      "recommendation": "Suggested alternative or action."
    }
  ],
  "advice": "General advice and instructions.",
  "references": "Supporting references if applicable."
}

Please use HTML color tags in your response:
- For warnings: wrap any warning text in <span style="color: red;">...</span>.
- For safe recommendations: wrap safe advice text in <span style="color: green;">...</span>.

Below is the user's medical profile:
Age: ${user.age}
Gender: ${user.gender}
Height: ${user.height}
Weight: ${user.weight}
Allergies: ${user.allergies.join(", ") || "None reported"}
Medical Conditions: ${user.medicalConditions.join(", ") || "None reported"}
Medications: ${user.medications.join(", ") || "None"}

Provide a response to the user's message using the above structure and instructions.`;

    // CALL: Groq with structured context
    const completion = await groq.chat.completions.create({
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: message }
      ],
      model: "llama3-8b-8192",
      temperature: 0.5,
      max_tokens: 2048,
    });

    const groqResponse = completion.choices[0]?.message?.content || "No response received.";

    // Optional: You could parse the JSON here to further handle each section if needed.
    // For now, we'll simply return the formatted response.
    console.log("Groq Response:", groqResponse);

    res.json({
      message: groqResponse
    });

  } catch (error) {
    console.error("Chatbot error:", error);
    res.status(500).json({ error: "Failed to process your request. Please try again." });
  }
};

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

    // Format user medical history for context
    const userMedicalHistory = {
      age: user.age,
      gender: user.gender,
      height: user.height,
      weight: user.weight,
      allergies: user.allergies,
      medicalConditions: user.medicalConditions,
      medications: user.medications,
    };
    
    // Create a system prompt that includes medical context
    const systemPrompt = `You are a medical assistant chatbot. Here is the user's medical profile:
    Age: ${userMedicalHistory.age}
    Gender: ${userMedicalHistory.gender}
    Height: ${userMedicalHistory.height}
    Weight: ${userMedicalHistory.weight}
    Allergies: ${userMedicalHistory.allergies.join(", ") || "None reported"}
    Medical Conditions: ${userMedicalHistory.medicalConditions.join(", ") || "None reported"}
    Medications: ${userMedicalHistory.medications.join(", ") || "None"}
    
    Based on this information, provide relevant medical insights when responding to their questions. 
    When they describe symptoms, analyze potential issues considering their medical history.
    If you detect concerning symptoms or medication issues, include a structured analysis with:
    - Extracted symptoms and medications
    - Severity assessment (Low, Moderate, High)
    - Potential risks including medication interactions, allergy warnings, and condition concerns
    - Recommendations with priority levels
    
    Important: Always include appropriate medical disclaimers and encourage seeking professional medical advice for serious concerns.`;
    
    // CALL: Groq with context
    const completion = await groq.chat.completions.create({
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: message }
      ],
      model: "llama3-8b-8192", 
      temperature: 0.5,
      max_tokens: 2048,
    });
    
    const groqResponse = completion.choices[0]?.message?.content || "Sorry, I couldn't process your request.";
    
    // Try to extract structured medical analysis if present in the response
    let analysisResults = null;
    try {
      // Check if the response contains structured medical analysis
      if (groqResponse.includes("Medical Analysis") || 
          groqResponse.includes("Severity") || 
          groqResponse.includes("Recommendations")) {
        
        // Parse symptoms, medications, and other entities from the response
        const symptoms = extractEntities(groqResponse, "symptoms");
        const medications = extractEntities(groqResponse, "medications");
        const severityLevel = extractSeverity(groqResponse);
        
        // Extract risk factors
        const medicationInteractions = extractRisks(groqResponse, "medication interactions");
        const allergyWarnings = extractRisks(groqResponse, "allergies");
        const conditionConcerns = extractRisks(groqResponse, "conditions");
        
        // Extract recommendations
        const recommendations = extractRecommendations(groqResponse);
        
        // Standard disclaimers
        const disclaimers = [
          "This analysis is not a medical diagnosis.",
          "The information provided is for informational purposes only.",
          "Always consult with a healthcare professional for medical advice.",
          "In case of emergency, contact emergency services immediately."
        ];
        
        // Create structured analysis results
        analysisResults = {
          analysisId: generateAnalysisId(),
          timestamp: new Date().toISOString(),
          severityLevel: severityLevel,
          extractedEntities: {
            symptoms: symptoms,
            medications: medications
          },
          riskAnalysis: {
            medicationInteractions: medicationInteractions,
            allergyWarnings: allergyWarnings,
            conditionConcerns: conditionConcerns
          },
          recommendations: recommendations,
          disclaimers: disclaimers
        };
      }
    } catch (analysisError) {
      console.error("Error creating analysis:", analysisError);
      // Continue without analysis if parsing fails
    }
    
    // Send both the text response and structured analysis if available
    res.json({
      message: groqResponse,
      analysisResults: analysisResults
    });
    
  } catch (error) {
    console.error("Chatbot error:", error);
    res.status(500).json({ error: "Failed to process your request. Please try again." });
  }
};

// Helper functions for extracting structured data
function extractEntities(text, entityType) {
  // Simple extraction logic - would be more sophisticated in production
  const entities = [];
  const lines = text.split('\n');
  
  let inSection = false;
  for (const line of lines) {
    const lowerLine = line.toLowerCase();
    
    // Check if we're entering a relevant section
    if (lowerLine.includes(entityType.toLowerCase())) {
      inSection = true;
      continue;
    }
    
    // Check if we're leaving the section
    if (inSection && (lowerLine.includes("risk") || lowerLine.includes("recommendation") || lowerLine.includes("concern"))) {
      inSection = false;
    }
    
    // Extract entity if in relevant section
    if (inSection && line.trim().startsWith('-')) {
      const entity = line.trim().substring(1).trim();
      if (entity) entities.push(entity);
    }
  }
  
  return entities.length > 0 ? entities : [];
}

function extractSeverity(text) {
  const severityKeywords = {
    high: ["high severity", "severe", "serious", "urgent", "critical"],
    moderate: ["moderate severity", "mild", "medium"],
    low: ["low severity", "minor"]
  };
  
  const lowerText = text.toLowerCase();
  
  for (const [level, keywords] of Object.entries(severityKeywords)) {
    for (const keyword of keywords) {
      if (lowerText.includes(keyword)) {
        return level.charAt(0).toUpperCase() + level.slice(1);
      }
    }
  }
  
  return "Low"; // Default severity
}

function extractRisks(text, riskType) {
  const risks = [];
  const lines = text.split('\n');
  
  let inSection = false;
  for (const line of lines) {
    const lowerLine = line.toLowerCase();
    
    // Check if we're entering a relevant section
    if (lowerLine.includes(riskType.toLowerCase())) {
      inSection = true;
      continue;
    }
    
    // Check if we're leaving the section
    if (inSection && (
      lowerLine.includes("recommendation") || 
      (riskType !== "allergies" && lowerLine.includes("allerg")) ||
      (riskType !== "medication interactions" && lowerLine.includes("medication")) ||
      (riskType !== "conditions" && lowerLine.includes("condition"))
    )) {
      inSection = false;
    }
    
    // Extract risk if in relevant section
    if (inSection && line.trim().startsWith('-')) {
      const riskText = line.trim().substring(1).trim();
      if (riskText) {
        // Determine severity
        let severity = "Moderate";
        if (riskText.toLowerCase().includes("high") || 
            riskText.toLowerCase().includes("severe") || 
            riskText.toLowerCase().includes("serious")) {
          severity = "High";
        } else if (riskText.toLowerCase().includes("low") || 
                  riskText.toLowerCase().includes("minor")) {
          severity = "Low";
        }
        
        risks.push({
          severity: severity,
          description: riskText
        });
      }
    }
  }
  
  return risks;
}

function extractRecommendations(text) {
  const recommendations = [];
  const lines = text.split('\n');
  
  let inSection = false;
  for (const line of lines) {
    const lowerLine = line.toLowerCase();
    
    // Check if we're entering the recommendations section
    if (lowerLine.includes("recommendation")) {
      inSection = true;
      continue;
    }
    
    // Check if we're leaving the section
    if (inSection && lowerLine.includes("disclaimer")) {
      inSection = false;
    }
    
    // Extract recommendation if in relevant section
    if (inSection && line.trim().startsWith('-')) {
      const recText = line.trim().substring(1).trim();
      if (recText) {
        // Determine priority
        let priority = "Normal";
        if (recText.toLowerCase().includes("urgent") || 
            recText.toLowerCase().includes("immediately") || 
            recText.toLowerCase().includes("emergency")) {
          priority = "Urgent";
        } else if (recText.toLowerCase().includes("important") || 
                  recText.toLowerCase().includes("soon") ||
                  recText.toLowerCase().includes("necessary")) {
          priority = "Important";
        }
        
        // Split into action and reasoning if possible
        let action = recText;
        let reasoning = "";
        
        if (recText.includes(":")) {
          [action, reasoning] = recText.split(":", 2);
        } else if (recText.includes(" - ")) {
          [action, reasoning] = recText.split(" - ", 2);
        } else if (recText.includes(" because ")) {
          [action, reasoning] = recText.split(" because ", 2);
          reasoning = "because " + reasoning;
        }
        
        recommendations.push({
          priority: priority,
          action: action.trim(),
          reasoning: reasoning.trim() || "Based on your medical profile and symptoms."
        });
      }
    }
  }
  
  return recommendations.length > 0 ? recommendations : [
    {
      priority: "Normal",
      action: "Continue monitoring your symptoms",
      reasoning: "Your symptoms don't appear to require immediate attention based on the information provided."
    }
  ];
}

function generateAnalysisId() {
  return 'MED' + Math.random().toString(36).substring(2, 8).toUpperCase();
}
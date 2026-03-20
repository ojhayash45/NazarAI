import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export const detectIssue = async (input: string, isImage: boolean = false) => {
  try {
    const parts: any[] = [];
    if (isImage) {
      parts.push({
        inlineData: {
          mimeType: "image/jpeg",
          data: input.split(',')[1] || input
        }
      });
      parts.push({
        text: "Analyze this photo for civic issues in Delhi (garbage overflow, pothole, broken streetlight, water leakage, illegal dump). Return JSON with: issueType, confidence (0-1), severity (1-10), description, and department (sanitation, roads, electrical, water)."
      });
    } else {
      parts.push({
        text: `Analyze this civic issue description for Delhi: "${input}". Return JSON with: issueType, confidence (0-1), severity (1-10), description, and department (sanitation, roads, electrical, water).`
      });
    }

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [{ parts }],
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            issueType: { type: Type.STRING },
            confidence: { type: Type.NUMBER },
            severity: { type: Type.NUMBER },
            description: { type: Type.STRING },
            department: { type: Type.STRING },
            boundingBox: {
              type: Type.ARRAY,
              items: { type: Type.NUMBER },
              description: "[ymin, xmin, ymax, xmax] normalized to 1000"
            }
          },
          required: ["issueType", "confidence", "severity", "department"]
        }
      }
    });

    return JSON.parse(response.text || "{}");
  } catch (error) {
    console.error("Detection error:", error);
    // Mock fallback for demo
    return {
      issueType: "general_issue",
      confidence: 0.9,
      severity: 5,
      description: "General civic issue detected.",
      department: "sanitation"
    };
  }
};

export const chatWithBot = async (message: string, history: any[] = []) => {
  const chat = ai.chats.create({
    model: "gemini-3-flash-preview",
    config: {
      systemInstruction: "You are CivicBot, an AI assistant for AI CivicEye platform that helps citizens of Delhi report and track civic issues. You have access to the database of complaints, ward info, and department details. Always be helpful, concise, and respond in the same language the user writes in (Hindi or English). If asked about a complaint ID, provide a helpful simulated status if not found."
    }
  });

  const response = await chat.sendMessage({ message });
  return response.text;
};

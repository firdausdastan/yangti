import { GoogleGenAI } from "@google/genai";

const getAiClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    console.error("API Key not found in environment variables");
    // We return null and handle it in the UI to show a warning or mock behavior
    return null;
  }
  return new GoogleGenAI({ apiKey });
};

export const generateScript = async (topic: string): Promise<string> => {
  const ai = getAiClient();
  if (!ai) return "Error: No API Key configured.";

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Write a short, engaging video script for a whiteboard animation about: "${topic}". 
      Keep it under 100 words. Format it as raw text suitable for a narrator.`,
    });
    return response.text || "Could not generate script.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Error generating script. Please try again.";
  }
};

export const generateSceneIdeas = async (script: string): Promise<Array<{ text: string, visualDescription: string }>> => {
  const ai = getAiClient();
  if (!ai) return [];

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Analyze this script: "${script}".
      Break it down into 3-5 key scenes for a whiteboard animation.
      Return a JSON array where each object has:
      - "text": A short phrase from the script to display on screen.
      - "visualDescription": A description of a simple icon or image to represent this part.
      
      Output ONLY the JSON array.`,
      config: {
        responseMimeType: 'application/json'
      }
    });

    const text = response.text || "[]";
    return JSON.parse(text);
  } catch (error) {
    console.error("Gemini Error:", error);
    return [];
  }
};
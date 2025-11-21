import { GoogleGenAI, Type } from "@google/genai";

// Define the schema for our expected response
const videoMetadataSchema = {
  type: Type.OBJECT,
  properties: {
    title: {
      type: Type.STRING,
      description: "A catchy, engaging title for the video, based on the filename.",
    },
    description: {
      type: Type.STRING,
      description: "A short, exciting synopsis or description of what this video might be about (creative writing allowed).",
    },
    tags: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "3 to 5 short genre or topic tags.",
    },
  },
  required: ["title", "description", "tags"],
};

export const generateVideoMetadataAI = async (fileName: string): Promise<{ title: string; description: string; tags: string[] }> => {
  try {
    const apiKey = process.env.API_KEY;
    if (!apiKey) {
      throw new Error("API Key not found");
    }

    const ai = new GoogleGenAI({ apiKey });

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `I am uploading a video file named "${fileName}". 
      Please generate a cool title, a creative description, and some tags for it. 
      If the filename is cryptic (e.g., VID_2023.mp4), invent a mysterious or interesting generic description about a "lost footage" or "daily vlog".`,
      config: {
        responseMimeType: "application/json",
        responseSchema: videoMetadataSchema,
        temperature: 0.7,
      },
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");

    return JSON.parse(text);
  } catch (error) {
    console.error("AI Generation failed", error);
    // Fallback
    return {
      title: fileName,
      description: "Uploaded video content.",
      tags: ["User Upload", "Uncategorized"]
    };
  }
};
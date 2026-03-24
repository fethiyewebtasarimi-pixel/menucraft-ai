import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

/**
 * Gemini 2.0 Flash - Hızlı vision analiz
 */
export function getVisionModel() {
  return genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
}

/**
 * Gemini 2.0 Flash - Image generation/enhancement
 */
export function getImageModel() {
  return genAI.getGenerativeModel({
    model: "gemini-2.0-flash-preview-image-generation",
  });
}

/**
 * Base64 string'den Gemini inline data formatına çevir
 */
export function toGeminiImage(base64: string, mimeType: string) {
  // Remove data URL prefix if present
  const cleanBase64 = base64.replace(/^data:image\/\w+;base64,/, "");
  return {
    inlineData: {
      data: cleanBase64,
      mimeType,
    },
  };
}

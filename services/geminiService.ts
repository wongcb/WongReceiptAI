import { GoogleGenAI, Type } from "@google/genai";
import { ExtractionResult, ExpenseCategory, Currency } from "../types";

// Initialize the client
// Note: In a production environment, keys should be proxy-ed or strictly managed.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const result = reader.result as string;
      // Remove the data URL prefix (e.g., "data:image/jpeg;base64," or "data:application/pdf;base64,")
      const base64 = result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = (error) => reject(error);
  });
};

export const extractReceiptData = async (file: File): Promise<ExtractionResult> => {
  const base64Data = await fileToBase64(file);

  const prompt = `
    Analyze this receipt file (image or PDF). 
    Extract the following information:
    1. Date of the transaction (format YYYY-MM-DD). If year is missing, assume current year.
    2. Total Amount (numerical value).
    3. Currency. Identify the currency code (ISO 4217). Common codes: USD, EUR, GBP, JPY, CAD, AUD, CNY, SGD, HKD. 
       - '$' usually implies USD unless address/context implies CAD, AUD, SGD, HKD.
       - 'S$' or 'SGD' is Singapore Dollar.
       - 'HK$' is Hong Kong Dollar.
    4. Merchant Name.
    5. Category. Must be one of: 'Transport', 'Flight', 'Accommodation', 'Meal', 'Incidental'. Based on the items and merchant.

    If the file is not a receipt or text is unreadable, return null or best guess marked as Unknown.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: file.type,
              data: base64Data
            }
          },
          {
            text: prompt
          }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            date: { type: Type.STRING, description: "The date in YYYY-MM-DD format" },
            amount: { type: Type.NUMBER, description: "The total cost" },
            currency: { 
              type: Type.STRING, 
              enum: Object.values(Currency),
              description: "The currency code" 
            },
            merchant: { type: Type.STRING, description: "Name of the vendor" },
            category: { 
              type: Type.STRING, 
              enum: ["Transport", "Flight", "Accommodation", "Meal", "Incidental", "Unknown"],
              description: "The expense category"
            }
          },
          required: ["date", "amount", "currency", "category", "merchant"]
        }
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");

    const data = JSON.parse(text) as ExtractionResult;
    return data;

  } catch (error) {
    console.error("Error extracting receipt data:", error);
    throw error;
  }
};
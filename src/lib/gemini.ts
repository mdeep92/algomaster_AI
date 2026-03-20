import { GoogleGenAI } from "@google/genai";

// Initialize the Gemini API client
// We use a lazy initialization pattern to avoid issues if the key is missing during build
let aiClient: GoogleGenAI | null = null;

export const getAIClient = () => {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.warn("GEMINI_API_KEY is not set. AI features will not work.");
      return null;
    }
    aiClient = new GoogleGenAI({ apiKey });
  }
  return aiClient;
};

export const generateExplanation = async (topic: string, context?: string) => {
  const ai = getAIClient();
  if (!ai) return "AI Client not initialized. Please check your API key.";

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Explain the Data Structure or Algorithm topic: "${topic}". 
      Context: ${context || "General introduction"}.
      Provide a clear, concise explanation suitable for a student preparing for technical interviews. 
      Include time and space complexity analysis where applicable.
      Use Markdown for formatting.`,
    });
    return response.text;
  } catch (error) {
    console.error("Error generating explanation:", error);
    return "Failed to generate explanation. Please try again.";
  }
};

export const checkSolution = async (problem: string, code: string, language: string) => {
  const ai = getAIClient();
  if (!ai) return "AI Client not initialized.";

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3.1-pro-preview", // Using Pro for better code reasoning
      contents: `You are a technical interviewer at a top tech company.
      Problem: ${problem}
      Candidate's Code (${language}):
      \`\`\`${language}
      ${code}
      \`\`\`
      
      Please evaluate the solution.
      1. Is it correct?
      2. What is the Time and Space complexity?
      3. Are there any edge cases missed?
      4. Suggest improvements or a more optimal approach if one exists.
      
      Keep the tone encouraging but rigorous. Use Markdown.`,
    });
    return response.text;
  } catch (error) {
    console.error("Error checking solution:", error);
    return "Failed to check solution.";
  }
};

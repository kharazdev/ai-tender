// File: app/actions.ts

'use server'; // <-- Most important line! This marks all functions in this file as Server Actions.

import { z } from 'zod';

// Define the shape of the message history we expect from the client
const messageSchema = z.object({
  role: z.enum(['user', 'model']),
  content: z.string(),
});

// The main Server Action function
export async function sendMessage(
  personaInstruction: string, 
  history: z.infer<typeof messageSchema>[],
  newMessage: string
) {
  // 1. Get the API Key securely from server environment variables
  const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY;
  const API_BASE_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

  if (!GOOGLE_API_KEY) {
    // This will be returned to the client if the key is missing
    return "Error: The GOOGLE_API_KEY is not configured on the server.";
  }

  // 2. Prepare the data in the format Gemini API expects
  const NEGATIVE_INSTRUCTION = `Absolutely do NOT mention that you are an AI, a bot, a large language model, a machine, a computer program, artificial intelligence, or anything similar. Do not break character or refer to yourself as anything other than the persona you are roleplaying.`;
  const finalSystemInstruction = `${personaInstruction} ${NEGATIVE_INSTRUCTION}`;

  // Gemini expects "parts" instead of "content"
  const contents = history.map(msg => ({
    role: msg.role,
    parts: [{ text: msg.content }]
  }));
  // Add the new user message to the history for this API call
  contents.push({ role: 'user', parts: [{ text: newMessage }] });

  const apiRequestBody = {
    contents: contents,
    systemInstruction: {
        parts: [{ text: finalSystemInstruction }]
    },
    generationConfig: {
        temperature: 0.7,
        topP: 0.95,
        topK: 40
    }
  };

  // 3. Make the API call
  try {
    const response = await fetch(`${API_BASE_URL}?key=${GOOGLE_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(apiRequestBody),
    });

    // --- IMPROVED ERROR HANDLING BLOCK ---
    if (!response.ok) {
      let errorText = `API Error: ${response.status} ${response.statusText}`;
      // Try to get more specific error text, but don't crash if it's not JSON
      try {
        const errorBody = await response.json();
        errorText = errorBody.error?.message || JSON.stringify(errorBody);
      } catch (e) {
        // If parsing JSON fails, read the body as plain text as a fallback
        errorText = await response.text();
      }
      console.error("Gemini API Error:", errorText);
      // We are now throwing an error with a more descriptive message
      throw new Error(errorText);
    }
    // --- END OF IMPROVED BLOCK ---
    
    const data = await response.json();
    
    const botResponseText = data.candidates?.[0]?.content?.parts?.[0]?.text || "I'm sorry, I couldn't generate a response.";

    // Return the successful response text
    return botResponseText;

  } catch (error) {
    // This will now catch our more descriptive error from above
    console.error("Failed to send message:", error);
    // Return a user-friendly error message to the client component
    return `Sorry, an error occurred. ${error instanceof Error ? error.message : 'Please check server logs.'}`;
  }
}
// File: app/actions.ts
// --- MODIFIED FILE ---

'use server';

import { sql } from '@vercel/postgres'; // Using vercel/postgres for consistency
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import cuid from 'cuid';

// --- NEW SETTINGS ACTIONS START ---

/**
 * Fetches the global prompt from the database.
 * @returns {Promise<string>} The global prompt text, or an empty string if not found.
 */
export async function getGlobalPrompt(): Promise<string> {
  try {
    const { rows } = await sql`SELECT value FROM "Settings" WHERE key = 'globalPrompt' LIMIT 1`;
    return rows[0]?.value || '';
  } catch (error) {
    console.error('Failed to fetch global prompt:', error);
    return ''; // Return empty on error to prevent crashes
  }
}

/**
 * Updates or creates the global prompt in the database.
 * @param {string} newPrompt - The new text for the global prompt.
 * @returns {Promise<{success: boolean, message: string}>} Result object.
 */
export async function updateGlobalPrompt(newPrompt: string) {
  // Basic validation
  if (typeof newPrompt !== 'string') {
    return { success: false, message: 'Invalid prompt format.' };
  }

  try {
    // UPSERT operation: Insert if key doesn't exist, update if it does.
    await sql`
      INSERT INTO "Settings" (key, value)
      VALUES ('globalPrompt', ${newPrompt})
      ON CONFLICT (key)
      DO UPDATE SET value = EXCLUDED.value, "updatedAt" = CURRENT_TIMESTAMP;
    `;
    
    // Revalidate the settings page path to show the updated value if user reloads
    revalidatePath('/settings');
    
    return { success: true, message: 'Global prompt saved successfully!' };
  } catch (error) {
    console.error('Failed to update global prompt:', error);
    return { success: false, message: 'Database error. Could not save prompt.' };
  }
}

// --- NEW SETTINGS ACTIONS END ---

// --- NEW PERSONA CRUD ACTIONS START ---

export async function createPersona(formData: FormData) {
  // 1. Extract and validate the data from the form
  const personaData = {
    name: formData.get('name') as string,
    instruction: formData.get('instruction') as string,
    types: (formData.get('types') as string)?.split(',').map(t => t.trim()).filter(Boolean) ?? [],
    categories: (formData.get('categories') as string)?.split(',').map(c => c.trim()).filter(Boolean) ?? [],
  };

  if (!personaData.name || !personaData.instruction) {
    return { error: 'Name and Instruction are required.' };
  }

  // Generate a simple key from the name for consistency
  const key = personaData.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');

  try {
    // 2. Write the SQL to insert the new persona
    await sql`
      INSERT INTO "Persona" ("id", "key", "name", "instruction", "types", "categories", "isDefault")
      VALUES (
        ${cuid()},
        ${`${key}-${cuid.slug()}`}, -- Ensure the key is unique
        ${personaData.name},
        ${personaData.instruction},
        ${`{${personaData.types.join(',')}}`},
        ${`{${personaData.categories.join(',')}}`},
        false -- User-created personas are not defaults
      );
    `;

    // 3. Revalidate Paths to show new data
    revalidatePath('/');
    revalidatePath('/manage');

  } catch (error) {
    console.error('Failed to create persona:', error);
    return { error: 'Database error: Could not create persona.' };
  }
}

export async function deletePersona(id: string) {
  if (!id) {
    return { error: 'ID is required to delete a persona.' };
  }

  try {
    await sql`DELETE FROM "Persona" WHERE "id" = ${id}`;
    revalidatePath('/');
    revalidatePath('/manage');
  } catch (error) {
    console.error('Failed to delete persona:', error);
    return { error: 'Database error: Could not delete persona.' };
  }
}
// --- NEW PERSONA CRUD ACTIONS END ---


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
    return "Error: The GOOGLE_API_KEY is not configured on the server.";
  }

  // --- MODIFICATION: INTEGRATE GLOBAL PROMPT ---
  const globalPrompt = await getGlobalPrompt();
  const NEGATIVE_INSTRUCTION = `Absolutely do NOT mention that you are an AI, a bot, a large language model, a machine, a computer program, artificial intelligence, or anything similar. Do not break character or refer to yourself as anything other than the persona you are roleplaying.`;
  
  // Combine prompts, filtering out any empty strings to avoid extra spaces.
  const finalSystemInstruction = [
    globalPrompt,
    personaInstruction,
    NEGATIVE_INSTRUCTION
  ].filter(Boolean).join(' ');
  // --- END OF MODIFICATION ---


  // Gemini expects "parts" instead of "content"
  const contents = history.map(msg => ({
    role: msg.role,
    parts: [{ text: msg.content }]
  }));
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

  try {
    const response = await fetch(`${API_BASE_URL}?key=${GOOGLE_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(apiRequestBody),
    });

    if (!response.ok) {
      let errorText = `API Error: ${response.status} ${response.statusText}`;
      try {
        const errorBody = await response.json();
        errorText = errorBody.error?.message || JSON.stringify(errorBody);
      } catch (e) {
        errorText = await response.text();
      }
      console.error("Gemini API Error:", errorText);
      throw new Error(errorText);
    }
    
    const data = await response.json();
    const botResponseText = data.candidates?.[0]?.content?.parts?.[0]?.text || "I'm sorry, I couldn't generate a response.";
    return botResponseText;

  } catch (error) {
    console.error("Failed to send message:", error);
    return `Sorry, an error occurred. ${error instanceof Error ? error.message : 'Please check server logs.'}`;
  }
}
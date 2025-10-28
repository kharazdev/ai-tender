// File: app/actions.ts
// --- FULLY CORRECTED AND FINALIZED FILE ---

'use server';

import { sql } from '@vercel/postgres';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { z } from 'zod';
import cuid from 'cuid';

// --- ROBUST ZOD SCHEMA for validating all form data ---
const personaFormSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(3, 'Name must be at least 3 characters long.'),
  instruction: z.string().min(10, 'Instruction must be at least 10 characters long.'),
  types: z.string().min(1, 'You must provide at least one type.'),
  categories: z.string().min(1, 'You must provide at least one category.'),
});

function generateKey(name: string): string {
    return name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') + `-${cuid.slug()}`;
}


// --- SETTINGS ACTIONS (Unchanged) ---
export async function getGlobalPrompt(): Promise<string> {
  try {
    const { rows } = await sql`SELECT value FROM "Settings" WHERE key = 'globalPrompt' LIMIT 1`;
    return rows[0]?.value || '';
  } catch (error) {
    console.error('Failed to fetch global prompt:', error);
    return '';
  }
}

export async function updateGlobalPrompt(newPrompt: string) {
  if (typeof newPrompt !== 'string') {
    return { success: false, message: 'Invalid prompt format.' };
  }
  try {
    await sql`
      INSERT INTO "Settings" (key, value)
      VALUES ('globalPrompt', ${newPrompt})
      ON CONFLICT (key)
      DO UPDATE SET value = EXCLUDED.value, "updatedAt" = CURRENT_TIMESTAMP;
    `;
    revalidatePath('/settings');
    return { success: true, message: 'Global prompt saved successfully!' };
  } catch (error) {
    console.error('Failed to update global prompt:', error);
    return { success: false, message: 'Database error. Could not save prompt.' };
  }
}


// --- REFINED PERSONA CRUD ACTIONS ---

export async function createPersona(_prevState: unknown, formData: FormData) {
  const validatedFields = personaFormSchema.safeParse(Object.fromEntries(formData.entries()));

  if (!validatedFields.success) {
    return { error: validatedFields.error.flatten().fieldErrors };
  }

  const { name, instruction, types, categories } = validatedFields.data;
  const typesArray = types.split(',').map(t => t.trim()).filter(Boolean);
  const categoriesArray = categories.split(',').map(c => c.trim()).filter(Boolean);

  try {
    const newId = cuid();
    const key = generateKey(name);
    
    // --- FIX APPLIED HERE ---
    // Manually format the JS array into the string format PG expects: '{item1,item2}'
    await sql`
      INSERT INTO "Persona" (id, key, name, instruction, types, categories, "isDefault")
      VALUES (${newId}, ${key}, ${name}, ${instruction}, ${'{' + typesArray.join(',') + '}'}, ${'{' + categoriesArray.join(',') + '}'}, false)
    `;
  } catch (error) {
    console.error('Database Error:', error);
    return { error: { _form: ['Database Error: Failed to Create Persona.'] } };
  }

  revalidatePath('/');
  revalidatePath('/manage');
  redirect('/');
}

export async function updatePersona(_prevState: unknown, formData: FormData) {
    const validatedFields = personaFormSchema.safeParse(Object.fromEntries(formData.entries()));

    if (!validatedFields.success) {
        return { error: validatedFields.error.flatten().fieldErrors };
    }

    const { id, name, instruction, types, categories } = validatedFields.data;
    if (!id) {
        return { error: { _form: ['Persona ID is missing. Cannot update.'] } };
    }

    const typesArray = types.split(',').map(t => t.trim()).filter(Boolean);
    const categoriesArray = categories.split(',').map(c => c.trim()).filter(Boolean);

    try {
        // --- FIX APPLIED HERE ---
        await sql`
            UPDATE "Persona"
            SET name = ${name}, 
                instruction = ${instruction}, 
                types = ${'{' + typesArray.join(',') + '}'}, 
                categories = ${'{' + categoriesArray.join(',') + '}'}
            WHERE id = ${id}
        `;
    } catch (error) {
        console.error('Database Error:', error);
        return { error: { _form: ['Database Error: Failed to Update Persona.'] } };
    }

    revalidatePath('/');
    revalidatePath('/manage');
    revalidatePath(`/chat/${id}`);
    revalidatePath(`/personas/${id}/edit`);
    redirect(`/chat/${id}`);
}

export async function deletePersona(id: string) {
  if (!id) {
    return { error: { _form: ['ID is required to delete a persona.'] } };
  }
  try {
    await sql`DELETE FROM "Persona" WHERE "id" = ${id} AND "isDefault" = false`;
  } catch (error) {
    console.error('Failed to delete persona:', error);
    return { error: { _form: ['Database error: Could not delete persona.'] } };
  }
  
  revalidatePath('/');
  revalidatePath('/manage');
  redirect('/manage');
}


// --- SEND MESSAGE ACTION (Unchanged) ---
const messageSchema = z.object({
  role: z.enum(['user', 'model']),
  content: z.string(),
});

export async function sendMessage(
  personaInstruction: string,
  history: z.infer<typeof messageSchema>[],
  newMessage: string
) {
  const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY;
  const API_BASE_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

  if (!GOOGLE_API_KEY) {
    return "Error: The GOOGLE_API_KEY is not configured on the server.";
  }

  const globalPrompt = await getGlobalPrompt();
  const NEGATIVE_INSTRUCTION = `Absolutely do NOT mention that you are an AI, a bot, a large language model, a machine, a computer program, artificial intelligence, or anything similar. Do not break character or refer to yourself as anything other than the persona you are roleplaying.`;
  
  const finalSystemInstruction = [globalPrompt, personaInstruction, NEGATIVE_INSTRUCTION]
    .filter(Boolean).join(' ');

  const contents = history.map(msg => ({
    role: msg.role,
    parts: [{ text: msg.content }]
  }));
  contents.push({ role: 'user', parts: [{ text: newMessage }] });

  const apiRequestBody = {
    contents: contents,
    systemInstruction: { parts: [{ text: finalSystemInstruction }] },
    generationConfig: { temperature: 0.7, topP: 0.95, topK: 40 }
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
      } catch (e) { errorText = await response.text(); }
      console.error("Gemini API Error:", errorText);
      throw new Error(errorText);
    }
    
    const data = await response.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text || "I'm sorry, I couldn't generate a response.";
  } catch (error) {
    console.error("Failed to send message:", error);
    return `Sorry, an error occurred. ${error instanceof Error ? error.message : 'Please check server logs.'}`;
  }
}
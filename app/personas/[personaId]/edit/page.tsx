// File: app/personas/[personaId]/edit/page.tsx
// --- FULLY CORRECTED FILE ---

import PersonaForm from '@/components/PersonaForm';
import { sql } from '@vercel/postgres';
import { notFound } from 'next/navigation';

export const dynamic = 'force-dynamic';

type PersonaForForm = {
  id: string;
  name: string;
  instruction: string;
  types: string[];
  categories: string[];
};

async function getPersonaForEditing(id: string): Promise<PersonaForForm | null> {
    // This function is correct and doesn't need changes.
    // The problem was the value being passed *into* it.
    console.log(`[getPersonaForEditing] Searching for persona with ID: ${id}`);
    
    try {
        const { rows } = await sql`SELECT id, name, instruction, types, categories FROM "Persona" WHERE id = ${id} LIMIT 1`;
        console.log(`[getPersonaForEditing] Database returned ${rows.length} row(s).`);
        
        if (rows.length === 0) {
          return null;
        }
        return rows[0] as PersonaForForm;
    } catch (error) {
        console.error("[getPersonaForEditing] A database error occurred:", error);
        return null;
    }
}

// --- FIX APPLIED HERE ---
// The type of the 'params' prop is now correctly defined as a Promise.
export default async function EditPersonaPage({ params: paramsPromise }: { params: Promise<{ personaId: string }> }) {
  
  // We 'await' the promise to get the actual params object.
  const params = await paramsPromise;
  
  console.log(`[EditPersonaPage] Page rendered for resolved params:`, params);
  
  // Now we can safely access params.personaId because the promise has been resolved.
  const persona = await getPersonaForEditing(params.personaId);

  if (!persona) {
    console.log(`[EditPersonaPage] Persona not found for ID ${params.personaId}. Triggering 404 page.`);
    notFound();
  }

  return (
    <main className="container mx-auto p-4 md:p-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold">Edit: {persona.name}</h1>
        <p className="text-lg text-gray-600 dark:text-gray-400 mt-2">
          Refine the personality and details of this character.
        </p>
      </div>
      <PersonaForm persona={persona} />
    </main>
  );
}
// File: app/chat/[personaId]/page.tsx
// --- MODIFIED FILE ---

import { neon } from '@neondatabase/serverless';
import { notFound } from 'next/navigation';
import { z } from 'zod';
import ChatInterface from '@/components/ChatInterface';
import Link from 'next/link'; // <-- 1. IMPORT Link
import { PencilSquareIcon } from '@heroicons/react/24/outline'; // <-- 2. IMPORT an icon

// The Zod schema and Persona type can stay (no changes)
const personaSchema = z.object({
  id: z.string(),
  name: z.string(),
  instruction: z.string(),
  key: z.string(),
  types: z.array(z.string()),
  categories: z.array(z.string()),
  isDefault: z.boolean(),
  createdAt: z.date(),
});
type Persona = z.infer<typeof personaSchema>;

// No changes to this function
async function getPersonaById(id: string): Promise<Persona | null> {
    if (!process.env.DATABASE_URL) {
      throw new Error('DATABASE_URL environment variable is not set');
    }
    const sql = neon(process.env.DATABASE_URL);
    try {
      const rawPersonas = await sql`
        SELECT * FROM "Persona" WHERE "id" = ${id} LIMIT 1
      `;
      if (!rawPersonas || rawPersonas.length === 0) {
        return null;
      }
      const rawPersona = rawPersonas[0];
      return personaSchema.parse(rawPersona);
    } catch (error) {
      console.error(`Failed to fetch or validate persona with ID ${id}:`, error);
      return null;
    }
}

export default async function ChatPage({ params: paramsPromise }: { params: Promise<{ personaId: string }> }) {
  
  const params = await paramsPromise;
  const persona = await getPersonaById(params.personaId);

  if (!persona) {
    notFound();
  }

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)]">
        {/* --- 3. MODIFIED HEADER to be a flex container and add the Link --- */}
        <div className="p-4 border-b dark:border-gray-700 flex items-center justify-center relative">
            <h1 className="text-xl font-semibold">
              Chatting with: {persona.name}
            </h1>
            <Link
                href={`/personas/${persona.id}/edit`}
                className="absolute right-4 p-2 text-gray-500 hover:text-blue-500 transition-colors"
                title="Edit Persona"
            >
                <PencilSquareIcon className="h-6 w-6" />
            </Link>
        </div>
        {/* --- END OF MODIFICATION --- */}
        
        <ChatInterface persona={persona} />

    </div>
  );
}
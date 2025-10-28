// File: app/chat/[personaId]/page.tsx
// --- FULLY CORRECTED FILE ---

import { neon } from '@neondatabase/serverless';
import { notFound } from 'next/navigation';
import { z } from 'zod';
import ChatInterface from '@/components/ChatInterface';
import Link from 'next/link';
import { PencilSquareIcon } from '@heroicons/react/24/outline';

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

async function getPersonaById(id: string): Promise<Persona | null> {
    if (!process.env.DATABASE_URL) {
      throw new Error('DATABASE_URL environment variable is not set');
    }
    const sql = neon(process.env.DATABASE_URL);
    try {
      // --- FIX APPLIED HERE ---
      // The `sql` function from `neon` returns the array of rows directly.
      // So, we assign it directly to a variable instead of destructuring `{ rows }`.
      const rawPersonas = await sql`
        SELECT * FROM "Persona" WHERE "id" = ${id} LIMIT 1
      `;
      // --- END OF FIX ---

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

const getInitials = (name: string) => {
  const words = name.split(' ');
  if (words.length > 1) {
    return (words[0][0] + words[1][0]).toUpperCase();
  }
  return name.substring(0, 2).toUpperCase();
};

export default async function ChatPage({ params: paramsPromise }: { params: Promise<{ personaId: string }> }) {
  const params = await paramsPromise;
  const persona = await getPersonaById(params.personaId);

  if (!persona) {
    notFound();
  }
  
  const tags = [...new Set([...persona.types, ...persona.categories])];

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] bg-background">
        <div className="p-4 border-b dark:border-gray-700">
          <div className="flex items-center gap-4">
            <div className="flex-shrink-0 h-12 w-12 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold text-xl">
              {getInitials(persona.name)}
            </div>
            
            <div className="flex-1 min-w-0">
              <h1 className="text-lg font-semibold truncate">{persona.name}</h1>
              <div className="flex flex-wrap gap-1.5 mt-1">
                {tags.slice(0, 4).map(tag => (
                  <span key={tag} className="px-2 py-0.5 text-xs font-medium rounded-full bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-200">
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            <Link
                href={`/personas/${persona.id}/edit`}
                className="flex-shrink-0 p-2 text-gray-500 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 hover:text-blue-500 transition-colors"
                title="Edit Persona"
            >
                <PencilSquareIcon className="h-6 w-6" />
            </Link>
          </div>
        </div>
        
        <ChatInterface persona={persona} />
    </div>
  );
}
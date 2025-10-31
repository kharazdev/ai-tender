// File: app/chat/[personaId]/page.tsx
// --- UPDATED FILE ---

import { neon } from '@neondatabase/serverless';
import { notFound } from 'next/navigation';
import { z } from 'zod';
import ChatView from '@/components/ChatView'; // 1. Import the new wrapper component

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

// No changes to the data fetching function
async function getPersonaById(id: string): Promise<Persona | null> {
    if (!process.env.DATABASE_URL) {
      throw new Error('DATABASE_URL environment variable is not set');
    }
    const sql = neon(process.env.DATABASE_URL);
    try {
      const rawPersonas = await sql`
        SELECT * FROM "Persona" WHERE "id" = ${id} LIMIT 1
      `;
      if (rawPersonas.length === 0) return null;
      return personaSchema.parse(rawPersonas[0]);
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

  // 2. Render the single client wrapper component, passing the server-fetched data
  return <ChatView persona={persona} />;
}
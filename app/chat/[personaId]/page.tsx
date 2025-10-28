// File: app/chat/[personaId]/page.tsx
// --- UPDATED AND SIMPLIFIED FILE ---

import { neon } from '@neondatabase/serverless';
import { notFound } from 'next/navigation';
import { z } from 'zod';
import ChatInterface from '@/components/ChatInterface';
import ChatHeader from '@/components/ChatHeader'; // <-- 1. IMPORT THE NEW HEADER COMPONENT

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

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] bg-background">
        {/* 2. RENDER THE NEW CHATHEADER AND PASS THE PERSONA DATA */}
        <ChatHeader persona={persona} />
        
        {/* The ChatInterface component remains unchanged */}
        <ChatInterface persona={persona} />
    </div>
  );
}
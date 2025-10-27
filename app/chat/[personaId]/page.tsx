// File: app/chat/[personaId]/page.tsx

import { neon } from '@neondatabase/serverless';
import { notFound } from 'next/navigation';
import { z } from 'zod';
import ChatInterface from '@/components/ChatInterface'; // <-- 1. CRITICAL: Import the component

// The Zod schema and Persona type can stay
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

  // This is the main UI rendering part
  return (
    <div className="flex flex-col h-[calc(100vh-4rem)]">
        <div className="p-4 border-b dark:border-gray-700 text-center">
            <h1 className="text-xl font-semibold">
              Chatting with: {persona.name}
            </h1>
        </div>
        
        {/* 2. CRITICAL: Render the interactive ChatInterface component and pass the persona data to it */}
        <ChatInterface persona={persona} />

    </div>
  );
}
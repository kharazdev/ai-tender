// File: components/PersonaList.tsx
// --- NEW FILE ---

'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { z } from 'zod';

// Define the Persona type again here to use it in props
const personaSchema = z.object({
    id: z.string(),
    name: z.string(),
});
type Persona = z.infer<typeof personaSchema>;

interface PersonaListProps {
  personas: Persona[];
}

// Helper to render a single persona card.
const PersonaCard = ({ persona }: { persona: Persona }) => (
  <Link href={`/chat/${persona.id}`} key={persona.id} className="group block">
    <div className="flex flex-col items-center justify-center p-4 h-32 text-center border rounded-lg shadow-md transition-transform transform-gpu group-hover:-translate-y-1 group-hover:shadow-xl dark:border-gray-700 dark:hover:bg-gray-800">
      <h2 className="font-semibold">{persona.name}</h2>
    </div>
  </Link>
);

export function PersonaList({ personas }: PersonaListProps) {
  const [partitionedPersonas, setPartitionedPersonas] = useState<{
    recent: Persona[];
    others: Persona[];
  }>({ recent: [], others: personas });

  useEffect(() => {
    // This logic runs on the client after the component mounts
    const recentChatIds = new Set<string>();
    const today = new Date().toISOString().split('T')[0];

    // Check localStorage for keys matching our chat history pattern
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(`chat_history_`) && key.endsWith(`_${today}`)) {
        // Extract the persona ID from the key: chat_history_{id}_{date}
        const id = key.split('_')[2];
        if (id) {
          recentChatIds.add(id);
        }
      }
    }

    // Partition the initial list of personas
    const recent: Persona[] = [];
    const others: Persona[] = [];

    personas.forEach((persona) => {
      if (recentChatIds.has(persona.id)) {
        recent.push(persona);
      } else {
        others.push(persona);
      }
    });

    setPartitionedPersonas({ recent, others });
  }, [personas]); // Rerun if the personas list changes (e.g., due to filtering)

  const { recent, others } = partitionedPersonas;

  return (
    <div>
      {recent.length > 0 && (
        <>
          <h2 className="text-2xl font-semibold mb-4 border-b pb-2">Continue Chatting</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 mb-10">
            {recent.map((persona) => (
              <PersonaCard key={persona.id} persona={persona} />
            ))}
          </div>
        </>
      )}

      {others.length > 0 && recent.length > 0 && (
         <h2 className="text-2xl font-semibold mb-4 border-b pb-2">Discover</h2>
      )}
      
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
        {others.map((persona) => (
          <PersonaCard key={persona.id} persona={persona} />
        ))}
      </div>
    </div>
  );
}
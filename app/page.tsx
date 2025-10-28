// File: app/page.tsx
// --- MODIFIED FILE ---

import { sql } from "@vercel/postgres";
import Link from 'next/link';
import { z } from 'zod';
import { PersonaFilters } from '@/components/PersonaFilters';
// Import a gear icon for a cleaner look (optional)
import { Cog6ToothIcon } from '@heroicons/react/24/outline';


// ... (personaSchema and getFilteredPersonas function remain unchanged) ...
const personaSchema = z.object({
    id: z.string(),
    key: z.string(),
    name: z.string(),
    instruction: z.string(),
    types: z.array(z.string()),
    categories: z.array(z.string()),
    isDefault: z.boolean(),
    createdAt: z.coerce.date(),
});
type Persona = z.infer<typeof personaSchema>;

async function getFilteredPersonas(
    searchQuery: string | undefined,
    types: string[]
): Promise<Persona[]> {
    let query = 'SELECT * FROM "Persona"';
    const conditions = [];
    const params: (string | string[])[] = [];

    if (searchQuery) {
        params.push(`%${searchQuery}%`);
        conditions.push(`"name" ILIKE $${params.length}`);
    }

    if (types.length > 0) {
        params.push(types);
        conditions.push(`("types" && $${params.length}::text[] OR "categories" && $${params.length}::text[])`);
    }

    if (conditions.length > 0) {
        query += ` WHERE ${conditions.join(' AND ')}`;
    }

    query += ' ORDER BY "name" ASC';

    try {
        const { rows } = await sql.query(query, params);
        return z.array(personaSchema).parse(rows);
    } catch (error) {
        console.error('Failed to fetch filtered personas:', error);
        return [];
    }
}


export default async function HomePage({
  searchParams,
}: {
  searchParams?: {
    q?: string;
    type?: string | string[];
  };
}) {
  const resolvedSearchParams = await searchParams;
  const searchQuery = resolvedSearchParams?.q;
  const types = Array.isArray(resolvedSearchParams?.type) 
    ? resolvedSearchParams.type 
    : resolvedSearchParams?.type 
    ? [resolvedSearchParams.type] 
    : [];

  const personas = await getFilteredPersonas(searchQuery, types);

  return (
    <main className="container mx-auto p-4 md:p-8">
      {/* --- MODIFICATION: ADDED HEADER WITH SETTINGS LINK --- */}
      <div className="relative text-center mb-8">
        <h1 className="text-4xl font-bold">Select a Persona</h1>
        
        <Link 
          href="/settings" 
          className="absolute top-0 right-0 p-2 text-gray-500 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
          title="Global Settings"
        >
          <Cog6ToothIcon className="h-6 w-6" />
        </Link>
      </div>
      {/* --- END OF MODIFICATION --- */}


      <PersonaFilters />

      {personas.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {personas.map((persona) => (
            <Link 
              href={`/chat/${persona.id}`}
              key={persona.id}
              className="group block"
            >
              <div className="flex flex-col items-center justify-center p-4 h-32 text-center border rounded-lg shadow-md transition-transform transform-gpu group-hover:-translate-y-1 group-hover:shadow-xl dark:border-gray-700 dark:hover:bg-gray-800">
                <h2 className="font-semibold">{persona.name}</h2>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center text-gray-500 mt-16">
          <p className="text-xl">No personas match your criteria.</p>
          <p>Try clearing some filters to see more results.</p>
        </div>
      )}
    </main>
  );
}
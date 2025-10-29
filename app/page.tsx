// File: app/page.tsx
// --- MODIFIED FILE ---

import { sql } from "@vercel/postgres";
import Link from 'next/link';
import { z } from 'zod';
import { PersonaFilters } from '@/components/PersonaFilters';
import { Cog6ToothIcon } from '@heroicons/react/24/outline';
import { PersonaList } from "@/components/PersonaList"; // <-- IMPORT THE NEW COMPONENT

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

    query += ' ORDER BY "name" ASC'; // Keep alphabetical sorting from the server

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
      <div className="relative text-center mb-8">
        <h1 className="text-4xl font-bold">Select a Persona</h1>
        <Link 
          href="/manage" 
          className="absolute top-0 right-0 p-2 text-gray-500 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
          title="Manage Personas"
        >
          <Cog6ToothIcon className="h-6 w-6" />
        </Link>
      </div>

      <PersonaFilters />

      {personas.length > 0 ? (
        // --- MODIFICATION: Use the PersonaList component ---
        <PersonaList personas={personas} />
        // --- END OF MODIFICATION ---
      ) : (
        <div className="text-center text-gray-500 mt-16">
          <p className="text-xl">No personas match your criteria.</p>
          <p>Try clearing some filters to see more results.</p>
        </div>
      )}
    </main>
  );
}
// File: app/page.tsx

import { sql } from "@vercel/postgres";
import Link from 'next/link';
import { z } from 'zod';
import { PersonaFilters } from '@/components/PersonaFilters';

// Zod schema (using coerce for dates is best practice)
const personaSchema = z.object({
  id: z.string(),
  key: z.string(),
  name: z.string(),
  instruction: z.string(),
  types: z.array(z.string()),
  categories: z.array(z.string()),
  isDefault: z.boolean(),
  createdAt: z.coerce.date(), // Coerce automatically converts string/number from DB to Date
});
type Persona = z.infer<typeof personaSchema>;


// --- DATA FETCHING FUNCTION WITH CORRECTED "OR" FILTERING LOGIC ---
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

  console.log("EXECUTING SQL:", query);
  console.log("WITH PARAMS:", params);

  try {
    const { rows } = await sql.query(query, params);
    return z.array(personaSchema).parse(rows);
  } catch (error) {
    console.error('Failed to fetch filtered personas:', error);
    return [];
  }
}


// --- THE HOME PAGE COMPONENT ---
export default async function HomePage({
  searchParams,
}: {
  searchParams?: {
    q?: string;
    type?: string | string[];
  };
}) {
  // --- FIX APPLIED HERE ---
  // The error message indicates that `searchParams` is a Promise.
  // Since this is an async component, we can simply `await` it to get the value.
  const resolvedSearchParams = await searchParams;

  // Now, use the resolved object to get your values
  const searchQuery = resolvedSearchParams?.q;
  const types = Array.isArray(resolvedSearchParams?.type) 
    ? resolvedSearchParams.type 
    : resolvedSearchParams?.type 
    ? [resolvedSearchParams.type] 
    : [];
  // --- END OF FIX ---

  const personas = await getFilteredPersonas(searchQuery, types);

  return (
    <main className="container mx-auto p-4 md:p-8">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold">Select a Persona</h1>
      </div>

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
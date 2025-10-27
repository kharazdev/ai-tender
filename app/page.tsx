// File: app/page.tsx

import { neon } from '@neondatabase/serverless';
import Link from 'next/link';
import { z } from 'zod'; // <-- 1. Import Zod

// --- 2. Define a Zod Schema for our Persona ---
// This schema describes the shape and types of our data.
const personaSchema = z.object({
  id: z.string(),
  key: z.string(),
  name: z.string(),
  instruction: z.string(),
  types: z.array(z.string()),
  categories: z.array(z.string()),
  isDefault: z.boolean(),
  createdAt: z.date(),
});

// --- 3. Infer the TypeScript type directly from the Zod schema ---
// Now, our type and our validation are always in sync!
type Persona = z.infer<typeof personaSchema>;

// This function fetches and VALIDATES data from our database.
async function getPersonas(): Promise<Persona[]> {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL environment variable is not set');
  }
  const sql = neon(process.env.DATABASE_URL);

  try {
    // 4. Fetch the raw data. The neon driver returns `unknown[]`.
    const rawPersonas = await sql`
      SELECT * FROM "Persona" ORDER BY "name" ASC
    `;

    // 5. Validate and parse the raw data using Zod.
    // `z.array(personaSchema).parse(...)` will check if it's an array of valid personas.
    // If validation fails, it throws a detailed error. If it succeeds, it returns the typed data.
    const personas = z.array(personaSchema).parse(rawPersonas);
    return personas;
    
  } catch (error) {
    console.error('Failed to fetch or validate personas:', error);
    return [];
  }
}


// --- The Page Component remains the same ---
export default async function HomePage() {
  const personas = await getPersonas();

  return (
    <main className="container mx-auto p-4 md:p-8">
      <h1 className="text-4xl font-bold text-center mb-8">Select a Persona</h1>

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
          <p className="text-xl">No personas found.</p>
          <p>Please check the database connection or run the seeding script.</p>
        </div>
      )}
    </main>
  );
}
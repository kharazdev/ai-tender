// File: app/manage/page.tsx
// --- NEW FILE ---

import { sql } from "@vercel/postgres";
import Link from 'next/link';
import { z } from 'zod';
import { PlusIcon, Cog6ToothIcon } from '@heroicons/react/24/outline';

// Zod schema for type safety when fetching from the database
const personaSchema = z.object({
  id: z.string(),
  key: z.string(),
  name: z.string(),
  types: z.array(z.string()),
  categories: z.array(z.string()),
  isDefault: z.boolean(),
  createdAt: z.coerce.date(),
});

type Persona = z.infer<typeof personaSchema>;

async function getAllPersonas(): Promise<Persona[]> {
    try {
        // Fetch all personas, ordering them by name
        const { rows } = await sql`SELECT * FROM "Persona" ORDER BY "name" ASC`;
        // Validate the data with Zod
        return z.array(personaSchema).parse(rows);
    } catch (error) {
        console.error('Failed to fetch personas for manage page:', error);
        return []; // Return an empty array on error
    }
}

export default async function ManagePage() {
    const personas = await getAllPersonas();

    return (
        <main className="container mx-auto p-4 md:p-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4">
                <div>
                    <h1 className="text-4xl font-bold">Manage Personas</h1>
                    <p className="text-lg text-gray-600 dark:text-gray-400 mt-2">
                        View, edit, and create all personas available in the application.
                    </p>
                </div>
                <div className="flex items-center space-x-2">
                    <Link
                        href="/personas/new"
                        className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 transition-colors"
                    >
                        <PlusIcon className="h-5 w-5" />
                        Create Persona
                    </Link>
                    <Link
                        href="/settings"
                        className="flex items-center justify-center gap-2 px-4 py-2 bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200 font-semibold rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                    >
                        <Cog6ToothIcon className="h-5 w-5" />
                        Settings
                    </Link>
                </div>
            </div>

            <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                        <thead className="bg-gray-50 dark:bg-gray-700">
                            <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Name</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Types</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Categories</th>
                                <th scope="col" className="relative px-6 py-3">
                                    <span className="sr-only">Actions</span>
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                            {personas.map((persona) => (
                                <tr key={persona.id}>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-medium text-gray-900 dark:text-white">{persona.name}</div>
                                        {persona.isDefault && (
                                            <div className="text-xs text-gray-500 dark:text-gray-400">Default</div>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex flex-wrap gap-1">
                                            {persona.types.map(type => (
                                                <span key={type} className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                                                    {type}
                                                </span>
                                            ))}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex flex-wrap gap-1">
                                            {persona.categories.map(cat => (
                                                <span key={cat} className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200">
                                                    {cat}
                                                </span>
                                            ))}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <div className="flex items-center justify-end space-x-4">
                                            <Link href={`/chat/${persona.id}`} className="text-gray-500 hover:text-blue-600 dark:hover:text-blue-400">
                                                Chat
                                            </Link>
                                            <Link href={`/personas/${persona.id}/edit`} className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300">
                                                Edit
                                            </Link>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
             {personas.length === 0 && (
                <div className="text-center py-16">
                    <p className="text-gray-500">No personas found.</p>
                    <p className="text-gray-500 mt-2">Click "Create Persona" to get started.</p>
                </div>
            )}
        </main>
    );
}
// File: app/settings/page.tsx
// --- NEW FILE ---

import Link from 'next/link';
import { getGlobalPrompt } from '@/app/actions';
import SettingsForm from '@/components/SettingsForm';

export default async function SettingsPage() {
  const initialPrompt = await getGlobalPrompt();

  return (
    <main className="container mx-auto p-4 md:p-8">
      <div className="mb-8">
          <Link href="/" className="text-blue-500 hover:underline mb-4 block">&larr; Back to Personas</Link>
        <h1 className="text-4xl font-bold">Global Settings</h1>
        <p className="text-lg text-gray-600 dark:text-gray-400 mt-2">
          Manage application-wide settings that affect all chat personas.
        </p>
      </div>

      <SettingsForm initialPrompt={initialPrompt} />
    </main>
  );
}
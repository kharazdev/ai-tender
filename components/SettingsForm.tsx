// File: components/SettingsForm.tsx
// --- NEW FILE ---

'use client';

import { useState, useTransition } from 'react';
import { updateGlobalPrompt } from '@/app/actions';

interface SettingsFormProps {
  initialPrompt: string;
}

export default function SettingsForm({ initialPrompt }: SettingsFormProps) {
  const [prompt, setPrompt] = useState(initialPrompt);
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    startTransition(async () => {
      const result = await updateGlobalPrompt(prompt);
      if (result.success) {
        setMessage({ type: 'success', text: result.message });
      } else {
        setMessage({ type: 'error', text: result.message });
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl mx-auto space-y-4">
      <div>
        <label htmlFor="global-prompt" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Global Prompt
        </label>
        <textarea
          id="global-prompt"
          name="global-prompt"
          rows={8}
          className="w-full p-2 border rounded-lg shadow-sm dark:bg-gray-800 dark:border-gray-600 focus:ring-blue-500 focus:border-blue-500"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="e.g., Always respond in a friendly and helpful tone. Keep answers concise."
          disabled={isPending}
        />
        <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
          This prompt is added before every persona's specific instructions. It helps define a baseline behavior for all characters.
        </p>
      </div>

      <div className="flex items-center justify-between">
        <button
          type="submit"
          disabled={isPending}
          className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed"
        >
          {isPending ? 'Saving...' : 'Save Changes'}
        </button>

        {message && (
          <p className={`text-sm ${message.type === 'success' ? 'text-green-600' : 'text-red-600'}`}>
            {message.text}
          </p>
        )}
      </div>
    </form>
  );
}
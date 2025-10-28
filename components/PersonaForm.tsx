// File: components/PersonaForm.tsx
// --- MODIFIED FILE ---

'use client';

// --- MODIFIED IMPORT ---
// We now import 'useActionState' from 'react' instead of 'useFormState' from 'react-dom'
import { useActionState, useEffect, useState } from 'react';
import { useFormStatus } from 'react-dom';
// --------------------

import { createPersona, updatePersona, deletePersona } from '@/app/actions';
import { useRouter } from 'next/navigation';

type Persona = {
  id: string;
  name: string;
  instruction: string;
  types: string[];
  categories: string[];
};

interface PersonaFormProps {
  persona?: Persona;
}

function SubmitButton({ isEditing }: { isEditing: boolean }) {
  const { pending } = useFormStatus();
  
  return (
    <button
      type="submit"
      disabled={pending}
      className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed"
    >
      {pending ? 'Saving...' : isEditing ? 'Update Persona' : 'Create Persona'}
    </button>
  );
}

export default function PersonaForm({ persona }: PersonaFormProps) {
  const isEditing = !!persona;
  const action = isEditing ? updatePersona : createPersona;
  
  // --- RENAME THE HOOK ---
  // The hook is now called useActionState. The arguments remain the same.
  const [state, formAction] = useActionState(action, undefined);
  // -----------------------

  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (persona && window.confirm('Are you sure you want to delete this persona? This action cannot be undone.')) {
      setIsDeleting(true);
      await deletePersona(persona.id);
    }
  };
  
  useEffect(() => {
    if (state?.error?._form) {
      alert(state.error._form.join('\n'));
    }
  }, [state]);

  return (
    <form action={formAction} className="max-w-2xl mx-auto space-y-6">
      {isEditing && <input type="hidden" name="id" value={persona.id} />}
      
      <div>
        <label htmlFor="name" className="block text-sm font-medium mb-1">Name</label>
        <input id="name" name="name" defaultValue={persona?.name} required className="w-full p-2 border rounded-lg dark:bg-gray-800 dark:border-gray-600" />
        {state?.error?.name && <p className="text-red-500 text-xs mt-1">{state.error.name[0]}</p>}
      </div>

      <div>
        <label htmlFor="instruction" className="block text-sm font-medium mb-1">System Instruction (Prompt)</label>
        <textarea id="instruction" name="instruction" defaultValue={persona?.instruction} required rows={10} className="w-full p-2 border rounded-lg dark:bg-gray-800 dark:border-gray-600" />
        {state?.error?.instruction && <p className="text-red-500 text-xs mt-1">{state.error.instruction[0]}</p>}
      </div>

      <div>
        <label htmlFor="types" className="block text-sm font-medium mb-1">Types</label>
        <input id="types" name="types" defaultValue={persona?.types.join(', ')} required className="w-full p-2 border rounded-lg dark:bg-gray-800 dark:border-gray-600" />
        <p className="text-xs text-gray-500 mt-1">Comma-separated values (e.g., female, romantic, professional)</p>
        {state?.error?.types && <p className="text-red-500 text-xs mt-1">{state.error.types[0]}</p>}
      </div>
      
      <div>
        <label htmlFor="categories" className="block text-sm font-medium mb-1">Categories</label>
        <input id="categories" name="categories" defaultValue={persona?.categories.join(', ')} required className="w-full p-2 border rounded-lg dark:bg-gray-800 dark:border-gray-600" />
        <p className="text-xs text-gray-500 mt-1">Comma-separated values (e.g., fun, beliefs, anime)</p>
        {state?.error?.categories && <p className="text-red-500 text-xs mt-1">{state.error.categories[0]}</p>}
      </div>

      <div className="flex items-center justify-between pt-4">
        <SubmitButton isEditing={isEditing} />
        {isEditing && (
            <button
                type="button"
                onClick={handleDelete}
                disabled={isDeleting}
                className="px-6 py-2 bg-red-600 text-white font-semibold rounded-lg shadow-md hover:bg-red-700 disabled:bg-red-300"
            >
                {isDeleting ? 'Deleting...' : 'Delete'}
            </button>
        )}
      </div>
    </form>
  );
}
// File: components/PersonaForm.tsx
// --- FINAL CORRECTED FILE ---

'use client';

import { useActionState, useEffect, useState } from 'react';
import { useFormStatus } from 'react-dom';
import { createPersona, updatePersona, deletePersona } from '@/app/actions';

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
  const [state, formAction] = useActionState(action, undefined);

  const [isDeleting, setIsDeleting] = useState(false);

  // --- FIX #1 APPLIED HERE ---
  // We derive a new, type-safe variable for field-specific errors.
  // If state.error exists AND it's NOT a form-level error, then it must be field errors.
  // Otherwise, it's an empty object.
  const fieldErrors = 
    state?.error && !('_form' in state.error) ? state.error : {};
  // --- END OF FIX #1 ---


  const handleDelete = async () => {
    if (persona && window.confirm('Are you sure you want to delete this persona? This action cannot be undone.')) {
      setIsDeleting(true);
      await deletePersona(persona.id);
    }
  };
  
  // This useEffect for the general form error is correct and stays the same.
  useEffect(() => {
    if (state?.error && '_form' in state.error && state.error._form) {
      alert(state.error._form.join('\n'));
    }
  }, [state]);

  return (
    <form action={formAction} className="max-w-2xl mx-auto space-y-6 bg-background dark:border-gray-700">
      {isEditing && <input type="hidden" name="id" value={persona.id} />}
      
      {/* --- FIX #2 APPLIED BELOW --- */}
      {/* We now use the clean 'fieldErrors' variable instead of the complex 'state.error' */}
      <div>
        <label htmlFor="name" className="block text-sm font-medium mb-1">Name</label>
        <input id="name" name="name" defaultValue={persona?.name} required className="w-full p-2 border rounded-lg dark:bg-gray-800 dark:border-gray-600" />
        {fieldErrors?.name && <p className="text-red-500 text-xs mt-1">{fieldErrors.name[0]}</p>}
      </div>

      <div>
        <label htmlFor="instruction" className="block text-sm font-medium mb-1">System Instruction (Prompt)</label>
        <textarea id="instruction" name="instruction" defaultValue={persona?.instruction} required rows={10} className="w-full p-2 border rounded-lg dark:bg-gray-800 dark:border-gray-600 bg-gray-100 dark:bg-gray-800 dark:border-gray-600" />
        {fieldErrors?.instruction && <p className="text-red-500 text-xs mt-1">{fieldErrors.instruction[0]}</p>}
      </div>

      <div>
        <label htmlFor="types" className="block text-sm font-medium mb-1">Types</label>
        <input id="types" name="types" defaultValue={persona?.types.join(', ')} required className="w-full p-2 border rounded-lg dark:bg-gray-800 dark:border-gray-600" />
        <p className="text-xs text-gray-500 mt-1">Comma-separated values (e.g., female, romantic, professional)</p>
        {fieldErrors?.types && <p className="text-red-500 text-xs mt-1">{fieldErrors.types[0]}</p>}
      </div>
      
      <div>
        <label htmlFor="categories" className="block text-sm font-medium mb-1">Categories</label>
        <input id="categories" name="categories" defaultValue={persona?.categories.join(', ')} required className="w-full p-2 border rounded-lg dark:bg-gray-800 dark:border-gray-600" />
        <p className="text-xs text-gray-500 mt-1">Comma-separated values (e.g., fun, beliefs, anime)</p>
        {fieldErrors?.categories && <p className="text-red-500 text-xs mt-1">{fieldErrors.categories[0]}</p>}
      </div>
      {/* --- END OF FIX #2 --- */}

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
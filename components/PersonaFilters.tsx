// File: components/PersonaFilters.tsx

'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useTransition } from 'react';

// Define the filter options
const filterOptions = [
  // These could be fetched dynamically in a more advanced setup
  'female', 'male', 'other', 'general', 'romantic', 'dating', 'flirty',
  'complex-relationship', 'beliefs', 'professional', 'service', 'fun',
  'anime', 'diverse'
];

export function PersonaFilters() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { replace } = useRouter();
  const [isPending, startTransition] = useTransition();

  const activeTypes = searchParams.getAll('type');

  const handleFilterChange = (type: string) => {
    const params = new URLSearchParams(searchParams);
    
    // Check if the type is already in the URL params
    const currentTypes = params.getAll('type');
    if (currentTypes.includes(type)) {
      // If it is, filter it out to "uncheck" it
      const newTypes = currentTypes.filter(t => t !== type);
      params.delete('type');
      // --- CORRECTED forEach LOOP ---
      newTypes.forEach(t => {
        params.append('type', t);
      });
    } else {
      // If it's not, add it
      params.append('type', type);
    }
    
    startTransition(() => {
      replace(`${pathname}?${params.toString()}`);
    });
  };

  const handleSearchChange = (term: string) => {
    const params = new URLSearchParams(searchParams);
    if (term) {
      params.set('q', term);
    } else {
      params.delete('q');
    }
    startTransition(() => {
      replace(`${pathname}?${params.toString()}`);
    });
  };

  return (
    <div className="mb-8 space-y-4">
      {/* Search Input */}
      <div>
        <input
          type="text"
          placeholder="Search personas..."
          className="w-full max-w-lg mx-auto p-2 border rounded-lg dark:bg-gray-800 dark:border-gray-600 block" // Added 'block' for centering
          onChange={(e) => handleSearchChange(e.target.value)}
          defaultValue={searchParams.get('q')?.toString() || ''} // Added fallback for defaultValue
        />
      </div>

      {/* Filter Buttons */}
      <div className="flex flex-wrap justify-center gap-2">
        {filterOptions.map((type) => {
          const isActive = activeTypes.includes(type);
          return (
            <button
            type='button'
              key={type}
              onClick={() => handleFilterChange(type)}
              className={`px-3 py-1 text-sm rounded-full border transition-colors ${
                isActive
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-gray-200 dark:bg-gray-700 dark:border-gray-600 hover:bg-gray-300 dark:hover:bg-gray-600'
              }`}
            >
              {type.charAt(0).toUpperCase() + type.slice(1).replace('-', ' ')}
            </button>
          );
        })}
      </div>
      {isPending && <div className="text-center text-sm text-gray-500">Updating results...</div>}
    </div>
  );
}
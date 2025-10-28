// File: components/ChatHeader.tsx
// --- NEW FILE ---

'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import ThemeToggle from './ThemeToggle';
import { ArrowLeftIcon, PencilSquareIcon } from '@heroicons/react/24/outline';

// Define the shape of the persona data this component needs
type Persona = {
  id: string;
  name: string;
  types: string[];
  categories: string[];
};

// Helper function to get initials for the avatar
const getInitials = (name: string) => {
  const words = name.split(' ');
  if (words.length > 1) {
    return (words[0][0] + words[1][0]).toUpperCase();
  }
  return name.substring(0, 2).toUpperCase();
};

export default function ChatHeader({ persona }: { persona: Persona }) {
  const router = useRouter();
  const tags = [...new Set([...persona.types, ...persona.categories])];

  return (
    <div className="p-4 border-b dark:border-gray-700">
      <div className="flex items-center gap-3">
        {/* --- BACK BUTTON --- */}
        <button
          type="button"
          onClick={() => router.back()}
          className="p-2 text-gray-500 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          title="Go Back"
        >
          <ArrowLeftIcon className="h-6 w-6" />
        </button>

        {/* Avatar */}
        <div className="flex-shrink-0 h-12 w-12 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold text-xl">
          {getInitials(persona.name)}
        </div>
        
        {/* Name and Tags */}
        <div className="flex-1 min-w-0">
          <h1 className="text-lg font-semibold truncate">{persona.name}</h1>
          <div className="flex flex-wrap gap-1.5 mt-1">
            {tags.slice(0, 3).map(tag => ( // Show up to 3 tags
              <span key={tag} className="px-2 py-0.5 text-xs font-medium rounded-full bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-200">
                {tag}
              </span>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center">
          <Link
              href={`/personas/${persona.id}/edit`}
              className="p-2 text-gray-500 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 hover:text-blue-500 transition-colors"
              title="Edit Persona"
          >
              <PencilSquareIcon className="h-6 w-6" />
          </Link>
          {/* --- THEME TOGGLE --- */}
          <ThemeToggle />
        </div>
      </div>
    </div>
  );
}
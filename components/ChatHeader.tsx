// File: components/ChatHeader.tsx
// --- UPDATED FILE ---
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import ThemeToggle from './ThemeToggle';
import { ArrowLeftIcon, PencilSquareIcon, TrashIcon, Cog6ToothIcon } from '@heroicons/react/24/outline';
import SpeechSettings from './SpeechSettings';

type Persona = {
  id: string;
  name: string;
  types: string[];
  categories:string[];
};

type ChatHeaderProps = {
  persona: Persona;
  onClearChat: () => void;
  voices: SpeechSynthesisVoice[];
  selectedVoiceURI: string;
  onVoiceChange: (uri: string) => void;
  pitch: number;
  onPitchChange: (pitch: number) => void;
  rate: number;
  onRateChange: (rate: number) => void;
  autoSpeakEnabled: boolean;
  onAutoSpeakChange: (enabled: boolean) => void;
  autoSendEnabled: boolean;
  onAutoSendChange: (enabled: boolean) => void;
};

const getInitials = (name: string) => {
  const words = name.split(' ');
  return words.length > 1 ? (words[0][0] + words[1][0]).toUpperCase() : name.substring(0, 2).toUpperCase();
};

export default function ChatHeader({ persona, onClearChat, ...speechSettingsProps }: ChatHeaderProps) {
  const router = useRouter();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const tags = [...new Set([...persona.types, ...persona.categories])];

  const commonButtonClasses = "p-2 text-gray-500 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors";

  return (
    <header className="sticky top-0 z-20 p-4 border-b bg-white dark:bg-gray-800 dark:border-gray-700">
      <div className="flex items-center gap-3">
        <button type="button" onClick={() => router.back()} className={commonButtonClasses} title="Go Back">
          <ArrowLeftIcon className="h-6 w-6" />
        </button>

        <div className="flex-shrink-0 h-12 w-12 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold text-xl">
          {getInitials(persona.name)}
        </div>
        
        <div className="flex-1 min-w-0">
          <h1 className="text-lg font-semibold truncate">{persona.name}</h1>
          <div className="flex flex-wrap gap-1.5 mt-1">
            {tags.slice(0, 3).map(tag => (
              <span key={tag} className="px-2 py-0.5 text-xs font-medium rounded-full bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-200">
                {tag}
              </span>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-1">
          <Link href={`/personas/${persona.id}/edit`} className={`${commonButtonClasses} hover:text-blue-500`} title="Edit Persona">
              <PencilSquareIcon className="h-6 w-6" />
          </Link>

          <button type="button" onClick={onClearChat} className={`${commonButtonClasses} hover:text-red-500`} title="Clear Conversation">
            <TrashIcon className="h-6 w-6" />
          </button>
          
          <div className="relative">
            <button type="button" onClick={() => setIsSettingsOpen(!isSettingsOpen)} className={`${commonButtonClasses} hover:text-blue-500`} title="Speech Settings">
              <Cog6ToothIcon className="h-6 w-6" />
            </button>
            {isSettingsOpen && (
              <div className="absolute right-0 mt-2 w-72 p-4 bg-white dark:bg-gray-900 rounded-lg shadow-xl border dark:border-gray-700">
                <SpeechSettings {...speechSettingsProps} />
              </div>
            )}
          </div>
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
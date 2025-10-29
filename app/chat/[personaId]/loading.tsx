// File: app/chat/[personaId]/loading.tsx
// --- NEW FILE ---

import { PencilSquareIcon } from '@heroicons/react/24/outline';

export default function ChatLoading() {
  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] bg-background">
      {/* Skeleton Header */}
      <div className="p-4 border-b dark:border-gray-700">
        <div className="flex items-center gap-4 animate-pulse">
          {/* Avatar Skeleton */}
          <div className="h-12 w-12 rounded-full bg-gray-300 dark:bg-gray-700"></div>
          
          {/* Text Skeleton */}
          <div className="flex-1 space-y-2">
            <div className="h-4 w-40 rounded bg-gray-300 dark:bg-gray-700"></div>
            <div className="h-3 w-60 rounded bg-gray-300 dark:bg-gray-700"></div>
          </div>
          
          {/* Button Skeleton */}
          <div className="h-10 w-10 rounded-full bg-gray-300 dark:bg-gray-700"></div>
        </div>
      </div>

      {/* Placeholder for the chat interface */}
      <div className="flex-1 flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <p className="text-gray-500">Loading chat...</p>
      </div>
    </div>
  );
}
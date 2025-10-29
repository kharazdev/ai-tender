// File: components/Header.tsx
// --- NEW FILE ---

'use client'; // The ThemeToggle inside makes this a client component boundary

import Link from 'next/link';
import ThemeToggle from './ThemeToggle'; // We will use the toggle you already have

export default function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 dark:border-gray-700">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-8">
        <Link href="/" className="text-2xl font-bold">
          Persona<span className="text-blue-600">Chat</span>
        </Link>
        <div className="flex items-center space-x-4">
          <Link
            href="/manage"
            className="text-sm font-medium text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors"
          >
            Manage
          </Link>
          {/* 
            This toggle is for the main site pages.
            The one in ChatHeader is for the chat page specifically.
            It's fine to have it in both places for user convenience.
          */}
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
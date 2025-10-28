// File: components/ThemeToggle.tsx
// --- NEW FILE ---

'use client';

import { useTheme } from 'next-themes';
import { SunIcon, MoonIcon } from '@heroicons/react/24/outline';
import { useEffect, useState } from 'react';

export default function ThemeToggle() {
  // We use this 'mounted' state to avoid a hydration mismatch error.
  // The server doesn't know the theme, so we wait until the component
  // is mounted on the client before rendering the button.
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();

  // This effect runs once on the client after the initial render.
  useEffect(() => {
    setMounted(true);
  }, []);

  // If the component is not yet mounted, we render nothing.
  // This ensures the server and client render the same initial HTML.
  if (!mounted) {
    // You could also return a placeholder skeleton here if you want.
    return null;
  }

  // Once mounted, we can safely render the button based on the current theme.
  return (
    <button
      type="button"
      className="p-2 rounded-full text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      aria-label="Toggle theme"
    >
      {theme === 'dark' ? (
        <SunIcon className="h-6 w-6 text-yellow-400" />
      ) : (
        <MoonIcon className="h-6 w-6 text-gray-700" />
      )}
    </button>
  );
}
// File: components/ThemeToggle.tsx
// --- UPDATED FILE ---

'use client';

import { useTheme } from 'next-themes';
import { SunIcon, MoonIcon } from '@heroicons/react/24/outline';
import { useEffect, useState } from 'react';

export default function ThemeToggle() {
  // We use this 'mounted' state to avoid a hydration mismatch error.
  const [mounted, setMounted] = useState(false);
  // Destructure resolvedTheme which is more reliable for checking the current theme
  const { theme, setTheme, resolvedTheme } = useTheme();

  // This effect runs once on the client after the initial render.
  useEffect(() => {
    setMounted(true);
  }, []);

  // --- NEW: useEffect to update localStorage ---
  // This effect runs whenever the resolvedTheme changes.
  useEffect(() => {
    // We need to check if resolvedTheme is defined, as it can be undefined on initial load.
    if (resolvedTheme) {
      const isDark = resolvedTheme === 'dark';
      // Store the boolean value as a string in localStorage.
      localStorage.setItem('isDark', JSON.stringify(isDark));
    }
    // The dependency array ensures this effect runs only when resolvedTheme changes.
  }, [resolvedTheme]);

  // If the component is not yet mounted, we render nothing.
  if (!mounted) {
    return null;
  }

  // Once mounted, we can safely render the button.
  // Using resolvedTheme here is also a good practice for consistency.
  const isCurrentlyDark = resolvedTheme === 'dark';

  return (
    <button
      type="button"
      className="p-2 rounded-full text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
      onClick={() => setTheme(isCurrentlyDark ? 'light' : 'dark')}
      aria-label="Toggle theme"
    >
      {isCurrentlyDark ? (
        <SunIcon className="h-6 w-6 text-yellow-400" />
      ) : (
        <MoonIcon className="h-6 w-6 text-gray-700" />
      )}
    </button>
  );
}
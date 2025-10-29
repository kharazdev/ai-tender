// File: components/ThemeProvider.tsx
// --- FULLY CORRECTED FILE ---

'use client';

import * as React from 'react';
import { ThemeProvider as NextThemesProvider } from 'next-themes';
// --- FIX APPLIED HERE ---
// We import the type directly from the main package, not an internal path.
import type { ThemeProviderProps } from 'next-themes';
// --- END OF FIX ---

// This is a "pass-through" component. It marks the provider from the 'next-themes'
// library as a Client Component, which is required for it to work in the App Router.
export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
}
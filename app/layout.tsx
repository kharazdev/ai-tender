// File: app/layout.tsx
// --- CRITICAL FIX ---

import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { ThemeProvider } from '../components/ThemeProvider'; // <-- 1. IMPORT THE PROVIDER
import Header from '../components/Header';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'PersonaChat AI',
  description: 'Chat with customizable AI personas',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    // Add suppressHydrationWarning for next-themes compatibility
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        {/* 2. WRAP YOUR ENTIRE APP WITH THE ThemeProvider */}
        <ThemeProvider
          attribute="class" // <-- THIS IS THE MOST CRITICAL PROP!
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <Header />
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
// File: app/layout.tsx
// --- NEW OR REPLACED FILE ---

import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { ThemeProvider } from '@/components/ThemeProvider'; // <-- IMPORT
import Header from '@/components/Header'; // <-- IMPORT
import PasswordProtect from '../components/PasswordProtect'; // Adjust path if needed

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
    // This 'suppressHydrationWarning' is important for next-themes
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        {/* The ThemeProvider wraps everything, enabling theme changes */}
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {/* The Header is now part of the layout, appearing on all pages */}
          <Header />

          {/* 'children' will be the content of your individual pages */}
          <PasswordProtect>
            <main>{children}</main>  
          </PasswordProtect>
        </ThemeProvider>
      </body>
    </html>
  );
}
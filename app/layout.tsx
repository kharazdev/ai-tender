// File: app/layout.tsx
// --- FINAL FIX ---

import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { ThemeProvider } from '../components/ThemeProvider';
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
    <html lang="en" suppressHydrationWarning>
      {/* 
        Apply base theme classes here.
        This uses the classes Tailwind now knows about from the config,
        which in turn use the CSS variables from globals.css.
        All your other styles will now work correctly on top of this.
      */}
      <body className={`${inter.className} bg-background text-foreground`}>
        <ThemeProvider
          attribute="class" // This now works perfectly
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
// File: tailwind.config.ts
// --- ADD THIS EXTENSION ---

import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: 'class', // This is correct
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      // V-- THIS IS THE KEY ADDITION --V
      colors: {
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
      },
      // ^-- THIS IS THE KEY ADDITION --^
    },
  },
  plugins: [],
}
export default config
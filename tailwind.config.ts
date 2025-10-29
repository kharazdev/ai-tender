// File: tailwind.config.ts

import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: 'class', // <-- VERIFY THIS LINE EXISTS
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      // ... your theme extensions
    },
  },
  plugins: [],
}
export default config
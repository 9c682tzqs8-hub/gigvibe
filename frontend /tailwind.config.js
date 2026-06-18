// tailwind.config.js
/** @type {import('tailwindcss').Config} */
export default  {
  darkMode: 'class', // Controlled explicitly via a 'dark' class on the HTML tag
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#0B0F19', // Deep dark blue-gray background
        surface: '#161F30',    // Lighter surface containers (cards/modals)
        border: '#24324D',     // Subtle structural borders
        primary: {
          DEFAULT: '#6366F1',  // Indigo accent
          hover: '#4F46E5',
        },
        secondary: {
          DEFAULT: '#A855F7',  // Vibrant purple action items
          hover: '#9333EA',
        },
        text: {
          primary: '#F9FAFB',  // Off-white readable text
          secondary: '#9CA3AF',// Dimmed gray subtext
        }
      },
    },
  },
  plugins: [],
};
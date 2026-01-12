/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // WhatsApp Official Brand Colors (2024/Web Style)
        wa: {
          teal: '#008069',      // Main Header / Primary Buttons
          dark: '#075E54',      // Darker Teal for hover states
          light: '#25D366',     // Logo Green / Accents
          bg: '#F0F2F5',        // Main App Background (Light Gray)
          white: '#FFFFFF',     // Card Backgrounds
          chat: '#E7FCE3',      // Outgoing Message Bubble Green
          gray: {
            50: '#F0F2F5',
            100: '#E9EDEF',
            200: '#D1D7DB',
            300: '#8696A0', // Secondary Text
            400: '#667781',
            500: '#3B4A54', // Primary Text
            600: '#111B21', // Dark Text
          }
        },
        // Semantic Colors (Simpler)
        success: '#008069', // Match primary for success
        danger: '#EA0038',  // WhatsApp Red
        warning: '#FFBF00',
        info: '#3B82F6',
      },
      fontFamily: {
        sans: ['Segoe UI', 'Helvetica Neue', 'Helvetica', 'Arial', 'sans-serif'],
      },
      boxShadow: {
        'wa': '0 1px 0.5px rgba(11,20,26,.13)', // Subtle WhatsApp native shadow
        'card': '0 2px 5px rgba(11,20,26,.1)',
      }
    },
  },
  plugins: [],
}

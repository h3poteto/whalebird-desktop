module.exports = {
  content: ['./node_modules/flowbite-react/**/*.js', './renderer/pages/**/*.{js,ts,jsx,tsx}', './renderer/components/**/*.{js,ts,jsx,tsx}'],
  plugins: [require('flowbite/plugin')],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // flowbite-svelte
        // Refs: https://github.com/themesberg/flowbite-svelte/blob/main/tailwind.config.cjs
        primary: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a'
        }
      }
    }
  }
}

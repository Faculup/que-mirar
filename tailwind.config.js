/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {
      colors: {
        // Black palette
        'primary-dark': '#161d31',
        'secondary-dark': '#283046',
        'accent-dark': '#591bc5',

        // White palette
        'primary-light': '#ffffff',
        'secondary-light': '#f8f9fa',
        'accent-light': '#007bff',
      },
    },
  },
  plugins: [],
  darkMode: 'class', // Enable dark mode via class
}
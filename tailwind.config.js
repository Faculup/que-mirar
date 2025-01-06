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
      gridTemplateRows: {
        // Adds a custom 18-row grid
        '18': 'repeat(18, minmax(0, 1fr))',
      },
      gridRowStart: {
        // Extend gridRowStart to include 18
        '18': '18',
      },
      gridRowEnd: {
        // Extend gridRowEnd to include 19
        '19': '19',
      },
    },
  },
  plugins: [],
  darkMode: 'class', // Enable dark mode via class
}
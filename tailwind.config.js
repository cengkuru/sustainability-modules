/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{html,ts}'],
  theme: {
    extend: {
      colors: {
        primary: '#FAFAFA', // Light Gray
        secondary: '#58707B', // Muted Blue
        accent: '#FFCE32', // Bright Yellow
      },
      typography: {
        DEFAULT: {
          css: {
            color: '#58707B', // Secondary color for text
            a: {
              color: '#FFCE32', // Accent color for links
              '&:hover': {
                color: '#FFCE32',
              },
            },
            h1: {
              color: '#58707B', // Secondary color for headings
            },
            h2: {
              color: '#58707B',
            },
            h3: {
              color: '#58707B',
            },
            p: {
              marginBottom: '1.5em',
              lineHeight: '1.5',
            },
          },
        },
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
}


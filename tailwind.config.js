/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{html,ts}'],
  theme: {
    extend: {
      colors: {
        primary: '#FAFAFA', // Light Gray
        secondary: '#58707B', // Muted Blue
        accent: '#FFCE32', // Bright Yellow
        customGray: '#D8D8CD', // Custom gray color
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
      fontSize: {
        base: ['16px', '1.5'], // Set the base font size and line height
      },
      keyframes: {
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
      animation: {
        slideUp: 'slideUp 0.5s ease-in-out',
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
}

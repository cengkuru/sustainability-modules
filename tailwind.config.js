/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{html,ts}'],
  theme: {
    extend: {
      colors: {
        primary: '#fff', // white
        secondary: '#333333', // Muted Blue
        accent: '#FFCE32', // Bright Yellow
        customGray: '#F7F7F7', // Custom gray color
      },
      typography: {
        DEFAULT: {
          css: {
            color: '#333333', // Secondary color for text
            a: {
              color: '#FFCE32', // Accent color for links
              '&:hover': {
                color: '#FFCE32',
              },
            },
            h1: {
              color: '#333333', // Secondary color for headings
            },
            h2: {
              color: '#333333',
            },
            h3: {
              color: '#333333',
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

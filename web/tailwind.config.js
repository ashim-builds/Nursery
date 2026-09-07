/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        forest: {
          50: '#f2f8f4',
          100: '#e1efe7',
          200: '#c4e0d1',
          300: '#99caaF',
          400: '#69ad8a',
          500: '#43906a',
          600: '#327453',
          700: '#285c44',
          800: '#234a38',
          900: '#1e3f30',
          950: '#0f241c',
        },
        moss: {
          50: '#f4f9f2',
          100: '#e5f2e1',
          200: '#cde6c7',
          300: '#a7d39d',
          400: '#7cb970',
          500: '#5b9d4e',
          600: '#457d3b',
          700: '#386331',
          800: '#304f2b',
          900: '#294326',
        },
        terracotta: {
          50: '#fdf6f2',
          100: '#faece4',
          200: '#f5d6c8',
          300: '#edb59f',
          400: '#e28e71',
          500: '#d76f4e',
          600: '#c75435',
          700: '#a64228',
          800: '#863825',
          900: '#6e3123',
        },
        sand: {
          50: '#faf9f6',
          100: '#f4f1ea',
          200: '#e9e3d5',
          300: '#dbcfbb',
          400: '#c8b69c',
          500: '#b8a082',
        }
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'system-ui', '-apple-system', 'sans-serif'],
        serif: ['"Playfair Display"', 'Georgia', 'serif'],
      },
      boxShadow: {
        'soft': '0 4px 20px -2px rgba(15, 36, 28, 0.06), 0 2px 6px -1px rgba(15, 36, 28, 0.04)',
        'lifted': '0 10px 30px -4px rgba(15, 36, 28, 0.1), 0 4px 10px -2px rgba(15, 36, 28, 0.05)',
        'mobile-bar': '0 -4px 24px rgba(0, 0, 0, 0.08)',
      },
      screens: {
        'xs': '360px',
        'sm': '640px',
        'md': '768px',
        'lg': '1024px',
        'xl': '1280px',
        '2xl': '1536px',
      }
    },
  },
  plugins: [],
}

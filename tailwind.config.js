/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50:  '#eefbf3',
          100: '#d6f5e1',
          200: '#aeebc3',
          300: '#7add9f',
          400: '#43c777',
          500: '#1faa5b',
          600: '#138846',
          700: '#106b3a',
          800: '#0f5530',
          900: '#0c4528'
        },
        ink: {
          50:  '#f6f7f9',
          100: '#ebedf1',
          200: '#d3d7df',
          300: '#aab1be',
          400: '#7b8395',
          500: '#5b6275',
          600: '#454c5d',
          700: '#383e4d',
          800: '#2a2f3b',
          900: '#1c2029'
        }
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif']
      },
      boxShadow: {
        card: '0 1px 2px rgba(15, 23, 42, 0.04), 0 4px 12px rgba(15, 23, 42, 0.06)'
      }
    }
  },
  plugins: []
}

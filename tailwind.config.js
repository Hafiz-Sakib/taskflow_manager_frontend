/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Hind Siliguri"', 'system-ui', '-apple-system', 'Segoe UI', 'sans-serif'],
      },
      colors: {
        brand: {
          50: '#f2f0ff',
          100: '#e6e2ff',
          200: '#cdc5ff',
          300: '#ac9dff',
          400: '#8a72ff',
          500: '#6d5dfc',
          600: '#5842e0',
          700: '#4632b3',
          800: '#362686',
          900: '#241a59',
          950: '#150f38',
        },
        ink: {
          50: '#f5f5fa',
          100: '#e8e8f2',
          200: '#d3d3e6',
          300: '#b2b2cf',
          400: '#8b8ba7',
          500: '#6e7191',
          600: '#565973',
          700: '#3f3d56',
          800: '#252336',
          900: '#14142b',
          950: '#0d0d1a',
        },
        priority: {
          low: '#28c281',
          medium: '#f5a15c',
          high: '#ef4d6b',
        },
      },
      borderRadius: {
        xl2: '1.25rem',
      },
      boxShadow: {
        card: '0 12px 30px -12px rgba(20, 20, 43, 0.12)',
        soft: '0 6px 16px -6px rgba(20, 20, 43, 0.08)',
        'card-dark': '0 12px 30px -12px rgba(0, 0, 0, 0.5)',
      },
      backgroundImage: {
        'brand-gradient': 'linear-gradient(135deg, #241549 0%, #5842e0 38%, #b13bde 68%, #ef5da8 88%, #f5a15c 100%)',
      },
    },
  },
  plugins: [],
};

/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
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
        success: '#28c281',
        warning: '#f5a15c',
        danger: '#ef4d6b',
        info: '#3b6cf6',
      },
      spacing: {
        4.5: '1.125rem',
        18: '4.5rem',
      },
      borderRadius: {
        xl2: '1.25rem',
      },
      boxShadow: {
        xs: '0 1px 2px 0 rgba(20,20,43,0.05)',
        sm: '0 2px 6px -1px rgba(20,20,43,0.06)',
        card: '0 12px 30px -12px rgba(20,20,43,0.14)',
        soft: '0 6px 16px -6px rgba(20,20,43,0.08)',
        popover: '0 20px 45px -15px rgba(20,20,43,0.25)',
        'card-dark': '0 12px 30px -12px rgba(0,0,0,0.5)',
      },
      backgroundImage: {
        'brand-gradient': 'linear-gradient(135deg, #241549 0%, #5842e0 38%, #b13bde 68%, #ef5da8 88%, #f5a15c 100%)',
      },
      keyframes: {
        'fade-in': { from: { opacity: 0 }, to: { opacity: 1 } },
        shimmer: { '100%': { transform: 'translateX(100%)' } },
      },
      animation: {
        'fade-in': 'fade-in 0.15s ease-out',
        shimmer: 'shimmer 1.6s infinite',
      },
    },
  },
  plugins: [],
};

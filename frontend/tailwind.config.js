/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,jsx,ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        // IncuBrix SaaS Unified Palette
        primary: {
          DEFAULT: '#5145CD',
          50: '#F7F7FC',
          100: '#EAE7FF',
          200: '#d7d2ff',
          300: '#b8aefc',
          400: '#8c7df8',
          500: '#695bf0',
          600: '#5145CD',
          700: '#4336b8',
          800: '#322790',
          900: '#171A35',
        },
        navy: {
          DEFAULT: '#171A35',
          50: '#f4f5f8',
          100: '#e5e7ee',
          200: '#c5c9d9',
          500: '#3b426f',
          800: '#202447',
          900: '#171A35',
        },
        surface: '#FFFFFF',
        coral: {
          DEFAULT: '#FF786B',
          50: '#fff5f4',
          100: '#ffebe9',
          200: '#ffd3cf',
          300: '#ffb5ad',
          400: '#ff8f84',
          500: '#FF786B',
          600: '#e55a4d',
          700: '#c43d31',
        },
        lavender: {
          DEFAULT: '#EAE7FF',
          50: '#fbfaff',
          100: '#EAE7FF',
          200: '#d9d4fe',
          300: '#bfb5fd',
        },
        success: {
          DEFAULT: '#168568',
          50: '#f0fdf9',
          100: '#d1fae5',
          500: '#168568',
          600: '#126d55',
          700: '#0d5442',
        },
        brandBorder: '#E5E7F0',
        canvas: '#F7F7FC',

        // Map bloom to the primary indigo & lavender scale to seamlessly refresh all components
        bloom: {
          50:  '#F7F7FC',
          100: '#EAE7FF',
          200: '#d7d2ff',
          300: '#b8aefc',
          400: '#8c7df8',
          500: '#695bf0',
          600: '#5145CD',
          700: '#4336b8',
          800: '#322790',
          900: '#171A35',
        },
        accent: {
          400: '#ff8f84',
          500: '#FF786B',
          600: '#e55a4d',
        },
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}

/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    '../../packages/ui/src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Custom cyan palette derived from brand color #02ddf5
        cyan: {
          50: '#e6fcfd',
          100: '#b3f7fa',
          200: '#80f1f7',
          300: '#4debf4',
          400: '#1ae4f2',
          500: '#02ddf5',
          600: '#02b8cc',
          700: '#0293a3',
          800: '#016e7a',
          900: '#014952',
          950: '#012429',
        },
      },
    },
  },
  plugins: [],
};

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        navy: {
          DEFAULT: "#0b1220",
          800: "#111827",
          700: "#1e293b",
        },
        cyan: {
          400: "#1ae4f2",
          500: "#02ddf5",
          600: "#02b8cc",
        },
      },
    },
  },
  plugins: [],
};

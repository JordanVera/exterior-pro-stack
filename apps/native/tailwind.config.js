/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        brand: {
          lime: "#C8F542",
          navy: "#0B1F33",
          ink: "#0A1208",
          night: "#070B12",
          mist: "#F4F6F0",
        },
        navy: {
          DEFAULT: "#0B1F33",
          900: "#070B12",
          800: "#0B1F33",
          700: "#163552",
        },
      },
    },
  },
  plugins: [],
};

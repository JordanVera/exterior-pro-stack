/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      // React Native does not synthesize weights for custom fonts, so each
      // Outfit weight is registered as its own family. Use font-semibold /
      // font-bold as usual; they map to the real cut rather than a faux one.
      fontFamily: {
        sans: ["Outfit_400Regular"],
        medium: ["Outfit_500Medium"],
        semibold: ["Outfit_600SemiBold"],
        bold: ["Outfit_700Bold"],
      },
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
        // Field-first surfaces: neutral greys, not tinted. A blue cast reads as
        // muddy next to the lime accent, and neutral separates from the
        // near-black background more cleanly in bright outdoor light.
        surface: {
          DEFAULT: "#151517",
          raised: "#1F1F22",
          sunken: "#0C0C0D",
        },
        line: {
          DEFAULT: "rgba(255,255,255,0.10)",
          strong: "rgba(255,255,255,0.18)",
        },
      },
    },
  },
  plugins: [],
};

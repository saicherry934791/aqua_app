/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./App.tsx",
    "./components/**/*.{js,jsx,ts,tsx}",
    "./app/**/*.{js,jsx,ts,tsx}",
    "./hooks/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        primary: "#121417",
        secondary: "#697A82",
        tertiary: "#207DBA",
      },
      fontFamily: {
        "grotesk-light": ["SpaceGrotesk_300Light"],
        grotesk: ["Outfit_400Regular"],
        "grotesk-medium": ["Outfit_500Medium"],
        "grotesk-semibold": ["Outfit_600SemiBold"],
        "grotesk-bold": ["Outfit_700Bold"],
      },
    },
  },
  plugins: [],
  corePlugin: {
    textOpacity: true,
  },
};

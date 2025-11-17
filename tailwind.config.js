/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        pumpkin: {
          50: "#fff6ec",
          100: "#ffe3c7",
          200: "#ffca8f",
          300: "#ffb057",
          400: "#ff9830",
          500: "#fb7e0d",
          600: "#dc6407",
          700: "#b24a09",
          800: "#8a3b0e",
          900: "#6e300f",
        },
      },
      fontFamily: {
        display: ["'Great Vibes'", "cursive"],
      },
      boxShadow: {
        poster: "0 18px 48px rgba(109, 39, 6, 0.35)",
        glow: "0 0 30px rgba(255, 197, 122, 0.35)",
      },
    },
  },
  plugins: [],
};




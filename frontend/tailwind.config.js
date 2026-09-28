/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#b159cc",
        success: "#7671d7",
        danger: "#ef4444",
      },
    },
  },
  plugins: [],
};

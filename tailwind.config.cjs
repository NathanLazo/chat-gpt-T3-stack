/** @type {import('tailwindcss').Config} */
const config = {
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {},
  },
  plugins: [
    // ...
    require("@tailwindcss/forms"),
    require("@tailwindcss/typography"),
  ],
};

module.exports = config;

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    colors: {
      "white-color": "#FFFFFF",
      "white-gradient-color": "#FBFBFB",
      "gray-color": "#F1F1F1",
      "grey-2-color": "#dedddd",
      "grey-3-color": "#8d8d8d",
      "black-color": "#000000",
      "black-color-hover": "#242424",
      "vivid-color": "#5651FF",
      "vivid-color-hover": "#605BFF",
      "green-color": "#6FCF97",
      "yellow-color": "#EDEF7C",
    },
    borderRadius: {
      "4xl": "1rem",
      md: "0.5rem",
    },
  },
  plugins: [],
};

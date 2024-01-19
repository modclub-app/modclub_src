/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "@/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "@/components/**/*.{js,ts,jsx,tsx,mdx}",
    "@/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    screens: {
      sm: "480px", // 30rem
      md: "768px", // 48rem
      lg: "976px", // 61rem
      xl: "1440px", // 90rem
    },
    fontSize: {
      base: "1rem",
    },
    extend: {
      spacing: {
        5: "1.25rem",
      },
      gridTemplateColumns: {
        8: "repeat(8, minmax(0, 1fr))",
        12: "repeat(12, minmax(0, 1fr))",
      },
      gridGap: {
        5: "1.25rem",
      },
    },
  },
  plugins: [],
};

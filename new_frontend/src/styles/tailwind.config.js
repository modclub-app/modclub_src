/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "@/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "@/components/**/*.{js,ts,jsx,tsx,mdx}",
    "@/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    borderColor: (theme) => ({
      ...theme("colors"),
      DEFAULT: theme("colors.green.100", "currentColor"),
      primary: "#1B4444",
      secondary: "#66DD95",
    }),
    extend: {
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
    },
  },
  plugins: [],
};

import type { Config } from "tailwindcss";

export default {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        myBackgroundGrey: "#272727",
        myMessageGrey: "#444444",
        myTextGrey: "#E5E5E5",
        gradientBlue1: "#0057D1",
        gradientBlue2: "#0012B6",
        popupGrey: "#171616",
        myCodeBackground: "#1a1a1a",
        myQuoteBackground: "#787878",
      },
    },
  },
  plugins: [require("@tailwindcss/typography")],
} satisfies Config;

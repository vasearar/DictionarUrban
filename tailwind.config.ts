import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
      fontFamily: {
        Unbounded: ['"Unbounded"', "sans-serif"],
        Spacegrotesc: ['"Space Grotesk"', "sans-serif"],
      },
      colors: {
        myorange: '#E86842',
        mygray: '#202020',
        mywhite: "#f1f1f1",
      },
    },
  },
  plugins: [],
};
export default config;

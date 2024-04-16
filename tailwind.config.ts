import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        Unbounded: ['"Unbounded"', "sans-serif"],
        Spacegrotesc: ['"Space Grotesk"', "sans-serif"],
      },
      colors: {
        myorange: '#E86842',
        mygray: '#202020',
        mywhite: "#F1F1F1",
        myhoverorange: '#EA8A6D',
        myhovergray: '#545454',
        mydarkhovergray: '#BDBDBD',
        mydarkhoverorange: '#B65639',
      },
    },
  },
  plugins: [],
};
export default config;

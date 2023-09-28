/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/modules/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/utils/constants/tailwind/index.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      fontFamily: {
        "font-poppins": "var(--font-poppins)",
      },

      colors: {
        aquatic: "#13EFA0",
        "light-gold": "#FEE954",
        "hard-pink": "#FF2B91",
        "common-orange": "#FF6A00"
      },

      fontSize: {
        "4xl": "2.25rem",
      },

      boxShadow: {
        button: "box-shadow: 0px 4px 4px 0px rgba(0, 0, 0, 0.25)",
        input: "box-shadow: 0px 4px 9px 1px rgba(0, 0, 0, 0.25)        "
      },

      animation: {
        text: "text 5s ease infinite",
        shake: "shake 1s ease 1",
      },
      keyframes: {
        text: {
          "0%, 100%": {
            "background-size": "300% 300%",
            "background-position": "left center",
          },
          "50%": {
            "background-size": "300% 300%",
            "background-position": "right center",
          },
        },

        shake: {
          "0%, 100%": {
            transform: "translateX(0)",
          },
          "10%, 30%, 50%, 70%, 90%": {
            transform: "translateX(-3px)",
          },
          "20%, 40%, 60%, 80%": {
            transform: "translateX(3px)",
          },
        }
      },
    },
  },
  plugins: [],
};

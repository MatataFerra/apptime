/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/modules/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/utils/constants/tailwind/index.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
	],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      fontFamily: {
        "font-poppins": "var(--font-poppins)",
      },

      colors: {
        aquatic: "#13EFA0",
        "light-gold": "#FEE954",
        "post-it-button": "#EB8F00",
        "hard-pink": "#FF2B91",
        "common-orange": "#FF6A00",
        "light-blue": "#64C2DB",
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      fontSize: {
        "4xl": "2.25rem",
      },

      dropShadow: {
        button: "0px 4px 4px rgba(0, 0, 0, 0.25)"
      },

      boxShadow: {
        button: "0px 4px 4px 0px rgba(0, 0, 0, 0.25)",
        "button-inner": "inset 0px 4px 4px 0px rgba(0, 0, 0, 0.25)",
        input: "0px 4px 9px 1px rgba(0, 0, 0, 0.25)"
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: 0 },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: 0 },
        },

        "dissapear-up": {
          to: { transform: "translateY(-15rem)" },
          from: { transform: "translateY(0)" },
        },

        'fade-down': {
          '0%': {
              opacity: '0',
              transform: 'translateY(-2rem)',
          },
          '100%': {
              opacity: '1',
              transform: 'translateY(0)',
          },
        },

        'fade-up': {
          '0%': {
              opacity: '0',
              transform: 'translateY(2rem)',
          },
          '100%': {
              opacity: '1',
              transform: 'translateY(0)',
          },
        },

        "fade_in": {
          "0%": {
            opacity: 0,
          },
          "100%": {
            opacity: 1,
          },
        
        },

        "fade_out": {
          "0%": {
            opacity: 1,
          },
          "100%": {
            opacity: 0,
          },
        },

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
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        text: "text 5s ease infinite",
        shake: "shake 1s ease 1",
        "fade-in": "fade_in 0.5s ease-in-out",
        "fade-out": "fade_out 0.5s ease-in-out",
        "fade-down": "fade-down 0.5s ease-in-out",
        "fade-up": "fade-up 0.5s ease-in-out",
        "dissapear-up": "dissapear-up 0.5s ease-in-out forwards",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}

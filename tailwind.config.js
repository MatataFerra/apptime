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
        "clamp-1-to-2.5": "clamp(1rem, 5vw, 2.5rem)",
        "clamp-1-to-3": "clamp(1rem, 5vw, 3rem)"
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

      backgroundPosition: {
        'pos-0': '0% 0%',
        'pos-100': '100% 100%',
      },
      backgroundSize: {
        'size-200': '200% 200%',
        'size-400': '400% 400%',
      },

      backgroundImage: {
        lightning: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 24 24' xmlns:rdf='http://www.w3.org/1999/02/22-rdf-syntax-ns%23' xmlns='http://www.w3.org/2000/svg' version='1.1' xmlns:cc='http://creativecommons.org/ns%23' xmlns:dc='http://purl.org/dc/elements/1.1/' fill='%23000000'%3E%3Cg id='SVGRepo_bgCarrier' stroke-width='0'%3E%3C/g%3E%3Cg id='SVGRepo_tracerCarrier' stroke-linecap='round' stroke-linejoin='round'%3E%3C/g%3E%3Cg id='SVGRepo_iconCarrier'%3E%3Cg transform='translate(0 -1028.4)'%3E%3Cg%3E%3Cpath d='m7 1028.4-5 12h8l-4 10 14-14h-9l6-8z' fill='%23f1c40f'%3E%3C/path%3E%3Cpath fill='%23f39c12' d='m7 1028.4-5 12h3l5-12zm3 12-4 10 3-3 4-7z'%3E%3C/path%3E%3Cpath fill='%23e67e22' d='m10 1040.4-0.4062 1h2.9062l0.5-1h-3z'%3E%3C/path%3E%3C/g%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")",
        clock: "url(\"data:image/svg+xml,%3Csvg height='200px' width='200px' version='1.1' id='Layer_1' xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink' viewBox='0 0 512 512' xml:space='preserve' fill='%23000000'%3E%3Cg id='SVGRepo_bgCarrier' stroke-width='0'%3E%3C/g%3E%3Cg id='SVGRepo_tracerCarrier' stroke-linecap='round' stroke-linejoin='round'%3E%3C/g%3E%3Cg id='SVGRepo_iconCarrier'%3E%3Cpath style='fill:%23507C5C;' d='M260.918,229.494H197.54c-7.976,0-14.441-6.466-14.441-14.441v-64.045 c0-7.974,6.465-14.441,14.441-14.441s14.441,6.466,14.441,14.441v49.605h48.938c7.974,0,14.441,6.466,14.441,14.441 C275.359,223.027,268.894,229.494,260.918,229.494z'%3E%3C/path%3E%3Cpath style='fill:%23CFF09E;' d='M229.278,54.945H164.47c-11.138,0-20.253-9.113-20.253-20.253l0,0 c0-11.138,9.113-20.253,20.253-20.253h64.808c11.139,0,20.253,9.113,20.253,20.253l0,0 C249.531,45.831,240.417,54.945,229.278,54.945z'%3E%3C/path%3E%3Cpath style='fill:%23507C5C;' d='M229.278,69.387H164.47c-19.129,0-34.692-15.563-34.692-34.692C129.778,15.563,145.341,0,164.47,0 h64.808c19.129,0,34.692,15.563,34.692,34.693C263.971,53.823,248.407,69.387,229.278,69.387z M164.47,28.881 c-3.151,0-5.811,2.663-5.811,5.812c0,3.149,2.661,5.811,5.811,5.811h64.808c3.151,0,5.811-2.661,5.811-5.811 c0-3.149-2.66-5.812-5.811-5.812H164.47z'%3E%3C/path%3E%3Ccircle style='fill:%23CFF09E;' cx='345.578' cy='373.621' r='123.929'%3E%3C/circle%3E%3Cg%3E%3Cpath style='fill:%23507C5C;' d='M345.583,512c-76.3,0-138.375-62.076-138.375-138.377s62.076-138.375,138.375-138.375 c76.301,0,138.377,62.074,138.377,138.375S421.884,512,345.583,512z M345.583,264.128c-60.376,0-109.494,49.12-109.494,109.494 c0,60.377,49.118,109.495,109.494,109.495c60.377,0,109.495-49.12,109.495-109.496 C455.079,313.247,405.961,264.128,345.583,264.128z'%3E%3C/path%3E%3Cpath style='fill:%23507C5C;' d='M160.633,379.599c-1.119,0-2.256-0.13-3.391-0.403c-36.218-8.718-69.032-29.636-92.394-58.906 C41.112,290.551,28.04,253.178,28.04,215.053c0-93.095,75.739-168.833,168.835-168.833c40.194,0,79.134,14.365,109.647,40.452 c30.166,25.791,50.361,61.447,56.864,100.397c1.313,7.866-4,15.308-11.866,16.621c-7.854,1.31-15.307-3.999-16.621-11.866 C323.608,124.19,265.558,75.101,196.875,75.101c-77.17,0-139.954,62.783-139.954,139.952c0,64.939,44.032,120.889,107.078,136.063 c7.755,1.867,12.527,9.665,10.66,17.42C173.068,375.153,167.153,379.599,160.633,379.599z'%3E%3C/path%3E%3Cpath style='fill:%23507C5C;' d='M340.659,427.904c-20.728-0.692-37.654-11.401-37.654-22.455c0-5.872,5.181-14.51,11.746-14.51 c7.253,0,13.126,10.192,25.908,12.436v-27.982c-15.89-6.046-34.546-13.473-34.546-35.583c0-21.937,16.237-32.472,34.546-35.063 v-4.838c0-2.419,2.764-4.663,6.565-4.663c3.281,0,6.563,2.245,6.563,4.663v4.318c10.709,0.345,30.919,3.109,30.919,15.027 c0,4.663-3.109,14.165-10.709,14.165c-5.7,0-8.982-5.526-20.21-6.391v25.219c15.719,5.872,34.026,13.99,34.026,37.309 c0,21.42-13.817,34.374-34.026,37.655v5.009c0,2.419-3.281,4.663-6.563,4.663c-3.801,0-6.565-2.245-6.565-4.663V427.904z M342.386,348.104v-20.553c-7.773,1.554-11.054,5.526-11.054,9.672C331.332,342.231,335.823,345.34,342.386,348.104z M352.06,380.058v23.145c5.873-1.382,10.537-4.663,10.537-10.882C362.596,386.621,358.278,382.995,352.06,380.058z'%3E%3C/path%3E%3Cpath style='fill:%23507C5C;' d='M299.153,113.849c-3.697,0-7.391-1.411-10.211-4.23c-5.639-5.639-5.639-14.781,0-20.423 l25.145-25.147c5.638-5.638,14.781-5.638,20.423,0c5.639,5.639,5.639,14.781,0,20.423l-25.145,25.147 C306.545,112.438,302.848,113.849,299.153,113.849z'%3E%3C/path%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")",
        box: "url(\"data:image/svg+xml,%3Csvg height='200px' width='200px' version='1.1' id='Layer_1' xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink' viewBox='0 0 512 512' xml:space='preserve' fill='%23000000'%3E%3Cg id='SVGRepo_bgCarrier' stroke-width='0'%3E%3C/g%3E%3Cg id='SVGRepo_tracerCarrier' stroke-linecap='round' stroke-linejoin='round'%3E%3C/g%3E%3Cg id='SVGRepo_iconCarrier'%3E%3Cpolygon style='fill:%23E0B76E;' points='376.808,187.877 256,512 28.996,384.006 28.996,127.994 '%3E%3C/polygon%3E%3Cpolygon style='fill:%23F4CE8F;' points='256,0 28.996,127.994 256,256 256,512 483.004,384.006 483.004,127.994 '%3E%3C/polygon%3E%3Cpolygon style='fill:%23F2CA7F;' points='256,256 256,512 483.004,384.006 483.004,127.994 '%3E%3C/polygon%3E%3Cpolyline style='fill:%2379B1D6;' points='331.205,42.407 104.201,170.401 174.43,210.009 401.434,82.004 401.445,82.004 '%3E%3C/polyline%3E%3Cg%3E%3Cpolygon style='fill:%23898686;' points='403.227,272.518 369.285,248.933 334.261,311.297 360.046,296.799 360.046,402.452 377.989,392.332 377.989,286.709 '%3E%3C/polygon%3E%3Cpolygon style='fill:%23898686;' points='166.189,257.591 166.189,278.202 64.679,220.951 64.679,200.353 '%3E%3C/polygon%3E%3Cpolygon style='fill:%23898686;' points='166.189,308.908 166.189,329.519 64.679,272.28 64.679,251.682 '%3E%3C/polygon%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")"
      },
      

      transitionDuration: {
        2000: "2000ms",
        5000: "5000ms",
        10000: "10000ms",
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

        "hide-left": {
          to: { transform: "translateX(0)", opacity: 0 },
          from: { transform: "translateX(-100%)", opacity: 1},
        },

        "show-right": {
          to: { transform: "translateX(-100%)", opacity: 1 },
          from: { transform: "translateX(0)", opacity: 0 },
        },
        'fade-in':  {
          '0%': {
              opacity: '0',
          },
          '100%': {
              opacity: '1',
          },
        },

        'fade-out': {
          '0%': {
              opacity: '1',
          },
          '100%': {
              opacity: '0',
          },
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

        "fade-out-left": {
          "0%": {
            "opacity": "1",
            "transform": "translateX(0)"
          },
          "100%": {
            "opacity": "0",
            "transform": "translateX(-200px)"
          }
        },

        ripple: {
          "0%": {
            transform: "scale3d(0.3,0.3,1)",
          },
          "50%": {
            opacity:"1"
          },
          "100%": {
            transform: "scale3d(1.2,1.2,1)",
            opacity: "0",
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
        },

        "backdrop-blurry": {
          "0%": {
            backdropFilter: "blur(0px)",
          },
          "100%": {
            backdropFilter: "blur(4px)",
          },
        },

        "bg-gradient": {
          "0%": {
            backgroundPosition: "10% 0%",
          },
          "50%": {
            backgroundPosition: "91% 100%",
          },
          "100%": {
            backgroundPosition: "10% 0%",
          },
        }
      },
      animation: {
        "fade-out-left": "fade-out-left 1s ease-out",
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        text: "text 5s ease infinite",
        shake: "shake 1s ease 1",
        "fade-down": "fade-down 0.5s ease-in-out",
        "fade-up": "fade-up 0.5s ease-in-out",
        "hide-left": "show-left 0.5s ease-in-out forwards",
        "show-right": "show-right 0.5s ease-in-out forwards",
        "dissapear-up": "dissapear-up 0.5s ease-in-out forwards",
        "backdrop-blurry": "backdrop-blurry 0.5s ease-in-out forwards",
        ripple: "ripple .5s ease-in-out",
        "fade-in": "fade-in .5s ease-out",
        "fade-out": "fade-out .5s ease-out",
        "bg-gradient": "bg-gradient 5s ease-in-out infinite",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}

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
        clock: "url(\"data:image/svg+xml,%3Csvg height='200px' width='200px' version='1.1' id='Layer_1' xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink' viewBox='0 0 512.001 512.001' xml:space='preserve' fill='%23000000'%3E%3Cg id='SVGRepo_bgCarrier' stroke-width='0'%3E%3C/g%3E%3Cg id='SVGRepo_tracerCarrier' stroke-linecap='round' stroke-linejoin='round'%3E%3C/g%3E%3Cg id='SVGRepo_iconCarrier'%3E%3Ccircle style='fill:%23CFF09E;' cx='256.008' cy='280.395' r='150.734'%3E%3C/circle%3E%3Cg%3E%3Cpath style='fill:%23507C5C;' d='M217.384,227.031c16.934,0,34.015,10.657,34.015,30.22c0,31.68-45.111,42.045-45.111,55.33v1.314 h38.25c3.649,0,6.861,4.526,6.861,9.781s-3.211,10.073-6.861,10.073h-51.973c-4.087,0-9.927-2.773-9.927-7.008v-14.161 c0-22.92,45.987-36.06,45.987-54.6c0-4.672-2.919-10.365-11.095-10.365c-5.838,0-10.949,2.919-10.949,10.949 c0,4.235-4.526,8.322-11.972,8.322c-5.84,0-10.219-2.629-10.219-11.826C184.391,237.249,200.742,227.031,217.384,227.031z'%3E%3C/path%3E%3Cpath style='fill:%23507C5C;' d='M293.302,311.266H259.14c-4.233,0-7.591-2.773-7.591-7.883c0-1.168,0.292-2.775,1.168-4.379 l33.723-66.133c2.189-4.233,5.84-5.84,9.489-5.84c3.941,0,11.388,3.357,11.388,8.613c0,0.876-0.292,1.752-0.73,2.773 l-25.839,51.827h12.554v-10.219c0-4.818,5.694-6.861,11.388-6.861s11.388,2.044,11.388,6.861v10.219h6.278 c4.672,0,7.008,5.256,7.008,10.511c0,5.254-3.505,10.51-7.008,10.51h-6.278v15.475c0,4.673-5.694,7.008-11.388,7.008 s-11.388-2.335-11.388-7.008v-15.474H293.302z'%3E%3C/path%3E%3Cpath style='fill:%23507C5C;' d='M473.008,265.786c-8.065,0-14.603,6.538-14.603,14.603c0,111.606-90.798,202.406-202.406,202.406 S53.595,391.996,53.595,280.389S144.393,77.985,256.001,77.985c44.436,0,87.346,14.551,122.436,41.233l-26.546,26.546 c-27.063-19.332-60.171-30.719-95.89-30.719c-91.17,0-165.344,74.172-165.344,165.344s74.172,165.344,165.344,165.344 s165.344-74.172,165.344-165.344c0-37.329-12.44-71.804-33.386-99.509l80.046,21.448c1.25,0.334,2.519,0.498,3.779,0.498 c0.055,0,0.111,0,0.166,0c8.001-0.073,14.466-6.583,14.466-14.603c0-1.647-0.273-3.232-0.775-4.708L455.946,72.689 c-1.351-5.04-5.286-8.975-10.326-10.326c-5.042-1.351-10.418,0.091-14.107,3.779l-32.26,32.26 c-36.911-29.081-81.727-46.203-128.649-49.154V29.206h17.717c8.065,0,14.603-6.538,14.603-14.603S296.386,0,288.32,0h-64.639 c-8.065,0-14.603,6.538-14.603,14.603s6.538,14.603,14.603,14.603h17.717v20.046C120.466,56.815,24.389,157.584,24.389,280.389 c0,127.71,103.9,231.612,231.612,231.612s231.612-103.9,231.612-231.612C487.611,272.324,481.073,265.786,473.008,265.786z M256.001,416.527c-75.066,0-136.138-61.072-136.138-136.138s61.07-136.138,136.138-136.138s136.138,61.07,136.138,136.138 S331.067,416.527,256.001,416.527z M434.28,104.68l16.852,62.891l-62.891-16.852L434.28,104.68z'%3E%3C/path%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")",
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

        "show-left": {
          to: { transform: "translateX(0)" },
          from: { transform: "translateX(-100%)" },
        },

        "show-right": {
          to: { transform: "translateX(-100%)" },
          from: { transform: "translateX(0)" },
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
        "show-left": "show-left 0.5s ease-in-out forwards",
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

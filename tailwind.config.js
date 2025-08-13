/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: ["./pages/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./app/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    fontSize: {
      // HNWI optimized typography system
      xs: ["0.75rem", { lineHeight: "1rem" }],        // 12px
      sm: ["0.875rem", { lineHeight: "1.25rem" }],    // 14px
      base: ["1rem", { lineHeight: "1.5rem" }],       // 16px
      lg: ["1.125rem", { lineHeight: "1.75rem" }],    // 18px
      xl: ["1.25rem", { lineHeight: "1.75rem" }],     // 20px
      "2xl": ["1.5rem", { lineHeight: "2rem" }],      // 24px
      "3xl": ["1.875rem", { lineHeight: "2.25rem" }], // 30px
      "4xl": ["2.25rem", { lineHeight: "2.5rem" }],   // 36px
      "5xl": ["3rem", { lineHeight: "1" }],           // 48px
      "6xl": ["3.75rem", { lineHeight: "1" }],        // 60px
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        
        // Primary - Premium Platinum/Carbon Steel for Light Mode, Dark Graphite with Gold for Dark Mode
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
          50: "hsl(210, 20%, 98%)",   /* Very light platinum */
          100: "hsl(210, 20%, 95%)",  /* Light platinum */
          200: "hsl(210, 20%, 88%)",  /* Lighter steel */
          300: "hsl(210, 20%, 75%)",  /* Light medium steel */
          400: "hsl(210, 20%, 55%)",  /* Medium steel */
          500: "hsl(210, 20%, 45%)",  /* Medium dark steel */
          600: "hsl(210, 20%, 35%)",  /* Dark steel */
          700: "hsl(210, 20%, 25%)",  /* Darker steel */
          800: "hsl(210, 20%, 21%)",  /* Brand primary - carbon steel */
          900: "hsl(210, 20%, 15%)",  /* Very dark graphite */
          950: "hsl(210, 20%, 8%)",   /* Nearly black graphite */
        },
        
        // Secondary - Warm Gold (#C39A4C)
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
          50: "hsl(43, 50%, 98%)",    /* Very light gold */
          100: "hsl(43, 50%, 95%)",   /* Light gold */
          200: "hsl(43, 50%, 88%)",   /* Lighter gold */
          300: "hsl(43, 50%, 80%)",   /* Light medium gold */
          400: "hsl(43, 50%, 70%)",   /* Medium gold */
          500: "hsl(43, 50%, 60%)",   /* Medium dark gold */
          600: "hsl(43, 50%, 55%)",   /* Dark gold */
          700: "hsl(43, 50%, 52%)",   /* Brand secondary */
          800: "hsl(43, 50%, 45%)",   /* Darker gold */
          900: "hsl(43, 50%, 35%)",   /* Very dark gold */
          950: "hsl(43, 50%, 25%)",   /* Nearly black gold */
        },
        
        // Neutral grays for UI elements
        neutral: {
          50: "hsl(0, 0%, 98%)",      /* Near white */
          100: "hsl(0, 0%, 95%)",     /* Very light gray */
          200: "hsl(0, 0%, 90%)",     /* Light gray */
          300: "hsl(0, 0%, 83%)",     /* Medium light gray */
          400: "hsl(0, 0%, 64%)",     /* Medium gray */
          500: "hsl(0, 0%, 45%)",     /* Medium dark gray */
          600: "hsl(0, 0%, 32%)",     /* Dark gray */
          700: "hsl(0, 0%, 25%)",     /* Darker gray */
          800: "hsl(0, 0%, 15%)",     /* Very dark gray */
          900: "hsl(0, 0%, 8%)",      /* Near black */
          950: "hsl(0, 0%, 4%)",      /* Nearly black */
        },
        
        // Semantic colors
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
          50: "hsl(0, 72%, 95%)",
          500: "hsl(0, 72%, 51%)",
          600: "hsl(0, 72%, 45%)",
          900: "hsl(0, 72%, 25%)",
        },
        
        success: {
          50: "hsl(165, 72%, 95%)",
          500: "hsl(165, 72%, 51%)",
          600: "hsl(165, 72%, 45%)",
          900: "hsl(165, 72%, 25%)",
        },
        
        warning: {
          50: "hsl(43, 72%, 95%)",
          500: "hsl(43, 72%, 51%)",
          600: "hsl(43, 72%, 45%)",
          900: "hsl(43, 72%, 25%)",
        },
        
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        
        // Premium colors for Elite Pulse and high-end components
        premium: {
          // Light mode: Platinum/Carbon Steel
          light: {
            50: "hsl(210, 20%, 98%)",   /* Platinum white */
            100: "hsl(210, 20%, 95%)",  /* Light platinum */
            200: "hsl(210, 20%, 88%)",  /* Platinum silver */
            300: "hsl(210, 20%, 75%)",  /* Carbon steel light */
            400: "hsl(210, 20%, 55%)",  /* Carbon steel medium */
            500: "hsl(210, 20%, 45%)",  /* Carbon steel */
            600: "hsl(210, 20%, 35%)",  /* Dark carbon */
            700: "hsl(210, 20%, 25%)",  /* Charcoal */
            800: "hsl(210, 20%, 21%)",  /* Deep carbon */
            900: "hsl(210, 20%, 15%)",  /* Graphite */
          },
          // Dark mode: Dark Graphite with Gold accents
          dark: {
            50: "hsl(43, 50%, 98%)",    /* Light gold hint */
            100: "hsl(43, 50%, 95%)",   /* Soft gold */
            200: "hsl(210, 15%, 88%)",  /* Light graphite with gold hint */
            300: "hsl(43, 30%, 75%)",   /* Muted gold */
            400: "hsl(43, 40%, 55%)",   /* Medium gold */
            500: "hsl(43, 50%, 52%)",   /* Rich gold */
            600: "hsl(210, 15%, 35%)",  /* Dark graphite */
            700: "hsl(210, 15%, 25%)",  /* Darker graphite */
            800: "hsl(210, 15%, 18%)",  /* Deep graphite */
            900: "hsl(210, 15%, 12%)",  /* Very dark graphite */
            950: "hsl(210, 15%, 8%)",   /* Nearly black graphite */
          }
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
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      fontFamily: {
        // All typography uses Trojan Pro for consistency
        sans: ["Trojan Pro", "system-ui", "sans-serif"],
        serif: ["Trojan Pro", "system-ui", "sans-serif"],
        mono: ["Trojan Pro", "ui-monospace", "monospace"],
        heading: ["Trojan Pro", "system-ui", "sans-serif"],
        body: ["Trojan Pro", "system-ui", "sans-serif"],
        button: ["Trojan Pro", "system-ui", "sans-serif"],
        display: ["Trojan Pro", "system-ui", "sans-serif"],
      },
      fontWeight: {
        thin: "100",
        extralight: "200", 
        light: "300",
        normal: "400",
        medium: "500",
        semibold: "600",
        bold: "700",
        extrabold: "800",
        black: "900",
        // Semantic weights
        regular: "400",
        strong: "600",
        heavy: "700",
      },
      letterSpacing: {
        tighter: "-0.02em",
        tight: "-0.01em",
        normal: "0em",
        wide: "0.01em",
        wider: "0.02em",
        widest: "0.04em",
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
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}


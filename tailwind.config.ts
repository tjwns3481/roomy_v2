import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // ============================
        // Roomy Design System V2
        // 감성 중심 디자인 - Anti-AI-Slop
        // ============================

        // Base Colors (뉴트럴 중심)
        ink: "#1A1A1A",
        charcoal: "#3D3D3D",
        stone: "#6B6B6B",
        mist: "#A3A3A3",
        cloud: "#E8E8E8",
        snow: "#F7F7F7",

        // Accent Colors (포인트)
        coral: {
          DEFAULT: "#FF6B5B",
          light: "#FFF0EE",
          dark: "#E55A4A",
        },
        mint: {
          DEFAULT: "#00C9A7",
          light: "#E6FAF6",
          dark: "#00A88C",
        },
        amber: {
          DEFAULT: "#FFB800",
          light: "#FFFAE6",
          dark: "#E5A500",
        },

        // Legacy support (이전 버전 호환)
        background: "#FFFFFF",
        foreground: "#1A1A1A",
        primary: {
          DEFAULT: "#FF6B5B", // coral
          light: "#FFF0EE",
          foreground: "#FFFFFF",
        },
        secondary: {
          DEFAULT: "#00C9A7", // mint
          foreground: "#FFFFFF",
        },
        surface: "#F7F7F7", // snow
        border: "#E8E8E8", // cloud

        text: {
          primary: "#1A1A1A",
          secondary: "#6B6B6B",
        },

        success: "#00C9A7",
        warning: "#FFB800",
        error: "#FF6B5B",

        // shadcn/ui 호환
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
      },
      borderRadius: {
        lg: "0.5rem",
        xl: "0.75rem",
        "2xl": "1rem",
        "3xl": "1.5rem",
      },
      fontFamily: {
        sans: ["var(--font-pretendard)", "system-ui", "sans-serif"],
        display: ["var(--font-space-grotesk)", "var(--font-pretendard)", "system-ui", "sans-serif"],
      },
      fontSize: {
        // V2 Typography Scale
        display: ["4.5rem", { lineHeight: "1.0", fontWeight: "700", letterSpacing: "-0.03em" }],
        h1: ["3rem", { lineHeight: "1.1", fontWeight: "700", letterSpacing: "-0.02em" }],
        h2: ["2.25rem", { lineHeight: "1.2", fontWeight: "600", letterSpacing: "-0.01em" }],
        h3: ["1.5rem", { lineHeight: "1.3", fontWeight: "600", letterSpacing: "0" }],
        h4: ["1.25rem", { lineHeight: "1.5", fontWeight: "600" }],
        "body-lg": ["1.125rem", { lineHeight: "1.7", fontWeight: "400", letterSpacing: "0.01em" }],
        body: ["1rem", { lineHeight: "1.6", fontWeight: "400", letterSpacing: "0.01em" }],
        caption: ["0.875rem", { lineHeight: "1.5", fontWeight: "500", letterSpacing: "0.02em" }],
        small: ["0.75rem", { lineHeight: "1.5", fontWeight: "500", letterSpacing: "0.03em" }],
      },
      boxShadow: {
        sm: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
        DEFAULT: "0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1)",
        md: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)",
        lg: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1)",
        xl: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)",
        // V2 Shadows
        soft: "0 24px 64px rgba(0, 0, 0, 0.08)",
        "soft-lg": "0 32px 80px rgba(0, 0, 0, 0.12)",
        coral: "0 8px 32px rgba(255, 107, 91, 0.3)",
        "coral-lg": "0 12px 40px rgba(255, 107, 91, 0.4)",
      },
      animation: {
        "fade-up": "fadeUp 0.8s ease-out forwards",
        "fade-in": "fadeIn 0.6s ease-out forwards",
        "slide-in": "slideIn 0.6s ease-out forwards",
        blob: "blob 7s infinite",
        float: "float 6s ease-in-out infinite",
      },
      keyframes: {
        fadeUp: {
          "0%": { opacity: "0", transform: "translateY(40px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideIn: {
          "0%": { opacity: "0", transform: "translateX(-20px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
        blob: {
          "0%, 100%": { transform: "translate(0px, 0px) scale(1)" },
          "33%": { transform: "translate(30px, -50px) scale(1.1)" },
          "66%": { transform: "translate(-20px, 20px) scale(0.9)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-20px)" },
        },
      },
      spacing: {
        "4xs": "4px",
        "3xs": "8px",
        "2xs": "12px",
      },
    },
  },
  plugins: [require("@tailwindcss/typography")],
};

export default config;

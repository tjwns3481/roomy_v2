// @TASK P8-S1-T1 - AirBnB 스타일 디자인 시스템
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
        // AirBnB Design System
        // 따뜻하고 환영하는 디자인
        // ============================

        // Primary Colors (AirBnB Rausch)
        primary: {
          DEFAULT: "#FF385C",
          light: "#FFE4E8",
          dark: "#E31C5F",
          foreground: "#FFFFFF",
        },

        // Secondary Colors
        secondary: {
          DEFAULT: "#00A699", // Teal
          foreground: "#FFFFFF",
        },

        accent: {
          DEFAULT: "#FC642D", // Orange
          foreground: "#FFFFFF",
        },

        // Neutral Colors
        background: "#FFFFFF",
        foreground: "#222222",
        surface: "#F7F7F7",
        border: "#DDDDDD",

        "text-primary": "#222222",
        "text-secondary": "#717171",
        "text-tertiary": "#B0B0B0",

        // Semantic Colors
        success: "#00A699",
        warning: "#FFB400",
        error: "#C13515",
        info: "#008489",

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
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
      },

      // AirBnB 부드러운 곡선
      borderRadius: {
        sm: "4px",
        DEFAULT: "8px",
        lg: "8px",
        xl: "12px",
        "2xl": "16px",
        "3xl": "24px",
        full: "9999px",
      },

      // Pretendard 폰트
      fontFamily: {
        sans: ["Pretendard", "system-ui", "-apple-system", "sans-serif"],
      },

      // AirBnB 타이포그래피 스케일
      fontSize: {
        display: ["3rem", { lineHeight: "1.1", fontWeight: "700" }], // 48px
        h1: ["2rem", { lineHeight: "1.2", fontWeight: "700" }], // 32px
        h2: ["1.5rem", { lineHeight: "1.3", fontWeight: "600" }], // 24px
        h3: ["1.25rem", { lineHeight: "1.4", fontWeight: "600" }], // 20px
        h4: ["1.125rem", { lineHeight: "1.5", fontWeight: "500" }], // 18px
        "body-lg": ["1.125rem", { lineHeight: "1.6", fontWeight: "400" }], // 18px
        body: ["1rem", { lineHeight: "1.6", fontWeight: "400" }], // 16px
        "body-sm": ["0.875rem", { lineHeight: "1.5", fontWeight: "400" }], // 14px
        caption: ["0.75rem", { lineHeight: "1.5", fontWeight: "400" }], // 12px
      },

      // AirBnB 부드러운 그림자
      boxShadow: {
        "airbnb-sm": "0 1px 2px rgba(0,0,0,0.08)",
        "airbnb-md": "0 2px 8px rgba(0,0,0,0.12)",
        "airbnb-lg": "0 4px 16px rgba(0,0,0,0.12)",
        "airbnb-xl": "0 8px 28px rgba(0,0,0,0.15)",
        "airbnb-2xl": "0 16px 40px rgba(0,0,0,0.18)",
        // Keep standard shadows for compatibility
        sm: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
        DEFAULT: "0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1)",
        md: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)",
        lg: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1)",
        xl: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)",
      },

      // 부드러운 애니메이션
      animation: {
        "fade-up": "fadeUp 0.8s ease-out forwards",
        "fade-in": "fadeIn 0.6s ease-out forwards",
        "slide-in": "slideIn 0.6s ease-out forwards",
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
      },

      // 8px 기반 간격
      spacing: {
        "2xs": "4px",
        xs: "8px",
        sm: "12px",
        md: "16px",
        lg: "24px",
        xl: "32px",
        "2xl": "48px",
        "3xl": "64px",
        "4xl": "96px",
      },
    },
  },
  plugins: [require("@tailwindcss/typography")],
};

export default config;

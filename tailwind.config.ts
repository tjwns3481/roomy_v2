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
        // Roomy Clean Modern Design System
        background: "#FFFFFF",
        foreground: "#111827", // Gray 900

        primary: {
          DEFAULT: "#2563EB", // Blue 600
          light: "#DBEAFE",   // Blue 100
          foreground: "#FFFFFF",
        },
        secondary: {
          DEFAULT: "#F97316", // Orange 500
          foreground: "#FFFFFF",
        },
        surface: "#F9FAFB",   // Gray 50
        border: "#E5E7EB",     // Gray 200

        text: {
          primary: "#111827",   // Gray 900
          secondary: "#6B7280", // Gray 500
        },

        success: "#10B981",   // Green 500
        warning: "#F59E0B",   // Amber 500
        error: "#EF4444",     // Red 500

        // shadcn/ui 호환성을 위한 HSL 변수 유지
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
        lg: "0.5rem",   // 8px - 버튼, 카드
        xl: "0.75rem",  // 12px - 모달
        "2xl": "1rem",  // 16px - 큰 카드
      },
      fontFamily: {
        sans: ["var(--font-pretendard)", "system-ui", "sans-serif"],
      },
      fontSize: {
        h1: ["2.25rem", { lineHeight: "1.2", fontWeight: "700" }],  // 36px Bold
        h2: ["1.875rem", { lineHeight: "1.3", fontWeight: "600" }], // 30px SemiBold
        h3: ["1.5rem", { lineHeight: "1.4", fontWeight: "600" }],   // 24px SemiBold
        h4: ["1.25rem", { lineHeight: "1.5", fontWeight: "600" }],  // 20px SemiBold
        body: ["1rem", { lineHeight: "1.6", fontWeight: "400" }],   // 16px Regular
        caption: ["0.875rem", { lineHeight: "1.5", fontWeight: "400" }], // 14px Regular
        small: ["0.75rem", { lineHeight: "1.5", fontWeight: "400" }],    // 12px Regular
      },
      boxShadow: {
        sm: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
        DEFAULT: "0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1)",
        md: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)",
        lg: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1)",
        xl: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)",
      },
      animation: {
        'blob': 'blob 7s infinite',
      },
      keyframes: {
        blob: {
          '0%, 100%': {
            transform: 'translate(0px, 0px) scale(1)',
          },
          '33%': {
            transform: 'translate(30px, -50px) scale(1.1)',
          },
          '66%': {
            transform: 'translate(-20px, 20px) scale(0.9)',
          },
        },
      },
    },
  },
  plugins: [require("@tailwindcss/typography")],
};

export default config;

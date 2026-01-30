import type { Config } from "tailwindcss";
import typography from "@tailwindcss/typography";

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
        // shadcn/ui colors (preserved)
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
          light: "#FFE4E8", // coral-light와 동일
          dark: "#E31C5F", // coral-dark와 동일
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
        // Roomy Design System - AirBnB Style
        coral: {
          DEFAULT: "#FF385C",
          light: "#FFE4E8",
          dark: "#E31C5F",
        },
        mint: {
          DEFAULT: "#00A699",
          light: "#E0F7F5",
        },
        ink: "#222222",
        charcoal: "#484848",
        mist: "#767676",
        cloud: "#DDDDDD",
        snow: "#F7F7F7",
        stone: "#717171",
        amber: {
          DEFAULT: "#FFB400",
          light: "#FFF8E6",
        },
        surface: "#FAFAFA",
        "text-primary": "#222222",
        "text-secondary": "#484848",
        "text-tertiary": "#9CA3AF",
        success: "#10B981",
        error: "#EF4444",
        warning: "#F59E0B",
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
        airbnb: "12px",
        "airbnb-lg": "16px",
        "airbnb-xl": "24px",
      },
      boxShadow: {
        soft: "0 2px 4px rgba(0,0,0,0.06)",
        "soft-md": "0 4px 12px rgba(0,0,0,0.08)",
        "soft-lg": "0 8px 24px rgba(0,0,0,0.12)",
        "airbnb-sm": "0 1px 2px rgba(0,0,0,0.08), 0 4px 12px rgba(0,0,0,0.05)",
        airbnb: "0 6px 20px rgba(0,0,0,0.2)",
        "airbnb-md": "0 4px 16px rgba(0,0,0,0.12)",
        "airbnb-lg": "0 8px 28px rgba(0,0,0,0.16)",
        coral: "0 4px 14px rgba(255,56,92,0.25)",
        "coral-lg": "0 8px 25px rgba(255,56,92,0.35)",
      },
      borderWidth: {
        "3": "3px",
      },
    },
  },
  plugins: [typography],
};

export default config;

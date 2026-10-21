import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{ts,tsx}",
    "./src/components/**/*.{ts,tsx}",
    "./src/app/**/*.{ts,tsx}",
    "./src/lib/**/*.{ts,tsx}",
  ],
  theme: {
    container: {
      center: true,
      padding: "1.25rem",
      screens: { "2xl": "1280px" },
    },
    extend: {
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "-apple-system", "sans-serif"],
        mono: ["var(--font-mono)", "JetBrains Mono", "monospace"],
      },
      colors: {
        "bg-primary": "var(--bg-primary)",
        "bg-elevated": "var(--bg-elevated)",
        "bg-elevated-2": "var(--bg-elevated-2)",
        "border-subtle": "var(--border-subtle)",
        "border-strong": "var(--border-strong)",
        "text-primary": "var(--text-primary)",
        "text-secondary": "var(--text-secondary)",
        "text-tertiary": "var(--text-tertiary)",
        "accent-primary": "var(--accent-primary)",
        "accent-dim": "var(--accent-dim)",
        border: "var(--border)",
        input: "var(--input)",
        ring: "var(--ring)",
        background: "var(--bg-primary)",
        foreground: "var(--text-primary)",
        primary: {
          DEFAULT: "var(--accent-primary)",
          foreground: "#000000",
        },
        secondary: {
          DEFAULT: "var(--bg-elevated-2)",
          foreground: "var(--text-primary)",
        },
        destructive: {
          DEFAULT: "var(--danger)",
          foreground: "#ffffff",
        },
        muted: {
          DEFAULT: "var(--bg-elevated-2)",
          foreground: "var(--text-secondary)",
        },
        accent: {
          DEFAULT: "var(--bg-elevated-2)",
          foreground: "var(--text-primary)",
        },
        popover: {
          DEFAULT: "var(--bg-elevated)",
          foreground: "var(--text-primary)",
        },
        card: {
          DEFAULT: "var(--bg-elevated)",
          foreground: "var(--text-primary)",
          elevated: "var(--bg-elevated-2)",
        },
        loss: {
          DEFAULT: "var(--danger)",
          foreground: "#ffffff",
        },
        profit: {
          DEFAULT: "var(--accent-primary)",
          foreground: "#000000",
        },
      },
      borderRadius: {
        lg: "0.5rem", // 8px
        md: "calc(0.5rem - 2px)",
        sm: "calc(0.5rem - 4px)",
        xl: "0.75rem", // 12px
        "2xl": "1rem", // 16px
      },
      boxShadow: {
        glow: "0 0 20px -4px rgba(178, 255, 5, 0.35)",
        card: "0 1px 3px 0 rgba(0, 0, 0, 0.4)",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;

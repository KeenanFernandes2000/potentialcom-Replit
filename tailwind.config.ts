import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: ["./client/index.html", "./client/src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      colors: {
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        "tool-card": {
          DEFAULT: "hsl(var(--tool-card))",
          foreground: "hsl(var(--tool-card-foreground))",
          border: "hsl(var(--tool-card-border))",
          muted: "hsl(var(--tool-card-muted))",
          "muted-foreground": "hsl(var(--tool-card-muted-fg))",
          accent: "hsl(var(--tool-card-accent))",
          "accent-foreground": "hsl(var(--tool-card-accent-fg))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
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
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        chart: {
          "1": "hsl(var(--chart-1))",
          "2": "hsl(var(--chart-2))",
          "3": "hsl(var(--chart-3))",
          "4": "hsl(var(--chart-4))",
          "5": "hsl(var(--chart-5))",
        },
        sidebar: {
          DEFAULT: "hsl(var(--sidebar-background))",
          foreground: "hsl(var(--sidebar-foreground))",
          primary: "hsl(var(--sidebar-primary))",
          "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
          accent: "hsl(var(--sidebar-accent))",
          "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
          border: "hsl(var(--sidebar-border))",
          ring: "hsl(var(--sidebar-ring))",
        },
      },
      keyframes: {
        "accordion-down": {
          from: {
            height: "0",
          },
          to: {
            height: "var(--radix-accordion-content-height)",
          },
        },
        "accordion-up": {
          from: {
            height: "var(--radix-accordion-content-height)",
          },
          to: {
            height: "0",
          },
        },
        // Aurora gradient drift — used as a slow-moving background sheen
        // behind hero/header surfaces. Position-only animation so it
        // composites cheaply (no layout, no repaint of children).
        "aurora-drift": {
          "0%, 100%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
        },
        // Floating gradient orbs that sit behind the chat panel. Each
        // orb drifts on a different phase for an organic feel.
        "orb-float-a": {
          "0%, 100%": { transform: "translate(0, 0) scale(1)" },
          "50%": { transform: "translate(20px, -30px) scale(1.08)" },
        },
        "orb-float-b": {
          "0%, 100%": { transform: "translate(0, 0) scale(1)" },
          "50%": { transform: "translate(-30px, 20px) scale(0.92)" },
        },
        "orb-float-c": {
          "0%, 100%": { transform: "translate(0, 0) scale(1)" },
          "50%": { transform: "translate(15px, 25px) scale(1.05)" },
        },
        // Message slide-up + fade-in. Used on new chat bubbles so they
        // arrive with a quiet flourish rather than snapping into place.
        "bubble-in": {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        // Voice-orb breathing pulse — radius + opacity pulse used as the
        // base ambient state when Ruby is on a call. Faster/larger when
        // she's actively speaking (composed via separate utility classes).
        "voice-breathe": {
          "0%, 100%": { transform: "scale(1)", opacity: "0.55" },
          "50%": { transform: "scale(1.06)", opacity: "0.85" },
        },
        // Sound-bar bounce for the inline waveform under the voice hero.
        // Each bar uses a different animation-delay to stagger the wave.
        "sound-bar": {
          "0%, 100%": { transform: "scaleY(0.35)" },
          "50%": { transform: "scaleY(1)" },
        },
        // Subtle name shimmer for the hero greeting. Shifts the gradient
        // across the text so the wordmark feels alive without distracting.
        "text-shimmer": {
          "0%": { backgroundPosition: "0% 50%" },
          "100%": { backgroundPosition: "200% 50%" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "aurora-drift": "aurora-drift 18s ease-in-out infinite",
        "orb-float-a": "orb-float-a 14s ease-in-out infinite",
        "orb-float-b": "orb-float-b 17s ease-in-out infinite",
        "orb-float-c": "orb-float-c 21s ease-in-out infinite",
        "bubble-in": "bubble-in 0.32s cubic-bezier(0.16, 1, 0.3, 1) both",
        "voice-breathe": "voice-breathe 2.4s ease-in-out infinite",
        "voice-breathe-fast": "voice-breathe 1.1s ease-in-out infinite",
        "sound-bar": "sound-bar 0.85s ease-in-out infinite",
        "text-shimmer": "text-shimmer 6s linear infinite",
      },
    },
  },
  plugins: [require("tailwindcss-animate"), require("@tailwindcss/typography")],
} satisfies Config;

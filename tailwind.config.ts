import type { Config } from "tailwindcss";

/**
 * Brandfarver leveres som CSS-variabler (sat af BrandProvider ud fra brandkonfigurationen),
 * så samme komponentbibliotek kan rendere begge brands.
 */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    container: {
      center: true,
      padding: "1rem",
      screens: { "2xl": "1280px" },
    },
    extend: {
      colors: {
        brand: {
          primary: "rgb(var(--brand-primary) / <alpha-value>)",
          secondary: "rgb(var(--brand-secondary) / <alpha-value>)",
          accent: "rgb(var(--brand-accent) / <alpha-value>)",
          surface: "rgb(var(--brand-surface) / <alpha-value>)",
          "surface-warm": "rgb(var(--brand-surface-warm) / <alpha-value>)",
          ink: "rgb(var(--brand-ink) / <alpha-value>)",
        },
      },
      fontFamily: {
        display: ["var(--font-display)", "system-ui", "sans-serif"],
        body: ["var(--font-body)", "system-ui", "sans-serif"],
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "image-reveal": {
          "0%": { opacity: "0", transform: "scale(1.03)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        shimmer: {
          "100%": { transform: "translateX(100%)" },
        },
        "pop-in": {
          "0%": { transform: "scale(0.6)", opacity: "0" },
          "70%": { transform: "scale(1.15)" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.5s ease-out both",
        "image-reveal": "image-reveal 0.7s ease-out both",
        "pop-in": "pop-in 0.35s ease-out both",
      },
    },
  },
  plugins: [],
} satisfies Config;

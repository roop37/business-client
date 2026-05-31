import type { Config } from "tailwindcss";

// const colors = require("tailwindcss/colors");
const {
  default: flattenColorPalette,
} = require("tailwindcss/lib/util/flattenColorPalette");

const config: Config = {
  darkMode: ["class", "class"],
  lightMode: "class",
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Owner design system tokens — bridged to the marketing
        // palette (see business-client/styles/owner-tokens.css). The
        // `owner.blue.*` namespace is historical: the swatches are now
        // the Hoizr deep-forest-green primary. Keep names unchanged so
        // utility classes (`bg-owner-blue-500`, `text-owner-fg-3`, …)
        // resolve everywhere without JSX edits. When updating colours,
        // mirror the hex into styles/owner-tokens.css too so the
        // runtime CSS variables stay in sync with the build-time theme.
        owner: {
          blue: {
            500: "#0F8842", // primary — vibrant deep green
            600: "#0B6B33",
            400: "#16A150",
            200: "#A0D8B5",
            100: "#D4EFDD",
            "050": "#E9F7EF",
          },
          cyan: {
            500: "#0F8842",
            300: "#5BB37A",
          },
          // Secondary tier — graphite. Use beside the green primary
          // for headings and second-priority CTAs.
          secondary: {
            500: "#151412",
            600: "#0C0C0B",
            400: "#2B2925",
          },
          // Accent — neon chartreuse from the marketing site. Apply
          // sparingly: AI badges, "live" pulses, focus pops.
          accent: {
            acid: "#D6FF3F",
            acidDeep: "#B8E02F",
          },
          success: { text: "#0E8345", bg: "#DCFCE7", border: "#BBF7D0" },
          warning: { text: "#B45309", bg: "#FEF3C7" },
          danger: { text: "#C0382B", bg: "#FDE2DE" },
          info: { text: "#0F8842", bg: "#E9F7EF" },
          neutralPill: { bg: "#F1F1EF", text: "#6B6B6B" },
          bg: {
            DEFAULT: "#FFFFFF",
            sidebar: "#F4EFE3", // m-canvas warm cream
            subtle: "#EFE9DA",  // m-canvas-2
          },
          border: {
            DEFAULT: "#E5DFCF", // m-border
            strong: "#D2CBB7",  // m-border-strong
            soft: "#EFE9DA",
          },
          fg: {
            1: "#0A0A0A",
            2: "#2E2B24",  // m-ink-2 — warm graphite
            3: "#5A554A",  // m-ink-3
            4: "#9C968A",  // m-ink-4
            5: "#C2BCAD",  // m-ink-5
          },
        },
        // Legacy color names — REMAPPED to the Owner palette so any
        // existing component that still uses `bg-primary`, `text-error`,
        // `border-secondary`, etc. automatically picks up the new look
        // without needing a touch. The exact-named legacy hex tokens
        // (greenNeon/blueNew/blackBg/secondaryBg/inputColor/confirmation)
        // are kept as-is for components that reference them by literal
        // name — they're rare and we want to avoid surprise changes.
        greenNeon: "#f04b2f",
        blueNew: "#7d6f5b",
        blackBg: "#24150f",
        secondaryBg: "#f2e2cf",
        primary: "#0F8842",          // Owner blue-500 — vibrant deep green
        secondary: "#E5DFCF",        // Owner border — warm cream
        success: "#0E8345",          // Owner success-text
        warning: "#B45309",          // Owner warning-text
        error: "#C0382B",            // Owner danger-text
        inputColor: "#FFFFFF",       // Owner bg-input
        confirmation: "#0E8345",     // alias of success
        background: "#FFFFFF",       // Owner bg
        sidebarBg: "#F4EFE3",        // Owner bg-sidebar — warm cream
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
        foreground: "#0A0A0A",       // Owner fg-1
        input: "#FFFFFF",
        dropdown: "#FFFFFF",
        switch: "#E5E7EB",
        toggle: "#D2CBB7",           // Owner border-strong — warm cream
        modal: "#FFFFFF",
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
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
      fontFamily: {
        karla: "var(--font-karla)",
        figtree: "var(--font-figtree)",
        libre: "var(--font-libre)",
        tenor: "var(--font-tenor)",
        owner: ["var(--owner-font-sans)"],
        ownerMono: ["var(--owner-font-mono)"],
      },
      borderRadius: {
        "owner-sm": "8px",
        "owner-md": "12px",
        "owner-lg": "16px",
        "owner-xl": "22px",
      },
      boxShadow: {
        "owner-sm": "0 1px 2px rgba(15, 15, 15, 0.04)",
        "owner-md":
          "0 2px 8px rgba(15, 15, 15, 0.05), 0 1px 2px rgba(15, 15, 15, 0.04)",
        "owner-pill":
          "0 1px 2px rgba(15, 15, 15, 0.06), 0 0 0 1px rgba(15, 15, 15, 0.04)",
        "owner-dropdown": "0 8px 24px rgba(15, 15, 15, 0.08)",
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
    require("tailwindcss-animate"),
    addVariablesForColors,
    function ({ addComponents, theme }: any) {
      const colors = theme("colors");

      const buttons = {
        ".btn": {
          padding: ".8rem 1rem",
          borderRadius: ".375rem",
          fontWeight: "600",
          fontSize: "0.855rem",
          transition: "background-color color 0.3s ease, opacity 0.3s ease",
          "&.btn-primary": {
            backgroundColor: colors.primary,
            color: colors.white,
            "&:hover": {
              backgroundColor: "#16A150", /* Owner blue-400 — green lift */
            },
          },
          "&.btn-secondary": {
            backgroundColor: "#FFFFFF",
            color: "#0A0A0A", /* Owner fg-1 */
            border: `1px solid ${colors.secondary}`,
            "&:hover": {
              backgroundColor: "#EFE9DA", /* Owner bg-subtle — warm cream */
            },
          },
          "&.btn-warning": {
            backgroundColor: colors.warning,
            color: colors.white,
            "&:hover": {
              opacity: 0.8,
            },
          },
          "&.btn-confirmation": {
            backgroundColor: colors.confirmation,
            color: colors.white,
            "&:hover": {
              opacity: 0.8,
            },
          },
          "&.btn-outlined": {
            backgroundColor: "transparent",
            border: `1px solid ${colors.blackBg}`,
            color: colors.blackBg,
            "&:hover": {
              border: `1px solid ${colors.greenNeon}`,
              backgroundColor: colors.greenNeon,
              color: colors.white,
            },
          },
          "&.btn-outlined-warning": {
            backgroundColor: "transparent",
            border: `1px solid ${colors.warning}`,
            color: colors.warning,
            "&:hover": {
              backgroundColor: colors.warning,
              color: colors.white,
            },
          },
          "&.btn-outlined-secondary": {
            backgroundColor: "transparent",
            border: `1px solid ${colors.secondary}`,
            color: colors.secondary,
            "&:hover": {
              backgroundColor: colors.secondary,
              color: colors.white,
            },
          },
          "&.btn-outlined-confirmation": {
            backgroundColor: "transparent",
            border: `1px solid ${colors.confirmation}`,
            color: colors.confirmation,
            "&:hover": {
              backgroundColor: colors.confirmation,
              color: colors.white,
            },
          },
        },
      };

      const inputs = {
        ".input": {
          padding: ".4rem .5rem",
          borderRadius: ".375rem",
          border: "1px solid #D1D5DB",
          backgroundColor: colors.input,
          fontSize: ".875rem",
          width: "100%",
          outline: "none", // focus:outline-none
          display: "block", // block
          color: colors.black, // text-black
          "&::placeholder": {
            color: "#9CA3AF", // placeholder-gray-400
            opacity: "1", // ensured opacity is full
            transition: "color 0.3s ease", // added transition for focus
          },
          "&:focus::placeholder": {
            color: colors.black, // black on focus
          },
          "&:focus": {
            outline: "none", // removed default outline
            borderColor: colors.input, // ensure primary color border on focus
          },
          "&.input-primary": {
            backgroundColor: `${colors.input}`, // low opacity primary color
            borderColor: "#D1D5DB", // ensure primary color border by default
            "&:focus": {
              backgroundColor: `${colors.input}`, // slightly higher opacity on focus
              borderColor: "#D1D5DB",
            },
            "&:disabled": {
              backgroundColor: `${colors.input}`, // low opacity primary color
              opacity: "0.4",
              borderColor: "#D1D5DB", // ensure primary color border by default
            },
            "&::placeholder": {
              color: colors.black, // placeholder color
              opacity: "0.5", // ensured opacity is full
              transition: "color 0.3s ease", // added transition for focus
            },
          },
          "&.input-secondary": {
            backgroundColor: `${colors.secondary}1A`,
            "&:focus": {
              backgroundColor: `${colors.secondary}33`,
              borderColor: `${colors.secondary}`, // ensure secondary color border on focus
            },
          },
          "&.input-warning": {
            backgroundColor: `${colors.warning}1A`,
            "&:focus": {
              backgroundColor: `${colors.warning}33`,
              borderColor: `${colors.warning}`, // ensure warning color border on focus
            },
          },
        },
      };

      const switches = {
        ".switch": {
          minWidth: "2.1rem",
          width: "2.1rem",
          height: "1.1rem",
          borderRadius: "9999px",
          backgroundColor: theme("colors.gray.300"),
          position: "relative",
          transition: "background-color 0.3s ease",
          cursor: "pointer",
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          borderColor: theme("colors.gray.300"),
          borderWidth: "1px",
          borderStyle: "solid",
          "&.switch-primary": {
            backgroundColor: "#E5F2FF",
          },
          "&::after": {
            content: '""',
            position: "absolute",
            top: "0.125rem",
            left: "0.125rem",
            width: "0.75rem",
            height: "0.75rem",
            borderRadius: "9999px",
            backgroundColor: theme("colors.white"),
            transition: "transform 0.2s ease-in-out",
          },
          "&.checked::after": {
            transform: "translateX(1rem)",
            backgroundColor: colors.primary,
          },
        },
      };
      const checkboxes = {
        ".checkbox": {
          width: "1rem",
          height: "1rem",
          borderRadius: ".25rem",
          border: "1px solid",
          transition: "background-color 0.3s ease",
          "&.checkbox-primary": {
            borderColor: colors.primary,
            "&:checked": {
              backgroundColor: colors.primary,
            },
          },
          "&.checkbox-warning": {
            borderColor: colors.warning,
            "&:checked": {
              backgroundColor: colors.warning,
            },
          },
          "&.checkbox-confirmation": {
            borderColor: colors.confirmation,
            "&:checked": {
              backgroundColor: colors.confirmation,
            },
          },
        },
      };

      addComponents(buttons);
      addComponents(inputs);
      addComponents(switches);
      addComponents(checkboxes);
    },
  ],
};

function addVariablesForColors({ addBase, theme }: any) {
  let allColors = flattenColorPalette(theme("colors"));
  let newVars = Object.fromEntries(
    Object.entries(allColors).map(([key, val]) => [`--${key}`, val])
  );

  addBase({
    ":root": newVars,
  });
}

function getCustomColors() {
  return {
    "gray-2": "#F7F9FC",
    "gray-3": "#FAFAFA",
    whiten: "#F1F5F9",
    whiter: "#F5F7FD",
    boxdark: "#24303F",
    "boxdark-2": "#1A222C",
    strokedark: "#2E3A47",
    "form-strokedark": "#3d4d60",
    "form-input": "#1d2a39",
    "meta-1": "#DC3545",
    "meta-2": "#EFF2F7",
    "meta-3": "#10B981",
    "meta-4": "#313D4A",
    "meta-5": "#259AE6",
    "meta-6": "#FFBA00",
    "meta-7": "#FF6766",
    "meta-8": "#F0950C",
    "meta-9": "#E5E7EB",
    "meta-10": "#0FADCF",
  };
}

export default config;

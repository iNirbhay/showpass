/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        cinematic: {
          bg: '#0D0E14',
          surface: '#151922',
          'surface-card': '#1C2333',
          'surface-elevated': '#242D40',
          'surface-hover': '#2C374E',
          'surface-active': '#34415C',
          border: 'rgba(255, 255, 255, 0.12)',
          'border-strong': 'rgba(245, 158, 11, 0.35)',
          'border-active': 'rgba(245, 158, 11, 0.6)',
          text: '#F8FAFC',
          'text-secondary': '#94A3B8',
          'text-muted': '#64748B',
        },
        surface: {
          base: '#F8FAFC',
          card: '#FFFFFF',
          elevated: '#F1F5F9',
        },
        brand: {
          DEFAULT: '#F59E0B', // Amber 500
          hover: '#D97706',   // Amber 600
          light: '#FEF3C7',   // Amber 100
          amber: '#FBBF24',   // Amber 400
          cream: '#FFFBEB',
          subtle: 'rgba(245, 158, 11, 0.1)',
          border: 'rgba(245, 158, 11, 0.25)',
          // Backward-compatibility aliases
          teal: '#F59E0B',
          mint: '#FEF3C7',
          crimson: '#F59E0B',
          'crimson-hover': '#D97706',
        },
        tier: {
          vip: '#D97706',
          'vip-bg': 'rgba(217, 119, 6, 0.1)',
          'vip-border': 'rgba(217, 119, 6, 0.3)',
          premium: '#F59E0B',
          'premium-bg': 'rgba(245, 158, 11, 0.1)',
          'premium-border': 'rgba(245, 158, 11, 0.3)',
          standard: '#64748B',
          'standard-bg': 'rgba(100, 116, 139, 0.1)',
          'standard-border': 'rgba(100, 116, 139, 0.25)',
        },
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        display: ['Outfit', '"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },
      boxShadow: {
        cinematic: '0 12px 32px -8px rgba(0, 0, 0, 0.65)',
        'cinematic-lg': '0 20px 48px -12px rgba(0, 0, 0, 0.8)',
        'golden-sm': '0 2px 8px -2px rgba(250, 204, 21, 0.22)',
        'golden-md': '0 4px 14px -3px rgba(250, 204, 21, 0.28)',
        subtle: '0 4px 12px rgba(0, 0, 0, 0.25)',
      },
      letterSpacing: {
        tighter: '-0.035em',
        tight: '-0.02em',
        tracked: '0.08em',
        widest: '0.15em',
      },
      transitionTimingFunction: {
        spring: 'cubic-bezier(0.16, 1, 0.3, 1)',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(6px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        scalePop: {
          '0%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.08)' },
          '100%': { transform: 'scale(1.04)' },
        },
        gentlePulse: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.75' },
        },
      },
      animation: {
        fadeIn: 'fadeIn 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        scalePop: 'scalePop 0.2s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        gentlePulse: 'gentlePulse 2s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}

/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          navy: '#0F2C59',
          'navy-dark': '#0A1E3D',
          'navy-light': '#1E3A8A',
          orange: '#EA580C',
          'orange-hover': '#C2410C',
          'orange-light': '#FFF7ED',
          gold: '#D97706',
          'gold-light': '#FEF3C7',
          forest: '#153E35'
        },
        dark: {
          page: '#09111E',
          card: '#111C2E',
          surface: '#18263E',
          border: '#223554',
          text: '#F8FAFC',
          secondary: '#94A3B8',
          muted: '#64748B'
        },
        forest: {
          DEFAULT: '#153E35',
          hover: '#1D5145',
          light: '#EDF3F0',
          dark: '#0D2721',
          subtle: '#F2F7F4'
        },
        ivory: {
          DEFAULT: '#FAF8F5',
          card: '#FFFFFF',
          dark: '#EDEDE6'
        },
        ink: {
          main: '#0F2C59',
          secondary: '#475569',
          muted: '#94A3B8',
          light: '#E2E8F0'
        },
        border: {
          subtle: '#E2E8F0',
          strong: '#CBD5E1'
        },
        gold: {
          DEFAULT: '#D9A441',
          hover: '#C49033',
          light: '#FBF5EB'
        },
        status: {
          success: '#16A34A',
          'success-bg': '#F0FDF4',
          warning: '#D97706',
          'warning-bg': '#FFFBEB',
          error: '#DC2626',
          'error-bg': '#FEF2F2'
        }
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'Inter', '"Noto Sans Arabic"', 'system-ui', 'sans-serif'],
        display: ['"Plus Jakarta Sans"', 'Inter', 'sans-serif']
      },
      boxShadow: {
        'soft': '0 2px 10px -2px rgba(15, 44, 89, 0.05), 0 1px 3px -1px rgba(15, 44, 89, 0.03)',
        'card': '0 4px 20px -4px rgba(15, 44, 89, 0.08), 0 2px 6px -2px rgba(15, 44, 89, 0.04)',
        'elevated': '0 12px 36px -6px rgba(15, 44, 89, 0.15), 0 4px 12px -3px rgba(15, 44, 89, 0.08)'
      }
    },
  },
  plugins: [],
}

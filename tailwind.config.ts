import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Brand Colors
        brand: {
          orange: '#EA580C',      // Primary brand color (orange-600)
          'orange-dark': '#C2410C', // Darker orange (orange-700)
          'orange-light': '#FB923C', // Lighter orange (orange-400)
          teal: '#0891B2',        // Secondary brand color (cyan-600)
          'teal-dark': '#0E7490', // Darker teal (cyan-700)
          'teal-light': '#22D3EE', // Lighter teal (cyan-400)
        },
        // Legacy colors (keep for now, transition gradually)
        teal: {
          DEFAULT: '#2d5a6b',
          dark: '#1e3d4a',
          light: '#e8f4f8',
          medium: '#3a7a8c',
        },
        orange: {
          DEFAULT: '#EA580C',     // Updated to match brand
          dark: '#C2410C',
          light: '#FB923C',
        },
        // Link colors
        link: {
          DEFAULT: '#0056b3',
          hover: '#003d82',
        },
        // Neutrals
        gray: {
          100: '#f5f5f5',
          200: '#e8e8e8',
          300: '#d0d0d0',
          400: '#a0a0a0',
          600: '#666666',
          800: '#333333',
          900: '#1a1a1a',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
        heading: ['Inter', 'system-ui', 'sans-serif'],
      },
      spacing: {
        'xs': '0.25rem',
        'sm': '0.5rem',
        'md': '1rem',
        'lg': '1.5rem',
        'xl': '2rem',
        '2xl': '3rem',
        '3xl': '4rem',
      },
      maxWidth: {
        'content': '900px',
        'sidebar': '200px',
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
}

export default config

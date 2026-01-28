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
        // Primary Colors
        teal: {
          DEFAULT: '#2d5a6b',
          dark: '#1e3d4a',
          light: '#e8f4f8',
          medium: '#3a7a8c',
        },
        orange: {
          DEFAULT: '#c65d24',
          dark: '#a84d1d',
          light: '#d97a45',
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
        sans: ['Segoe UI', '-apple-system', 'BlinkMacSystemFont', 'Roboto', 'Helvetica Neue', 'sans-serif'],
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

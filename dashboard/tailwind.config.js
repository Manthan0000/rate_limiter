/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        canvas: '#000000',
        'surface-soft': '#0d0d0d',
        'surface-card': '#1a1a1a',
        'surface-elevated': '#262626',
        'carbon-gray': '#2b2b2b',
        hairline: '#3c3c3c',
        'hairline-strong': '#262626',
        'm-blue-light': '#0066b1',
        'm-blue-dark': '#1c69d4',
        'm-red': '#e22718',
        'electric-blue': '#0653b6',
        body: '#bbbbbb',
        'body-strong': '#e6e6e6',
        muted: '#7e7e7e',
        warning: '#f4b400',
        success: '#0fa336',
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      letterSpacing: {
        machined: '1.5px',
      },
      borderRadius: {
        none: '0px',
      },
    },
  },
  plugins: [],
}

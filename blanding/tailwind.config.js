/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        paper: '#F4EFE6',
        bone: '#E8E0D2',
        ink: '#141210',
        smoke: '#6B645B',
        blood: '#C1272D',
        bile: '#B8C43A',
        formaldehyde: '#2F6F6A',
      },
      fontFamily: {
        display: ['"DM Serif Display"', 'Georgia', 'serif'],
        body: ['"Inter"', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },
    },
  },
  plugins: [],
}

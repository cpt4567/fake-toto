/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        toto: {
          primary: '#0ea5e9',
          'primary-hover': '#38bdf8',
          dark: '#0f172a',
          darker: '#0c1222',
          accent: '#f59e0b',
          success: '#22c55e',
          'success-dim': 'rgba(34, 197, 94, 0.15)',
          danger: '#ef4444',
          'danger-dim': 'rgba(239, 68, 68, 0.15)',
        },
      },
      fontFamily: {
        sans: ['Pretendard', 'system-ui', '-apple-system', 'sans-serif'],
      },
      boxShadow: {
        'toto-card': '0 4px 24px -4px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(148, 163, 184, 0.05)',
        'toto-card-hover': '0 8px 32px -8px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(14, 165, 233, 0.2)',
        'toto-button': '0 2px 8px -2px rgba(14, 165, 233, 0.4)',
        'toto-success': '0 4px 20px -4px rgba(34, 197, 94, 0.4)',
      },
      transitionDuration: {
        200: '200ms',
        300: '300ms',
      },
    },
  },
  plugins: [],
}

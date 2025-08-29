/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./apps/frontend/src/**/*.{html,ts}",
    "./apps/frontend/src/**/*.component.{html,ts}",
    "./apps/frontend/src/**/*.page.{html,ts}"
  ],
  theme: {
    extend: {
      colors: {
        slate: {
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a'
        }
      }
    },
  },
  plugins: [],
  safelist: [
    'bg-slate-800',
    'bg-slate-700',
    'border-slate-600',
    'border-slate-700',
    'text-gray-300',
    'text-gray-400',
    'text-gray-500',
    'hover:bg-slate-700',
    'divide-slate-700'
  ]
};

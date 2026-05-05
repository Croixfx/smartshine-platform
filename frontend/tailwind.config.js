/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#1A5276',
          dark:    '#154360',
          light:   '#2471A3',
          muted:   '#D6EAF8',
        },
        secondary: {
          DEFAULT: '#2E86C1',
          dark:    '#2471A3',
          light:   '#AED6F1',
        },
        accent: {
          DEFAULT: '#F39C12',
          dark:    '#D68910',
          light:   '#FAD7A0',
          muted:   '#FEF9EE',
        },
        brand: {
          bg:             '#F8F9FA',
          surface:        '#FFFFFF',
          border:         '#E9ECEF',
          'text-primary': '#1a1a2e',
          'text-secondary':'#888888',
          'text-tertiary': '#AAAAAA',
        },
      },
      fontFamily: {
        display: ["'Playfair Display'", 'Georgia', 'serif'],
        body:    ["'DM Sans'", 'system-ui', '-apple-system', 'sans-serif'],
      },
      borderRadius: {
        input: '10px',
        btn:   '12px',
        card:  '16px',
      },
      boxShadow: {
        card:       '0 2px 12px rgba(0,0,0,0.04)',
        'card-hover':'0 4px 20px rgba(0,0,0,0.08)',
        modal:      '0 8px 40px rgba(0,0,0,0.12)',
        'cta-hover':'0 6px 20px rgba(243,156,18,0.30)',
      },
    },
  },
  plugins: [],
}

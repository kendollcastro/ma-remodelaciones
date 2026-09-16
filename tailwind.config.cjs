module.exports = {
  content: ['./index.html'],
  theme: {
    extend: {
      colors: {
        brandBlue: '#0736c2',
        brandOrange: '#ff741e',
        brandLight: '#fbf8ff',
        brandDark: '#111827',
      },
      fontFamily: {
        heading: ['Noto Serif', 'serif'],
        body: ['Inter', 'sans-serif'],
      },
      borderRadius: {
        DEFAULT: '0.75rem',
        lg: '1rem',
        xl: '1.25rem',
        '2xl': '1.5rem',
        full: '9999px',
      },
    },
  },
  plugins: [require('@tailwindcss/forms'), require('@tailwindcss/container-queries')],
};
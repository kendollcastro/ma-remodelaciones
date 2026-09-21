module.exports = {
  content: [
    './index.html',
    './en.html',
    './servicios/**/*.html',
    './zonas/**/*.html',
    './blog/**/*.html',
    './en/servicios/**/*.html',
    './en/zonas/**/*.html',
    './en/blog/**/*.html',
    './content/**/*.html',
  ],
  theme: {
    extend: {
      colors: {
        brandNavy: '#0a1d37',
        brandNavyLight: '#152e52',
        brandOrange: '#f25c05',
        brandOrangeHover: '#d94f00',
        brandMutedBg: '#fffaf5',
        brandCardBg: '#f8fafc',
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'sans-serif'],
      },
    },
  },
  plugins: [require('@tailwindcss/forms'), require('@tailwindcss/container-queries')],
};
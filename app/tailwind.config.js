const plugin = require('tailwindcss/plugin')

const generatePercentageWidth = () => {
  const width = {};
  for (let i = 0; i <= 100; i++) {
    width[`${i}%`] = `${i}%`;
  }
  return width;
}

//eslint-disable-next-line
module.exports = {
  content: ['./src/**/*.{ts,tsx,sass}'],
  darkMode: 'class',
  theme: {
    extend: {
      animation: {
        'spin-slow': 'spin 5s linear infinite',
      },
      colors: {
        'core-extralight': '#94FF40',
        'core-light': '#B6FF40',
        'core-semilight': '#FFEC40',
        'core-medium': '#E4FF40',
        'core-semiheavy': '#FFB340',
        'core-heavy': '#FF7A00',
        'core-extraheavy': '#FF3D00',
        'core': '#F3F3F3',
        'page-background': '#F6F8FA',
        'page-dark': "#141617",
        // 'header-dark': "#161819"
        'header-dark': "#161819",
        'loading-bar-dark': "#1B1E1F"
      },
      spacing: {
        ...generatePercentageWidth()
      }
    },
  },
  plugins: [
    plugin(function ({ addComponents, theme }) {
      addComponents({
        '.will-change-trans': { // `will-change-transform` is now included in Tailwind CSS 3.0 so using alternative class name for this example
          willChange: 'transform'
        },
        '.ease': {
          transition: 'ease'
        },
      })
    })
  ],
}

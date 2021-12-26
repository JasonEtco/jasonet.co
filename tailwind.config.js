module.exports = {
  content: [
    './posts/**/*.md',
    './pages/**/*.njk',
    './_includes/**/*.njk',
    './index.njk',
  ],
  theme: {
    extend: {
      colors: {
        orange: '#f26d21'
      }
    }
  },
  variants: {},
  plugins: [
    require('@tailwindcss/typography'),
  ]
}

import Typography from 'typography'
import Theme from 'typography-theme-github'

// Import typefaces
import 'inter-ui'

Theme.overrideThemeStyles = () => ({
  a: {
    color: '#f26d21'
  },
  'a.gatsby-resp-image-link': {
    boxShadow: 'none'
  },
  'a.anchor': {
    boxShadow: 'none'
  },
  'p code': {
    fontSize: '1rem'
  },
  'li code': {
    fontSize: '1rem'
  },
  p: {
    marginBottom: '1.5rem'
  },
  h2: {
    marginTop: '2.65rem'
  }
})

Theme.headerFontFamily.unshift('Inter UI')
const typography = new Typography(Theme)

// Hot reload typography in development.
if (process.env.NODE_ENV !== 'production') {
  typography.injectStyles()
}

export default typography
export const rhythm = typography.rhythm
export const scale = typography.scale
export const colors = {
  gray: [
    '#fafbfc',
    '#f6f8fa',
    '#e1e4e8',
    '#d1d5da',
    '#959da5',
    '#6a737d',
    '#586069',
    '#444d56',
    '#2f363d',
    '#24292e'
  ],
  blue: [
    '#f1f8ff',
    '#dbedff',
    '#c8e1ff',
    '#79b8ff',
    '#2188ff',
    '#0366d6',
    '#005cc5',
    '#044289',
    '#032f62',
    '#05264c'
  ]
}

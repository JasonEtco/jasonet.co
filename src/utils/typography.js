import Typography from 'typography'
import Theme from 'typography-theme-github'

Theme.overrideThemeStyles = () => ({
  a: {
    color: '#f87000',
  },
  'a.gatsby-resp-image-link': {
    boxShadow: 'none',
  },
  'a.anchor': {
    boxShadow: 'none',
  },
  'p code': {
    fontSize: '1rem',
  },
  'li code': {
    fontSize: '1rem'
  },
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

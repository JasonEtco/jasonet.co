import { shape, string } from 'prop-types'

const post = shape({
  fields: shape({
    slug: string.isRequired
  }).isRequired,
  frontmatter: shape({
    title: string.isRequired,
    date: string,
    spoiler: string
  })
})

const site = shape({
  siteMetadata: shape({
    title: string.isRequired,
    author: string.isRequired,
    siteUrl: string,
    social: shape({
      twitter: string.isRequired
    })
  }).isRequired
})

export default {
  post,
  site
}

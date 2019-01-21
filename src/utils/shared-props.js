import { shape, string } from 'prop-types'

const post = shape({
  fields: shape({
    slug: string.isRequired
  }).isRequired,
  frontmatter: shape({
    title: string.isRequired,
    date: string.isRequired,
    spoiler: string.isRequired
  })
})

const site = shape({
  siteMetadata: shape({
    title: string.isRequired,
    author: string.isRequired,
    description: string.isRequired,
    siteUrl: string.isRequired,
    social: shape({
      twitter: string.isRequired
    }).isRequired
  }).isRequired
})

export default {
  post,
  site
}

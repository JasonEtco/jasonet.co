import { shape, string, arrayOf } from 'prop-types'

const person = shape({
  handle: string.isRequired,
  avatar: string.isRequired,
  url: string.isRequired
})

const post = shape({
  fields: shape({
    slug: string.isRequired
  }).isRequired,
  frontmatter: shape({
    title: string.isRequired,
    date: string,
    spoiler: string,
    people: arrayOf(person)
  })
})

const site = shape({
  siteMetadata: shape({
    title: string.isRequired,
    author: string.isRequired,
    description: string,
    siteUrl: string.isRequired,
    social: shape({
      twitter: string.isRequired
    })
  }).isRequired
})

export default {
  post,
  site,
  person
}

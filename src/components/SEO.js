import React from 'react'
import Helmet from 'react-helmet'
import PropTypes from 'prop-types'
import { StaticQuery, graphql } from 'gatsby'

const query = graphql`
  query GetSiteMetadata {
    site {
      siteMetadata {
        title
        author
        description
        siteUrl
        social {
          twitter
        }
      }
    }
  }
`

function SEO({ meta, title, description, slug, image }) {
  return (
    <StaticQuery
      query={query}
      render={data => {
        const { siteMetadata } = data.site
        const metaDescription = description || siteMetadata.description
        const metaImage = image || `${siteMetadata.siteUrl}/card.png`
        const url = `${siteMetadata.siteUrl}${slug}`
        return (
          <Helmet
            htmlAttributes={{ lang: 'en' }}
            {...(title
              ? {
                  titleTemplate: `%s - ${siteMetadata.title}`,
                  title
                }
              : {
                  title: siteMetadata.title
                })}
            meta={[
              {
                name: 'description',
                content: metaDescription
              },
              {
                property: 'og:url',
                content: url
              },
              {
                property: 'og:title',
                content: title || siteMetadata.title
              },
              {
                name: 'og:description',
                content: metaDescription
              },
              {
                name: 'twitter:card',
                content: image ? 'summary_large_image' : 'summary'
              },
              {
                name: 'twitter:creator',
                content: siteMetadata.social.twitter
              },
              {
                name: 'twitter:title',
                content: title || siteMetadata.title
              },
              {
                name: 'twitter:description',
                content: metaDescription
              },
              {
                name: 'og:image',
                content: metaImage
              },
              {
                name: 'twitter:image',
                content: metaImage
              }
            ].concat(meta)}
          />
        )
      }}
    />
  )
}

SEO.defaultProps = {
  meta: [],
  title: '',
  slug: ''
}

SEO.propTypes = {
  description: PropTypes.string,
  meta: PropTypes.array,
  slug: PropTypes.string,
  title: PropTypes.string.isRequired,
  image: PropTypes.string
}

export default SEO

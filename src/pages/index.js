import React from 'react'
import { Link, graphql } from 'gatsby'

import Bio from '../components/Bio'
import SEO from '../components/SEO'
import ReposList from '../components/ReposList'
import { formatReadingTime } from '../utils/helpers'
import { rhythm, scale } from '../utils/typography'
import { shape, arrayOf } from 'prop-types'
import p from '../utils/shared-props'

export default function BlogIndex(props) {
  const posts = props.data.allMarkdownRemark.edges

  return (
    <main
      style={{
        marginLeft: 'auto',
        marginRight: 'auto',
        maxWidth: rhythm(24),
        padding: `${rhythm(1.5)} ${rhythm(1)}`
      }}
    >
      <SEO />

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          borderBottom: '1px solid hsla(0,0%,0%,0.07)',
          paddingBottom: rhythm(0.5)
        }}
        className="home__hero"
      >
        <h1
          style={{
            ...scale(1.8),
            fontWeight: 900,
            lineHeight: 0.9,
            border: 'none',
            margin: 0,
            padding: 0
          }}
        >
          Jason
          <br />
          Etcovitch
        </h1>

        <p style={{ alignSelf: 'flex-end', marginBottom: 0, marginLeft: 16 }}>
          🐙 Engineer at <a href="https://github.com/JasonEtco">GitHub</a>
          <br />
          🐦 Follow me on <a href="https://twitter.com/JasonEtco">Twitter</a>
        </p>
      </div>

      <div
        style={{
          paddingTop: rhythm(2),
          paddingBottom: rhythm(2),
          borderBottom: '1px solid hsla(0,0%,0%,0.07)'
        }}
      >
        <h5>Posts:</h5>
        {posts.map(({ node }) => {
          const title = node.frontmatter.title || node.fields.slug
          return (
            <div
              key={node.fields.slug}
              itemScope
              itemType="https://schema.org/BlogPosting"
            >
              <h3 itemProp="name" style={{ marginBottom: rhythm(1 / 4) }}>
                <Link style={{ boxShadow: 'none' }} to={node.fields.slug}>
                  {title}
                </Link>
              </h3>
              <small>
                <time itemProp="datePublished">{node.frontmatter.date}</time>
                {` • `}
                <time itemProp="timeRequired">
                  {formatReadingTime(node.timeToRead)}
                </time>
              </small>
              <p
                itemProp="about headline comment"
                dangerouslySetInnerHTML={{ __html: node.frontmatter.spoiler }}
              />
            </div>
          )
        })}
      </div>

      <div style={{ marginTop: rhythm(3) }}>
        <ReposList />
      </div>

      <div
        style={{
          padding: rhythm(1),
          marginTop: rhythm(2),
          boxShadow: '0 2px 15px 0 rgba(210,214,220,.5)',
          borderRadius: 5
        }}
      >
        <Bio marginBottom={0} />
      </div>
    </main>
  )
}

export const pageQuery = graphql`
  query {
    site {
      siteMetadata {
        title
        description
      }
    }
    allMarkdownRemark(sort: { fields: [frontmatter___date], order: DESC }) {
      edges {
        node {
          fields {
            slug
          }
          timeToRead
          frontmatter {
            date(formatString: "MMMM DD, YYYY")
            title
            spoiler
          }
        }
      }
    }
  }
`

BlogIndex.propTypes = {
  data: shape({
    allMarkdownRemark: arrayOf(p.post).isRequired
  })
}

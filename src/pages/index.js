import React from 'react'
import { Link, graphql } from 'gatsby'

import Bio from '../components/Bio'
import Seo from '../components/SEO'
import ReposList from '../components/ReposList'
import { formatReadingTime } from '../utils/helpers'
import { shape, arrayOf } from 'prop-types'
import p from '../utils/shared-props'

export default function BlogIndex(props) {
  const posts = props.data.allMarkdownRemark.edges

  return (
    <main className="mx-auto max-w-xl py-8 px-3">
      <Seo />

      <header className="md:flex items-end border-b border-gray-200 pb-3 mb-10">
        <h1
          className="border-0 mb-0 pb-0"
          style={{
            fontSize: '3.5rem',
            fontWeight: 900,
            lineHeight: 0.9
          }}
        >
          Jason
          <br />
          Etcovitch
        </h1>

        <div className="flex-end mt-6 mb-0 md:mt-0 md:ml-3">
          <p className="mb-1">
            🐙 Engineer at{' '}
            <a
              className="text-orange hover:underline"
              href="https://github.com/JasonEtco"
            >
              GitHub
            </a>
          </p>
          <p>
            🐦 Follow me on{' '}
            <a
              className="text-orange hover:underline"
              href="https://twitter.com/JasonEtco"
            >
              Twitter
            </a>
          </p>
        </div>
      </header>

      <div className="py-6 border-b border-gray-200">
        <h5 className="text-sm text-gray-700 font-semibold">Posts:</h5>
        {posts.map(({ node }) => {
          const title = node.frontmatter.title || node.fields.slug
          return (
            <div
              key={node.fields.slug}
              itemScope
              itemType="https://schema.org/BlogPosting"
              className="mt-8"
            >
              <h3
                itemProp="name"
                className="mb-1 text-orange text-2xl font-semibold"
              >
                <Link to={node.fields.slug}>{title}</Link>
              </h3>
              <small className="text-gray-700">
                <time itemProp="datePublished">{node.frontmatter.date}</time>
                <span> • </span>
                <time itemProp="timeRequired">
                  {formatReadingTime(node.timeToRead)}
                </time>
              </small>
              <p itemProp="about headline comment">
                {node.frontmatter.spoiler}
              </p>
            </div>
          )
        })}
      </div>

      <div className="mt-20">
        <ReposList />
      </div>

      <div className="p-8 mt-10 shadow-lg border border-gray-100 rounded-lg">
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

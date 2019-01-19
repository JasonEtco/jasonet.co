import React from 'react'
import { Link, graphql } from 'gatsby'
import get from 'lodash/get'

import Bio from '../components/Bio'
import Layout from '../components/Layout'
import SEO from '../components/SEO'
import { formatReadingTime } from '../utils/helpers'
import { rhythm, scale } from '../utils/typography'

const GITHUB_USERNAME = 'JasonEtco'
const GITHUB_REPO_NAME = 'jasonet.co'

class BlogPostTemplate extends React.Component {
  render() {
    const post = this.props.data.markdownRemark
    const siteTitle = get(this.props, 'data.site.siteMetadata.title')
    const { previous, next, slug } = this.props.pageContext

    const editUrl = `https://github.com/${GITHUB_USERNAME}/${GITHUB_REPO_NAME}/edit/master/src/pages/${slug}.md`
    const discussUrl = `https://mobile.twitter.com/search?q=${encodeURIComponent(`https://jasonet.co${slug}`)}`
    return (
      <Layout location={this.props.location} title={siteTitle}>
        <SEO
          title={post.frontmatter.title}
          description={post.frontmatter.spoiler}
          slug={post.fields.slug}
        />
        <h1 style={{ fontWeight: 900, ...scale(1.6) }}>{post.frontmatter.title}</h1>
        <p
          style={{
            ...scale(-1 / 5),
            fontFamily: 'Inter UI, sans-serif',
            display: 'block',
            marginBottom: rhythm(1),
            marginTop: rhythm(-3 / 5),
          }}
        >
          {post.frontmatter.date}
          {` • ${formatReadingTime(post.timeToRead)}`}
        </p>
        <div dangerouslySetInnerHTML={{ __html: post.html }} />
        <p>
          <a href={discussUrl} target="_blank" rel="noopener noreferrer">
            Discuss on Twitter
          </a>
          {` • `}
          <a href={editUrl} target="_blank" rel="noopener noreferrer">
            Edit on GitHub
          </a>
        </p>

        <div style={{
          padding: rhythm(1.2),
          marginTop: rhythm(1),
          boxShadow: '0 2px 15px 0 rgba(210,214,220,.5)',
          borderRadius: 5
        }}>
          <h3 style={{ marginTop: 0 }}>
            <Link
              style={{
                boxShadow: 'none',
                textDecoration: 'none',
                color: '#f87000',
              }}
              to={'/'}
            >
              Hope you enjoyed the read! 📝
            </Link>
          </h3>
          <Bio marginBottom={0} />
        </div>
        <ul
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'space-between',
            listStyle: 'none',
            padding: 0,
          }}
        >
          <li>
            {previous && (
              <Link to={previous.fields.slug} rel="prev">
                ← {previous.frontmatter.title}
              </Link>
            )}
          </li>
          <li>
            {next && (
              <Link to={next.fields.slug} rel="next">
                {next.frontmatter.title} →
              </Link>
            )}
          </li>
        </ul>
      </Layout>
    )
  }
}

export default BlogPostTemplate

export const pageQuery = graphql`
  query BlogPostBySlug($slug: String!) {
    site {
      siteMetadata {
        title
        author
      }
    }
    markdownRemark(fields: { slug: { eq: $slug } }) {
      id
      html
      timeToRead
      frontmatter {
        title
        date(formatString: "MMMM DD, YYYY")
        spoiler
      }
      fields {
        slug
      }
    }
  }
`

import React from 'react'
import { Link, graphql } from 'gatsby'

import Bio from '../components/Bio'
import Layout from '../components/Layout'
import SEO from '../components/SEO'
import { formatReadingTime } from '../utils/helpers'
import { rhythm, scale, colors } from '../utils/typography'
import { shape, string } from 'prop-types'
import p from '../utils/shared-props'
import StructuredData from '../components/StructuredData'

const GITHUB_USERNAME = 'JasonEtco'
const GITHUB_REPO_NAME = 'jasonet.co'

export default function BlogPostTemplate(props) {
  const post = props.data.markdownRemark
  const { title: siteTitle, siteUrl } = props.data.site.siteMetadata
  const { previous: prev, next, slug } = props.pageContext

  const urlSlug = slug.slice(1, -1)
  const editUrl = `https://github.com/${GITHUB_USERNAME}/${GITHUB_REPO_NAME}/edit/master/src/pages/${urlSlug}.md`
  const discussUrl = `https://mobile.twitter.com/search?q=${encodeURIComponent(
    `https://jasonet.co${slug}`
  )}`
  return (
    <Layout title={siteTitle}>
      <SEO
        title={post.frontmatter.title}
        description={post.frontmatter.spoiler}
        slug={post.fields.slug}
      />
      <div>
        <header>
          <h1
            itemProp="name"
            style={{ ...scale(1.6), fontWeight: 900, lineHeight: 1.1 }}
          >
            {post.frontmatter.title}
          </h1>
          <p
            style={{
              ...scale(-1 / 5),
              fontFamily: 'Inter UI, sans-serif',
              display: 'block',
              marginBottom: rhythm(1),
              marginTop: rhythm(-3 / 5)
            }}
          >
            <time>{post.frontmatter.date}</time>
            {` • `}
            <time>{formatReadingTime(post.timeToRead)}</time>
          </p>
        </header>

        <div
          className="blog-post"
          dangerouslySetInnerHTML={{ __html: post.html }}
        />

        <p style={{ marginTop: rhythm(2), color: colors.gray[6] }}>
          <a href={discussUrl} target="_blank" rel="noopener noreferrer">
            Discuss on Twitter
          </a>
          {` • `}
          <a href={editUrl} target="_blank" rel="noopener noreferrer">
            Edit on GitHub
          </a>
          {` • `}
          <a href="/rss.xml">RSS Feed</a>
        </p>

        <div
          style={{
            padding: rhythm(1.2),
            marginTop: rhythm(1),
            boxShadow: '0 2px 15px 0 rgba(210,214,220,.5)',
            borderRadius: 5
          }}
        >
          <h3 style={{ marginTop: 0 }}>
            <Link
              style={{
                boxShadow: 'none',
                textDecoration: 'none',
                color: '#f26d21'
              }}
              to={'/'}
            >
              Hope you enjoyed the read! 📝
            </Link>
          </h3>
          <Bio />
        </div>

        <StructuredData
          data={{
            '@type': 'BlogPosting',
            name: post.frontmatter.title,
            dateCreated: post.frontmatter.date,
            datePublished: post.frontmatter.date,
            dateModified: post.frontmatter.date,
            headline: post.frontmatter.spoiler,
            articleBody: post.html,
            text: post.html,
            timeRequired: post.timeToRead,
            url: `${siteUrl}${slug}`,
            image: `${siteUrl}/card.png`,
            author: {
              '@type': 'Person',
              name: 'Jason Etcovitch',
              url: siteUrl
            }
          }}
        />
      </div>

      <ul
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'space-between',
          listStyle: 'none',
          padding: 0,
          marginLeft: 0,
          marginTop: rhythm(2)
        }}
      >
        <li>
          {prev && (
            <Link to={prev.fields.slug} rel="prev">
              ← {prev.frontmatter.title}
              <StructuredData
                data={{
                  '@type': 'BlogPosting',
                  name: prev.frontmatter.title,
                  headline: prev.frontmatter.spoiler,
                  dateCreated: prev.frontmatter.date,
                  author: {
                    '@type': 'Person',
                    name: 'Jason Etcovitch'
                  }
                }}
              />
            </Link>
          )}
        </li>
        <li>
          {next && (
            <Link
              to={next.fields.slug}
              rel="next"
              itemScope
              itemType="https://schema.org/BlogPosting"
            >
              {next.frontmatter.title} →
              <StructuredData
                data={{
                  '@type': 'BlogPosting',
                  name: next.frontmatter.title,
                  headline: next.frontmatter.spoiler,
                  dateCreated: next.frontmatter.date,
                  author: {
                    '@type': 'Person',
                    name: 'Jason Etcovitch'
                  }
                }}
              />
            </Link>
          )}
        </li>
      </ul>
    </Layout>
  )
}

export const pageQuery = graphql`
  query BlogPostBySlug($slug: String!) {
    site {
      siteMetadata {
        title
        author
        siteUrl
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

BlogPostTemplate.propTypes = {
  pageContext: shape({
    previous: p.post,
    next: p.post,
    slug: string.isRequired
  }),
  data: shape({
    site: p.site,
    markdownRemark: p.post
  })
}

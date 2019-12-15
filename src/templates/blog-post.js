import React from 'react'
import { Link, graphql } from 'gatsby'

import Bio from '../components/Bio'
import Layout from '../components/Layout'
import Seo from '../components/SEO'
import { formatReadingTime } from '../utils/helpers'
import { rhythm, scale, colors } from '../utils/typography'
import { shape, string } from 'prop-types'
import p from '../utils/shared-props'

const GITHUB_USERNAME = 'JasonEtco'
const GITHUB_REPO_NAME = 'jasonet.co'

export default function BlogPostTemplate(props) {
  const post = props.data.markdownRemark
  const { title: siteTitle, siteUrl } = props.data.site.siteMetadata
  const { previous, next, slug } = props.pageContext

  const urlSlug = slug.slice(1, -1)
  const editUrl = `https://github.com/${GITHUB_USERNAME}/${GITHUB_REPO_NAME}/edit/master/src/pages/${urlSlug}.md`
  const discussUrl = `https://mobile.twitter.com/search?q=${encodeURIComponent(
    `https://jasonet.co${slug}`
  )}`
  return (
    <Layout title={siteTitle}>
      <Seo
        title={post.frontmatter.title}
        description={post.frontmatter.spoiler}
        slug={post.fields.slug}
      />
      <div itemScope itemType="http://schema.org/BlogPosting">
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
            <time itemProp="datePublished">{post.frontmatter.date}</time>
            <span> • </span>
            <time itemProp="timeRequired">
              {formatReadingTime(post.timeToRead)}
            </time>
          </p>
          <meta itemProp="url" content={`${siteUrl}${slug}`} />
        </header>

        {post.frontmatter.toc && (
          <aside
            style={{
              paddingLeft: rhythm(0.6),
              paddingRight: rhythm(0.6),
              paddingTop: rhythm(0.6),
              paddingBottom: rhythm(0.4),
              marginBottom: rhythm(1),
              marginTop: rhythm(1),
              border: `1px solid ${colors.gray[3]}`,
              borderRadius: 4
            }}
          >
            <p
              style={{
                ...scale(0.05),
                color: colors.gray[7],
                marginBottom: rhythm(0.5)
              }}
            >
              Table of Contents
            </p>
            <div dangerouslySetInnerHTML={{ __html: post.tableOfContents }} />
          </aside>
        )}

        <div
          className="blog-post"
          itemProp="articleBody text"
          dangerouslySetInnerHTML={{ __html: post.html }}
        />

        <p style={{ marginTop: rhythm(2), color: colors.gray[6] }}>
          <a href={discussUrl} target="_blank" rel="noopener noreferrer">
            Discuss on Twitter
          </a>
          <span> • </span>
          <a href={editUrl} target="_blank" rel="noopener noreferrer">
            Edit on GitHub
          </a>
          <span> • </span>
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
              to="/"
            >
              Hope you enjoyed the read! 📝
            </Link>
          </h3>
          <Bio />
        </div>
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
          {previous && (
            <Link
              to={previous.fields.slug}
              rel="prev"
              itemScope
              itemType="https://schema.org/BlogPosting"
            >
              ← <span itemProp="name">{previous.frontmatter.title}</span>
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
              <span itemProp="name">{next.frontmatter.title}</span> →
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
      tableOfContents(maxDepth: 2)
      frontmatter {
        title
        date(formatString: "MMMM DD, YYYY")
        spoiler
        toc
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

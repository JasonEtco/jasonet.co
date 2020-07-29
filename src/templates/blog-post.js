import React from 'react'
import { Link, graphql } from 'gatsby'

import Bio from '../components/Bio'
import Layout from '../components/Layout'
import Seo from '../components/SEO'
import { formatReadingTime } from '../utils/helpers'
import { shape, string } from 'prop-types'
import p from '../utils/shared-props'

const GITHUB_USERNAME = 'JasonEtco'
const GITHUB_REPO_NAME = 'jasonet.co'

export default function BlogPostTemplate(props) {
  const post = props.data.markdownRemark
  const { title: siteTitle, siteUrl } = props.data.site.siteMetadata
  const { previous, next, slug } = props.pageContext

  const urlSlug = slug.slice(1, -1)
  const editUrl = `https://github.com/${GITHUB_USERNAME}/${GITHUB_REPO_NAME}/edit/main/src/pages/${urlSlug}.md`
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
            style={{ fontSize: '3rem', fontWeight: 900, lineHeight: 1.1 }}
            className="mb-0 pb-3"
          >
            {post.frontmatter.title}
          </h1>
          <p className="text-sm mt-3 mb-6">
            <time itemProp="datePublished">{post.frontmatter.date}</time>
            <span> • </span>
            <time itemProp="timeRequired">
              {formatReadingTime(post.timeToRead)}
            </time>
          </p>
          <meta itemProp="url" content={`${siteUrl}${slug}`} />
        </header>

        {post.frontmatter.toc && (
          <aside className="p-6 my-6 border-solid border border-gray-300 rounded-lg">
            <p className="text-sm text-gray-700 mb-3">Table of Contents</p>
            <div dangerouslySetInnerHTML={{ __html: post.tableOfContents }} />
          </aside>
        )}

        <div
          className="blog-post"
          itemProp="articleBody text"
          dangerouslySetInnerHTML={{ __html: post.html }}
        />

        <p className="text-gray-600 mt-6">
          <a
            className="text-orange"
            href={discussUrl}
            target="_blank"
            rel="noopener noreferrer"
          >
            Discuss on Twitter
          </a>
          <span> • </span>
          <a
            className="text-orange"
            href={editUrl}
            target="_blank"
            rel="noopener noreferrer"
          >
            Edit on GitHub
          </a>
          <span> • </span>
          <a className="text-orange" href="/rss.xml">
            RSS Feed
          </a>
        </p>

        <div className="px-6 py-8 mt-6 shadow-xl border border-gray-100 rounded-lg">
          <h3 className="font-semibold mt-0 mb-6 text-lg">
            <Link className="text-orange" to="/">
              Hope you enjoyed the read! 📝
            </Link>
          </h3>
          <Bio />
        </div>
      </div>

      <ul className="list-none flex flex-wrap justify-between p-0 ml-0 mt-12">
        <li>
          {previous && (
            <Link
              to={previous.fields.slug}
              rel="prev"
              itemScope
              itemType="https://schema.org/BlogPosting"
              className="text-orange"
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
              className="text-orange"
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
    slug: string.isRequired,
  }),
  data: shape({
    site: p.site,
    markdownRemark: p.post,
  }),
}

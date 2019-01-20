import React from 'react'
import { Link, graphql } from 'gatsby'
import get from 'lodash/get'

import Bio from '../components/Bio'
import SEO from '../components/SEO'
import Repo from '../components/Repo'
import { formatReadingTime } from '../utils/helpers'
import { rhythm, scale, colors } from '../utils/typography'

class BlogIndex extends React.Component {
  constructor (props) {
    super(props)
    this.state = { loading: true, repos: [] }
    this.getRepos = this.getRepos.bind(this)
  }

  componentDidMount () {
    this.getRepos().then(repos => {
      this.setState({
        loading: false,
        repos
      })
    })
  }

  getRepos () {
    return fetch('https://api.github.com/users/JasonEtco/repos?type=owner&sort=pushed')
      .then(res => res.json())
      .then(json => json.slice(0, 2))
  }

  render() {
    const posts = get(this, 'props.data.allMarkdownRemark.edges')
    const { loading, repos } = this.state

    return (
      <main
        style={{
          marginLeft: 'auto',
          marginRight: 'auto',
          maxWidth: rhythm(24),
          padding: `${rhythm(1.5)} ${rhythm(1)}`,
        }}
      >
        <SEO />

        <div style={{
          display: 'flex',
          alignItems: 'center',
          borderBottom: '1px solid hsla(0,0%,0%,0.07)',
          paddingBottom: rhythm(0.5)
        }} className="home__hero">
          <h1 style={{
            ...scale(1.8),
            fontWeight: 900,
            lineHeight: 0.9,
            border: 'none',
            margin: 0,
            padding: 0
          }}>
            Jason<br />Etcovitch
          </h1>

          <div style={{ alignSelf: 'end' }}>
            <p style={{ marginBottom: 0, marginLeft: 16 }}>
              🐙 Engineer at <a href="https://github.com/JasonEtco">GitHub</a><br />
              🐦 Follow me on <a href="https://twitter.com/JasonEtco">Twitter</a>
            </p>
          </div>
        </div>

        <div style={{ paddingTop: rhythm(2), paddingBottom: rhythm(2), borderBottom: '1px solid hsla(0,0%,0%,0.07)' }}>
          <h5>Posts:</h5>
          {posts.map(({ node }) => {
            const title = get(node, 'frontmatter.title') || node.fields.slug
            return (
              <div key={node.fields.slug}>
                <h3
                  style={{
                    marginBottom: rhythm(1 / 4),
                  }}
                >
                  <Link style={{ boxShadow: 'none' }} to={node.fields.slug}>
                    {title}
                  </Link>
                </h3>
                <small>
                  {node.frontmatter.date}
                  {` • ${formatReadingTime(node.timeToRead)}`}
                </small>
                <p
                  dangerouslySetInnerHTML={{ __html: node.frontmatter.spoiler }}
                />
              </div>
            )
          })}
        </div>

        {loading ? null : (
          <div style={{ marginTop: rhythm(3) }}>
            <h5>Recently worked on:</h5>
            <ul className="repo-list" style={{ display: 'flex', listStyleType: 'none', padding: 0, margin: 0 }}>
              <div className="repo-wrapper" style={{ marginRight: 6, width: '50%' }}>
                <Repo repo={repos[0]} />
              </div>
              <div className="repo-wrapper" style={{ marginLeft: 6, width: '50%' }}>
                <Repo repo={repos[1]} />
              </div>
            </ul>
          </div>
        )}

        <div style={{
          padding: rhythm(1),
          marginTop: rhythm(2),
          boxShadow: '0 2px 15px 0 rgba(210,214,220,.5)',
          borderRadius: 5
        }}>
          <Bio marginBottom={0} />
        </div>
      </main>
    )
  }
}

export default BlogIndex

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

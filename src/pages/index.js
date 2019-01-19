import React from 'react'
import { Link, graphql } from 'gatsby'
import get from 'lodash/get'

import Bio from '../components/Bio'
import SEO from '../components/SEO'
import Repo from '../components/Repo'
import { formatReadingTime } from '../utils/helpers'
import { rhythm, colors } from '../utils/typography'

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
          padding: `${rhythm(1.5)} 0`,
        }}
      >
        <SEO />
        <Bio />

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

        {loading ? null : (
          <div style={{ marginTop: rhythm(2) }}>
            <h5>Recently worked on:</h5>
            <ul style={{ display: 'flex', listStyleType: 'none', padding: 0, margin: 0 }}>
              <div style={{ marginRight: 6 }}>
                <Repo repo={repos[0]} />
              </div>
              <div style={{ marginLeft: 6 }}>
                <Repo repo={repos[1]} />
              </div>
            </ul>
          </div>
        )}
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

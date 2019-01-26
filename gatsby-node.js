const path = require('path')
const { createFilePath } = require('gatsby-source-filesystem')

async function getRelatedPosts(graphql, posts) {
  if (!posts) return []
  const result = await graphql(
    `
      query RelatedPostsBySlug($slugs: [String]!) {
        allMarkdownRemark(
          filter: { fields: { slug: { in: $slugs } } }
          sort: { fields: [frontmatter___date], order: DESC }
          limit: 2
        ) {
          edges {
            node {
              timeToRead
              fields {
                slug
              }
              frontmatter {
                title
                spoiler
                date(formatString: "MMMM DD, YYYY")
              }
            }
          }
        }
      }
    `,
    { slugs: posts.map(p => `/posts/${p}/`) }
  )
  return result.data.allMarkdownRemark.edges
}

exports.createPages = async ({ graphql, actions }) => {
  const { createPage } = actions
  const blogPost = path.resolve('./src/templates/blog-post.js')
  const result = await graphql(`
    {
      allMarkdownRemark(
        sort: { fields: [frontmatter___date], order: DESC }
        limit: 1000
      ) {
        edges {
          node {
            fields {
              slug
            }
            frontmatter {
              title
              related
            }
          }
        }
      }
    }
  `)

  if (result.errors) {
    console.error(result.errors)
    throw result.errors
  }

  // Create blog posts pages.
  const posts = result.data.allMarkdownRemark.edges
  for (const i in posts) {
    const index = parseInt(i, 10)
    const post = posts[index]

    const previous = index === posts.length - 1 ? null : posts[index + 1].node
    const next = index === 0 ? null : posts[index - 1].node
    const related = await getRelatedPosts(
      graphql,
      post.node.frontmatter.related
    )

    createPage({
      path: post.node.fields.slug,
      component: blogPost,
      context: {
        slug: post.node.fields.slug,
        previous,
        next,
        related
      }
    })
  }
}

exports.onCreateNode = ({ node, actions, getNode }) => {
  const { createNodeField } = actions
  if (node.internal.type !== `MarkdownRemark`) return
  const value = createFilePath({ node, getNode })
  createNodeField({ name: `slug`, node, value })
}

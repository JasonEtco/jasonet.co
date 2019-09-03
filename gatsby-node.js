const path = require('path')
const { createFilePath } = require('gatsby-source-filesystem')
const createSocialCard = require('./src/utils/create-social-card')

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
              date(formatString: "MMMM DD, YYYY")
              spoiler
            }
            timeToRead
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

  for (let index = 0; index < posts.length; index++) {
    const post = posts[index]

    await createSocialCard(post.node)

    const previous = index === posts.length - 1 ? null : posts[index + 1].node
    const next = index === 0 ? null : posts[index - 1].node

    createPage({
      path: post.node.fields.slug,
      component: blogPost,
      context: {
        slug: post.node.fields.slug,
        previous,
        next
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

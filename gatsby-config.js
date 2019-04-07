module.exports = {
  siteMetadata: {
    title: 'Jason Etcovitch · jasonet.co',
    author: 'Jason Etcovitch',
    description: 'Personal blog by Jason Etcovitch.',
    siteUrl: 'https://jasonet.co',
    social: {
      twitter: '@JasonEtco'
    }
  },
  pathPrefix: '/',
  plugins: [
    {
      resolve: `gatsby-source-filesystem`,
      options: {
        path: `${__dirname}/src/pages`,
        name: 'pages'
      }
    },
    {
      resolve: `gatsby-transformer-remark`,
      options: {
        plugins: [
          {
            resolve: `gatsby-remark-images`,
            options: {
              maxWidth: 590
            }
          },
          {
            resolve: `gatsby-remark-responsive-iframe`,
            options: {
              wrapperStyle: `margin-bottom: 1.0725rem`
            }
          },
          'gatsby-remark-autolink-headers',
          {
            resolve: 'gatsby-remark-prismjs',
            options: {
              inlineCodeMarker: '÷'
            }
          },
          'gatsby-remark-copy-linked-files',
          'gatsby-remark-smartypants',
          `gatsby-remark-emoji`
        ]
      }
    },
    `gatsby-transformer-sharp`,
    `gatsby-plugin-sharp`,
    {
      resolve: `gatsby-plugin-google-analytics`,
      options: {
        trackingId: `UA-72564268-1`
      }
    },
    {
      resolve: `gatsby-plugin-manifest`,
      options: {
        name: `jasonet.co`,
        short_name: `jasonet.co`,
        start_url: `/`,
        background_color: `#ffffff`,
        theme_color: `#f26d21`,
        display: `minimal-ui`,
        icon: `src/assets/icon.png`
      }
    },
    `gatsby-plugin-react-helmet`,
    {
      resolve: 'gatsby-plugin-typography',
      options: {
        pathToConfigModule: 'src/utils/typography'
      }
    },
    `gatsby-plugin-catch-links`,
    {
      resolve: `gatsby-plugin-feed`,
      options: {
        feeds: [
          {
            serialize({ query: { site, allMarkdownRemark } }) {
              return allMarkdownRemark.edges.map(edge => ({
                ...edge.node.frontmatter,
                description: edge.node.frontmatter.spoiler,
                date: edge.node.frontmatter.date,
                url: site.siteMetadata.siteUrl + edge.node.fields.slug,
                guid: site.siteMetadata.siteUrl + edge.node.fields.slug,
                custom_elements: [{ 'content:encoded': edge.node.html }]
              }))
            },
            query: `
              {
                allMarkdownRemark(
                  limit: 1000,
                  sort: { order: DESC, fields: [frontmatter___date] }
                ) {
                  edges {
                    node {
                      html
                      fields { slug }
                      frontmatter {
                        title
                        date
                        spoiler
                      }
                    }
                  }
                }
              }
            `,
            output: '/rss.xml'
          }
        ]
      }
    },
    `gatsby-plugin-netlify`,
    'gatsby-plugin-remove-serviceworker'
  ]
}

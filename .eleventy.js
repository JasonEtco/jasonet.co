const syntaxHighlight = require('@11ty/eleventy-plugin-syntaxhighlight')
const pluginRss = require('@11ty/eleventy-plugin-rss')
const timeToRead = require('eleventy-plugin-time-to-read')
const tableOfContents = require('eleventy-plugin-toc')
const dateFilter = require('nunjucks-date-filter')
const octicons = require('@primer/octicons')
const markdownIt = require('markdown-it')
const markdownItAnchor = require('markdown-it-anchor')
const markdownItEmoji = require('markdown-it-emoji')
const slugify = require('slugify')

const compileReadme = require('./bin/compile-readme')
const generateImages = require('./bin/generate-images')

module.exports = (eleventyConfig) => {
  dateFilter.setDefaultFormat('MMMM D, YYYY')
  
  eleventyConfig.addPlugin(pluginRss)
  eleventyConfig.addPlugin(tableOfContents, { tags: ['h2'] })
  eleventyConfig.addPlugin(syntaxHighlight)
  eleventyConfig.addPlugin(timeToRead)
  eleventyConfig.addNunjucksFilter('date', dateFilter)
  eleventyConfig.addPassthroughCopy('assets')

  eleventyConfig.addShortcode('octicon', (name) => {
    const octicon = octicons[name]
    if (!octicon) throw new Error(`Octicon [${name}] does not exist`)
    return octicon.toSVG()
  })



  const linkAfterHeader = markdownItAnchor.permalink.linkAfterHeader({
    class: "anchor",
    symbol: "<span hidden>#</span>",
    style: "aria-labelledby",
  })

  const markdown = markdownIt({ html: true })
    .use(markdownItEmoji)
    .use(markdownItAnchor, {
      level: [1, 2, 3],
      slugify: (str) => slugify(str, { lower: true, strict: true, remove: /[']/g, }),
      tabIndex: false,
      permalink(slug, opts, state, idx) {
        state.tokens.splice(idx, 0, Object.assign(new state.Token('div_open', 'div', 1), {
            attrs: [['class', `heading-wrapper ${state.tokens[idx].tag}`]],
            block: true,
          })
        )
    
        state.tokens.splice(idx + 4, 0, Object.assign(new state.Token('div_close', 'div', -1), {
            block: true,
          })
        )

        linkAfterHeader(slug, opts, state, idx + 1)
      },
    })
  eleventyConfig.setLibrary('md', markdown)

  eleventyConfig.on('afterBuild', () => {
    if (process.env.NODE_ENV !== 'production') {
      compileReadme()
      generateImages()
    }
  })
}

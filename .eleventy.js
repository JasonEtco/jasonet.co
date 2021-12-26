const syntaxHighlight = require('@11ty/eleventy-plugin-syntaxhighlight')
const pluginRss = require('@11ty/eleventy-plugin-rss')
const timeToRead = require('eleventy-plugin-time-to-read')
const tableOfContents = require('eleventy-plugin-toc')
const dateFilter = require('nunjucks-date-filter')
const octicons = require('@primer/octicons')

module.exports = (eleventyConfig) => {
  dateFilter.setDefaultFormat('MMMM D, YYYY')
  
  eleventyConfig.addPlugin(pluginRss)
  eleventyConfig.addPlugin(tableOfContents)
  eleventyConfig.addPlugin(syntaxHighlight)
  eleventyConfig.addPlugin(timeToRead)
  eleventyConfig.addNunjucksFilter('date', dateFilter)
  eleventyConfig.addPassthroughCopy('assets')

  eleventyConfig.addShortcode('octicon', (name) => {
    const result = octicons[name].toSVG()
    return result
  })
}

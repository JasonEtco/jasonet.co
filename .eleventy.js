const syntaxHighlight = require('@11ty/eleventy-plugin-syntaxhighlight')
const timeToRead = require('eleventy-plugin-time-to-read')
const tableOfContents = require('eleventy-plugin-toc')
const dateFilter = require('nunjucks-date-filter')

module.exports = (eleventyConfig) => {
  dateFilter.setDefaultFormat('MMMM D, YYYY')

  eleventyConfig.addPlugin(tableOfContents)
  eleventyConfig.addPlugin(syntaxHighlight)
  eleventyConfig.addPlugin(timeToRead)
  eleventyConfig.addNunjucksFilter('date', dateFilter)

  eleventyConfig.addPassthroughCopy('assets')
}

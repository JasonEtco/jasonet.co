/**
 * Adds a class to the wrapping object of any code blocks
 * that contain highlighted lines
 * @param {string} html
 */
export default function highlightClassName(html) {
  const parser = new window.DOMParser()
  const dom = parser.parseFromString(html, 'text/html')
  const els = dom.querySelectorAll('.gatsby-highlight')

  for (const el of els) {
    if (el.querySelector('.gatsby-highlight-code-line')) {
      el.classList.add('gatsby-highlight--has-highlighted-lines')
    }
  }

  return dom.body.innerHTML
}

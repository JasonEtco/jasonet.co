const fs = require('fs')
const path = require('path')
const parseFrontMatter = require('front-matter')
const { siteUrl } = require('../_data/constants.json')

const START_COMMENT = '<!--START_POSTS-->'
const END_COMMENT = '<!--END_POSTS-->'
const reg = new RegExp(`${START_COMMENT}[\\s\\S]+${END_COMMENT}`)

function readFm(pathToPost) {
  const contents = fs.readFileSync(pathToPost, 'utf8')
  return parseFrontMatter(contents).attributes
}

function getPosts() {
  const postsDir = path.join(__dirname, '..', 'posts')
  const posts = fs.readdirSync(postsDir)
  return posts.filter(post => post.endsWith('.md')).map(post => ({
    fm: readFm(path.join(postsDir, post)),
    slug: post.replace(path.extname(post), '')
  }))
}

function generateList(posts) {
  return posts
    .sort((a, b) => {
      if (a.fm.date > b.fm.date) return -1
      if (a.fm.date < b.fm.date) return 1

      return 0
    })
    .map(({ fm, slug }) => `- [${fm.title}](${siteUrl}/posts/${slug})`)
    .join('\n')
}

function replaceReadmeBlock(pathToReadme, list) {
  const readme = fs.readFileSync(pathToReadme, 'utf8')
  const listWithFences = `${START_COMMENT}\n${list}\n${END_COMMENT}`
  return readme.replace(reg, listWithFences)
}

function main() {
  const posts = getPosts()
  const list = generateList(posts)
  const pathToReadme = path.join(__dirname, '..', 'README.md')
  const newContents = replaceReadmeBlock(pathToReadme, list)
  fs.writeFileSync(pathToReadme, newContents)
  console.log('Done!')
}

main()

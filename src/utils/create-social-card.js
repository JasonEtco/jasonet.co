require('dotenv').config()

const fs = require('fs')
const path = require('path')
const request = require('request')
const { promisify } = require('util')
const postReq = promisify(request.post)

const cardTemplate = post => ({
  html: `
    <link href="https://rsms.me/inter/inter.css" rel="stylesheet" type="text/css" />
    <main>
      <div>
        <span class="emoji">📝</span>
        <div>
          <h1>${post.frontmatter.title}</h1>
          <p>${post.frontmatter.spoiler}</p>
          <small><span class="orange">https://jasonet.co</span> • ${post.frontmatter.date} • ${post.timeToRead} min read</small>
        </div>
      </div>
    </main>
  `,
  css: `
    html { font-family: 'Inter', sans-serif !important; }
    main {
      box-sizing: border-box;
      background-color: #2f363d;
      color: white;
      width: 600px;
      height: 315px;
      padding: 32px;
      display: flex;
      justify-content: center;
      align-items: center;
    }
    main > div {
      display: flex;
    }
    .emoji {
      font-size: 32px;
      margin-right: 16px;
      line-height: 1.5;
    }
    h1 {
      margin-top: 0;
      margin-bottom: 0;
      color: #f6f8fa;
      font-size: 50px;
      font-weight: 900;
      line-height: 1;
    }
    p {
      margin-top: 16px;
      color: #959da5;
      font-size: 18px;
    }
    small {
      color: #959da5
    }
    .orange {
      color: #f26d21;
    }
  `
})

async function createCard(post) {
  const { HTML_IMG_API_ID, HTML_IMG_API_KEY } = process.env
  const res = await postReq({
    url: 'https://hcti.io/v1/image',
    form: cardTemplate(post),
    json: true,
    auth: {
      user: HTML_IMG_API_ID,
      pass: HTML_IMG_API_KEY
    }
  })
  return res.body.url
}

module.exports = async function createImageIfNeeded(post) {
  const bareSlug = post.fields.slug.split('/')[2]
  // Create determinable file name
  const pathToFile = path.join(
    __dirname,
    '..',
    '..',
    'static',
    'posts',
    `${bareSlug}.png`
  )
  // Check if file exists
  // If it does, return
  if (fs.existsSync(pathToFile)) return

  // If it doesn't, create it
  const url = await createCard(post)
  return new Promise(resolve => {
    request(url)
      .pipe(fs.createWriteStream(pathToFile))
      .on('finish', resolve)
  })
}

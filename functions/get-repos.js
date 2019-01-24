const https = require('https')

const query = `{ 
  viewer {
    repositories (affiliations: OWNER, first: 2, orderBy: { field: PUSHED_AT, direction: DESC }, isFork: false) {
      nodes {
        url
        name
        description
        stargazers {
          totalCount
        }
        forkCount
        primaryLanguage {
          color
          name
        }
      }
    }
  }
}`

const data = JSON.stringify({ query })

const options = {
  hostname: 'api.github.com',
  port: 443,
  path: '/graphql',
  method: 'POST',
  headers: {
    Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
    'User-Agent': 'jasonetco',
    'Content-Type': 'application/json',
    'Content-Length': data.length
  }
}

async function request() {
  return new Promise((resolve, reject) => {
    let ret = ''
    const req = https.request(options, res => {
      res.on('data', d => {
        ret += d.toString('utf8')
      })
    })

    req.on('error', error => reject(error))
    req.on('close', () => resolve(JSON.parse(ret)))

    req.write(data)
    req.end()
  })
}

exports.handler = async function handler() {
  const { data: res } = await request()

  return {
    statusCode: 200,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(res.viewer.repositories.nodes)
  }
}

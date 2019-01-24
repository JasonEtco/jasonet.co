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
    Authorization: `token ${process.env.GITHUB_TOKEN}`,
    'Content-Type': 'application/json',
    'Content-Length': data.length
  }
}

async function request() {
  return new Promise((resolve, reject) => {
    const req = https.request(options, res => {
      console.log(`statusCode: ${res.statusCode}`)

      res.on('data', d => {
        console.log(d)
        resolve(d)
      })
    })

    req.on('error', error => {
      reject(error)
    })

    req.write(data)
    req.end()
  })
}

exports.handler = async function handler() {
  const res = await request()

  return {
    statusCode: 200,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(res.viewer.repositories.nodes)
  }
}

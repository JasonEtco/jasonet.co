const gql = require('@octokit/graphql')

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

export async function handler() {
  const res = await gql(query, {
    headers: {
      Authorization: `token ${process.env.GITHUB_TOKEN}`
    }
  })

  return {
    statusCode: 200,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(res.viewer.repositories.nodes)
  }
}

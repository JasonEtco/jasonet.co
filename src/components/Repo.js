import React from 'react'
import { rhythm, scale, colors } from '../utils/typography'

function Repo (props) {
  const { repo, loading } = props
  if (loading) return (
    <div style={{
      height: rhythm(5.7),
      padding: rhythm(0.8),
      border: '1px solid',
      borderColor: colors.gray[2],
      borderRadius: 3
    }}>
      <div className="pulse" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        <div style={{ height: rhythm(0.7), width: '50%', backgroundColor: colors.gray[2], marginBottom: rhythm(0.2) }} />
        <div style={{ height: rhythm(0.5), width: '100%', backgroundColor: colors.gray[2], marginBottom: rhythm(0.1) }} />
        <div style={{ height: rhythm(0.5), width: '30%', backgroundColor: colors.gray[2] }} />
        <div style={{ display: 'flex', marginTop: 'auto' }}>
          <div style={{ height: rhythm(0.5), width: '30%', backgroundColor: colors.gray[2] }} />
          <div style={{ height: rhythm(0.5), width: '10%', backgroundColor: colors.gray[2], marginLeft: 16 }} />
          <div style={{ height: rhythm(0.5), width: '10%', backgroundColor: colors.gray[2], marginLeft: 16 }} />
        </div>
      </div>
    </div>
  )

  if (!repo) return null

  return (
    <div style={{
      height: '100%',
      padding: rhythm(0.8),
      border: '1px solid',
      borderColor: colors.gray[2],
      borderRadius: 3
    }}>
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }} className="repo--loaded">
        <a href={repo.html_url} style={{ color: colors.blue[5] }}>
          <h4 style={{ marginTop: 0, marginBottom: rhythm(0.2) }} title={repo.name}>{repo.name}</h4>
        </a>

        <p style={{ ...scale(-0.2), lineHeight: rhythm(0.8), marginBottom: rhythm(0.5), color: colors.gray[5] }}>
          {repo.description}
        </p>

        <p style={{ ...scale(-0.4), color: colors.gray[5], margin: 0, marginTop: 'auto' }}>
            {repo.language}
            <a href={`${repo.html_url}/stargazers`} style={{ color: 'inherit', marginLeft: 16 }}>
              <svg style={{ marginRight: 2 }} aria-label="stars" className="octicon octicon-star" viewBox="0 0 14 16" version="1.1" width="14" height="16" role="img"><path fillRule="evenodd" d="M14 6l-4.9-.64L7 1 4.9 5.36 0 6l3.6 3.26L2.67 14 7 11.67 11.33 14l-.93-4.74L14 6z"></path></svg>
              {repo.stargazers_count}
            </a>
            <a href={`${repo.html_url}/network`} style={{ color: 'inherit', marginLeft: 16 }}>
              <svg style={{ marginRight: 2 }} aria-label="forks" className="octicon octicon-repo-forked" viewBox="0 0 10 16" version="1.1" width="10" height="16" role="img"><path fillRule="evenodd" d="M8 1a1.993 1.993 0 0 0-1 3.72V6L5 8 3 6V4.72A1.993 1.993 0 0 0 2 1a1.993 1.993 0 0 0-1 3.72V6.5l3 3v1.78A1.993 1.993 0 0 0 5 15a1.993 1.993 0 0 0 1-3.72V9.5l3-3V4.72A1.993 1.993 0 0 0 8 1zM2 4.2C1.34 4.2.8 3.65.8 3c0-.65.55-1.2 1.2-1.2.65 0 1.2.55 1.2 1.2 0 .65-.55 1.2-1.2 1.2zm3 10c-.66 0-1.2-.55-1.2-1.2 0-.65.55-1.2 1.2-1.2.65 0 1.2.55 1.2 1.2 0 .65-.55 1.2-1.2 1.2zm3-10c-.66 0-1.2-.55-1.2-1.2 0-.65.55-1.2 1.2-1.2.65 0 1.2.55 1.2 1.2 0 .65-.55 1.2-1.2 1.2z"></path></svg>
              {repo.forks_count}
            </a>
        </p>
      </div>
    </div>
  )
}

export default Repo

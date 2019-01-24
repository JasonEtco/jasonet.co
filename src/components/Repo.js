import React from 'react'
import { rhythm, scale, colors } from '../utils/typography'
import { any, string, number, bool, shape } from 'prop-types'

function Block(props) {
  return (
    <div
      style={{
        height: rhythm(0.5 || props.height),
        width: props.width,
        backgroundColor: colors.gray[2],
        borderRadius: 3,
        ...props.style
      }}
    />
  )
}

Block.propTypes = {
  width: number.isRequired,
  height: number,
  style: any
}

export default function Repo(props) {
  const { repo, loading } = props
  if (loading)
    return (
      <div
        style={{
          height: rhythm(5.7),
          padding: rhythm(0.8),
          border: '1px solid',
          borderColor: colors.gray[2],
          borderRadius: 3
        }}
      >
        <div
          className="pulse"
          style={{ display: 'flex', flexDirection: 'column', height: '100%' }}
        >
          <Block
            height={0.7}
            width="50%"
            style={{ marginBottom: rhythm(0.2) }}
          />
          <Block width="100%" style={{ marginBottom: rhythm(0.1) }} />
          <Block width="30%" />
          <div style={{ display: 'flex', marginTop: 'auto' }}>
            <Block width="30%" />
            <Block width="10%" style={{ marginLeft: 16 }} />
            <Block width="10%" style={{ marginLeft: 16 }} />
          </div>
        </div>
      </div>
    )

  if (!repo) return null

  return (
    <div
      style={{
        height: '100%',
        padding: rhythm(0.8),
        border: '1px solid',
        borderColor: colors.gray[2],
        borderRadius: 3
      }}
    >
      <div
        style={{ display: 'flex', flexDirection: 'column', height: '100%' }}
        className="repo--loaded"
      >
        <a href={repo.url} style={{ color: colors.blue[5] }}>
          <h4
            style={{ marginTop: 0, marginBottom: rhythm(0.2) }}
            title={repo.name}
          >
            {repo.name}
          </h4>
        </a>

        <p
          style={{
            ...scale(-0.2),
            lineHeight: rhythm(0.8),
            marginBottom: rhythm(0.5),
            color: colors.gray[5]
          }}
        >
          {repo.description}
        </p>

        <p
          style={{
            ...scale(-0.4),
            color: colors.gray[5],
            margin: 0,
            marginTop: 'auto'
          }}
        >
          <span
            style={{
              width: 12,
              height: 12,
              position: 'relative',
              backgroundColor: repo.primaryLanguage.color,
              borderRadius: '50%',
              display: 'inline-block'
            }}
          />{' '}
          {repo.primaryLanguage.name}
          <a
            href={`${repo.url}/stargazers`}
            style={{ color: 'inherit', marginLeft: 16 }}
          >
            <svg
              style={{ marginRight: 2 }}
              aria-label="stars"
              className="octicon octicon-star"
              viewBox="0 0 14 16"
              version="1.1"
              width="14"
              height="16"
              role="img"
            >
              <path
                fillRule="evenodd"
                d="M14 6l-4.9-.64L7 1 4.9 5.36 0 6l3.6 3.26L2.67 14 7 11.67 11.33 14l-.93-4.74L14 6z"
              />
            </svg>
            {repo.stargazers.totalCount}
          </a>
          <a
            href={`${repo.url}/network`}
            style={{ color: 'inherit', marginLeft: 16 }}
          >
            <svg
              style={{ marginRight: 2 }}
              aria-label="forks"
              className="octicon octicon-repo-forked"
              viewBox="0 0 10 16"
              version="1.1"
              width="10"
              height="16"
              role="img"
            >
              <path
                fillRule="evenodd"
                d="M8 1a1.993 1.993 0 0 0-1 3.72V6L5 8 3 6V4.72A1.993 1.993 0 0 0 2 1a1.993 1.993 0 0 0-1 3.72V6.5l3 3v1.78A1.993 1.993 0 0 0 5 15a1.993 1.993 0 0 0 1-3.72V9.5l3-3V4.72A1.993 1.993 0 0 0 8 1zM2 4.2C1.34 4.2.8 3.65.8 3c0-.65.55-1.2 1.2-1.2.65 0 1.2.55 1.2 1.2 0 .65-.55 1.2-1.2 1.2zm3 10c-.66 0-1.2-.55-1.2-1.2 0-.65.55-1.2 1.2-1.2.65 0 1.2.55 1.2 1.2 0 .65-.55 1.2-1.2 1.2zm3-10c-.66 0-1.2-.55-1.2-1.2 0-.65.55-1.2 1.2-1.2.65 0 1.2.55 1.2 1.2 0 .65-.55 1.2-1.2 1.2z"
              />
            </svg>
            {repo.forkCount}
          </a>
        </p>
      </div>
    </div>
  )
}

Repo.propTypes = {
  loading: bool.isRequired,
  repo: shape({
    url: string.isRequired,
    name: string.isRequired,
    forkCount: number.isRequired,
    stargazers: shape({
      totalCount: number.isRequired
    }),
    description: string.isRequired,
    primaryLanguage: shape({
      name: string.isRequired,
      color: string.isRequired
    }).isRequired
  })
}

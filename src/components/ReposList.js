import React, { Fragment, useEffect, useState } from 'react'
import Repo from './Repo'

export default function ReposList() {
  const [didError, setDidError] = useState(false)
  const [loading, setLoading] = useState(true)
  const [repos, setRepos] = useState([])

  async function fetchRepos() {
    try {
      const res = await window.fetch('/.netlify/functions/get-repos')

      if (!res.ok) {
        console.error(await res.text())
        setDidError(true)
        return
      }

      const json = await res.json()
      setRepos(json)
      setLoading(false)
    } catch (err) {
      console.error(err)
      setDidError(true)
    }
  }

  useEffect(() => {
    fetchRepos()
  }, [])

  if (didError) return null

  return (
    <Fragment>
      <h5>Recently worked on:</h5>
      <ul
        className="repo-list"
        style={{
          display: 'flex',
          listStyleType: 'none',
          padding: 0,
          margin: 0
        }}
      >
        <li className="repo-wrapper" style={{ marginRight: 6, width: '50%' }}>
          <Repo loading={loading} repo={repos[0]} />
        </li>
        <li className="repo-wrapper" style={{ marginLeft: 6, width: '50%' }}>
          <Repo loading={loading} repo={repos[1]} />
        </li>
      </ul>
    </Fragment>
  )
}

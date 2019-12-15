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
      <ul className="block md:flex -mx-1 p-0 my-0 list-none">
        <li className="md:w-1/2 p-1">
          <Repo loading={loading} repo={repos[0]} />
        </li>
        <li className="md:w-1/2 p-1">
          <Repo loading={loading} repo={repos[1]} />
        </li>
      </ul>
    </Fragment>
  )
}

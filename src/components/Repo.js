import React from 'react'
import Octicon, { Star, RepoForked } from '@primer/octicons-react'
import { string, number, bool, shape } from 'prop-types'

export default function Repo(props) {
  const { repo, loading } = props
  if (loading)
    return (
      <div className="p-6 border border-solid border-gray-200 rounded">
        <div className="flex flex-col h-full pulse">
          <div className="bg-gray-200 rounded-lg mb-2 h-4 w-1/2" />
          <div className="bg-gray-200 rounded-lg mb-2 h-3 w-full" />
          <div className="bg-gray-200 rounded-lg mb-2 h-3 w-1/3" />
          <div className="flex mt-2">
            <div className="bg-gray-200 rounded-lg mb-2 h-3 w-1/3" />
            <div className="bg-gray-200 rounded-lg mb-2 h-3 ml-3 w-1/5" />
            <div className="bg-gray-200 rounded-lg mb-2 h-3 ml-3 w-1/5" />
          </div>
        </div>
      </div>
    )

  if (!repo) return null

  return (
    <div className="h-full p-6 border border-solid border-gray-200 rounded">
      <div className="flex flex-col h-full">
        <a href={repo.url} className="text-blue-600">
          <h4 className="mt-0 mb-3" title={repo.name}>
            {repo.name}
          </h4>
        </a>

        <p className="text-sm mt-2 mb-3 text-gray-600">{repo.description}</p>

        <p className="mt-auto mb-0 text-xs text-gray-600">
          <span
            className="rounded-full inline-block relative h-2 w-2"
            style={{
              backgroundColor: repo.primaryLanguage
                ? repo.primaryLanguage.color
                : 'gray'
            }}
          />{' '}
          {repo.primaryLanguage ? repo.primaryLanguage.name : 'Code'}
          <a href={`${repo.url}/stargazers`} className="ml-3 text-gray-600">
            <Octicon icon={Star} className="mr-1" />
            {repo.stargazers.totalCount}
          </a>
          <a href={`${repo.url}/network`} className="ml-3 text-gray-600">
            <Octicon icon={RepoForked} className="mr-1" />
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
      name: string,
      color: string
    })
  })
}

import React, { Component, Fragment } from 'react'
import Repo from './Repo'

export default class ReposList extends Component {
  constructor(props) {
    super(props)
    this.state = { loading: true, repos: [] }
    this.getRepos = this.getRepos.bind(this)
  }

  componentDidMount() {
    this.getRepos().then(repos => {
      this.setState({
        loading: false,
        repos
      })
    })
  }

  getRepos() {
    return window.fetch('/.netlify/functions/get-repos').then(res => res.json())
  }

  render() {
    const { repos, loading } = this.state

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
}

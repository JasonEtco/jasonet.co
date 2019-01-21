import React from 'react'
import Layout from '../components/Layout'

export default class NotFoundPage extends React.Component {
  render() {
    return (
      <Layout>
        <h1>Not Found</h1>
        <p>This page doesn't exist. Oh no!</p>
      </Layout>
    )
  }
}

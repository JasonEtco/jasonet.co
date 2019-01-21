import React from 'react'
import { Link } from 'gatsby'
import { any } from 'prop-types'
import { rhythm, scale } from '../utils/typography'

export default class Layout extends React.Component {
  render() {
    const { children } = this.props

    return (
      <main>
        <div
          style={{
            marginLeft: 'auto',
            marginRight: 'auto',
            maxWidth: rhythm(28),
            padding: `${rhythm(1.5)} ${rhythm(1)}`,
          }}
        >
          <h3
            style={{
              ...scale(0.1),
              fontFamily: 'Inter UI, sans-serif',
              margin: 0,
            }}
          >
            <Link
              style={{
                boxShadow: 'none',
                textDecoration: 'none',
                color: '#f26d21',
              }}
              to={'/'}
            >
              ← Back
            </Link>
          </h3>
          {children}
        </div>
      </main>
    )
  }
}

Layout.propTypes = {
  children: any.isRequired,
}

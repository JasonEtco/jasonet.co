import React from 'react'
import { Link } from 'gatsby'

import { rhythm, scale } from '../utils/typography'

class Layout extends React.Component {
  render() {
    const { children } = this.props

    return (
      <main>
        <div
          style={{
            marginLeft: 'auto',
            marginRight: 'auto',
            maxWidth: rhythm(24),
            padding: `${rhythm(1.5)} 0`,
          }}
        >
          <h3
            style={{
              ...scale(0.1),
              fontFamily: 'Inter UI, sans-serif',
              margin: 0
            }}
          >
            <Link
              style={{
                boxShadow: 'none',
                textDecoration: 'none',
                color: '#f87000',
              }}
              to={'/'}
            >
              ← Code as words
            </Link>
          </h3>
          {children}
        </div>
      </main>
    )
  }
}

export default Layout

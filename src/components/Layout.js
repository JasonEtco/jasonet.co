import React from 'react'
import { Link } from 'gatsby'
import { any } from 'prop-types'

export default function Layout(props) {
  const { children } = props

  return (
    <main>
      <div className="mx-auto px-3 md:px-8 py-3 max-w-3xl">
        <Link className="text-orange" to="/">
          ← Back
        </Link>
        {children}
      </div>
    </main>
  )
}

Layout.propTypes = {
  children: any.isRequired
}

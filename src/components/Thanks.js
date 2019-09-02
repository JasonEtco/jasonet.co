import React from 'react'
import { arrayOf } from 'prop-types'
import t from '../utils/shared-props'
import { rhythm, colors, scale } from '../utils/typography'

function Person({ person }) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        width: '25%',
        marginBottom: rhythm(1)
      }}
    >
      <img
        src={person.avatar}
        width={32}
        height={32}
        style={{
          marginBottom: 0,
          borderRadius: '50%',
          marginRight: rhythm(0.5)
        }}
      />
      <a
        href={person.url}
        target="_blank"
        rel="noopener noreferrer"
        style={{ ...scale(-0.2), color: colors.gray[4] }}
      >
        {person.handle}
      </a>
    </div>
  )
}

Person.propTypes = {
  person: t.person
}

function Thanks({ people }) {
  // No people to thank!
  if (!people || !people.length) return

  return (
    <div
      style={{
        borderRadius: 3,
        borderWidth: 1,
        borderStyle: 'solid',
        borderColor: colors.gray[2],
        padding: `${rhythm(1.2)} ${rhythm(1.2)} 0`
      }}
    >
      <h4 style={{ marginTop: 0, marginBottom: rhythm(1) }}>
        Thank you for giving feedback on this post ❤️
      </h4>

      <div style={{ display: 'flex', flexWrap: 'wrap' }}>
        {people.map(person => (
          <Person key={person.handle} person={person} />
        ))}
      </div>
    </div>
  )
}

Thanks.propTypes = {
  people: arrayOf(t.person)
}

export default Thanks

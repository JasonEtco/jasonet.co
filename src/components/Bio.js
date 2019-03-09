import React from 'react'

// Import typefaces
import 'inter-ui'

import profilePic from './profile-pic.png'
import { rhythm } from '../utils/typography'

export default function Bio() {
  return (
    <div
      itemScope
      itemType="http://schema.org/Person"
      className="bio"
      style={{ display: 'flex' }}
    >
      <img
        src={profilePic}
        alt={`Jason Etcovitch`}
        style={{
          marginRight: rhythm(1 / 2),
          marginBottom: 0,
          width: rhythm(2.8),
          height: rhythm(2.8)
        }}
      />
      <p style={{ marginBottom: 0 }}>
        👋 Personal blog by{' '}
        <a href="https://twitter.com/JasonEtco">
          <span itemProp="name">Jason Etcovitch</span>
        </a>
        <br />
        🐙 <span itemProp="jobTitle">Engineer</span> at{' '}
        <a href="https://github.com/JasonEtco">GitHub</a>
        <br />
        🐦 Follow me on{' '}
        <a href="https://twitter.com/JasonEtco" itemProp="url">
          Twitter
        </a>
      </p>
    </div>
  )
}

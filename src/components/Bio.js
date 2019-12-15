import React from 'react'

// Import typefaces
import 'inter-ui'

import profilePic from './profile-pic.png'

export default function Bio() {
  return (
    <div
      itemScope
      itemProp="author"
      itemType="http://schema.org/Person"
      className="block md:flex"
    >
      <img src={profilePic} alt="Jason Etcovitch" className="mr-6 w-16 h-16" />
      <p className="m-0">
        👋 Personal blog by{' '}
        <a href="https://twitter.com/JasonEtco" itemProp="name">
          Jason Etcovitch
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

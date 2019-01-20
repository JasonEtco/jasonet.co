import React from 'react'

// Import typefaces
import 'inter-ui'

import profilePic from './profile-pic.png'
import { rhythm } from '../utils/typography'

class Bio extends React.Component {
  render() {
    return (
      <div
        className="bio"
        style={{
          display: 'flex',
        }}
      >
        <img
          src={profilePic}
          alt={`Jason Etcovitch`}
          style={{
            marginRight: rhythm(1 / 2),
            marginBottom: 0,
            width: rhythm(2.8),
            height: rhythm(2.8),
          }}
        />
        <p style={{ marginBottom: 0 }}>
          👋 Personal blog by <a href="https://twitter.com/JasonEtco">Jason Etcovitch</a><br />
          🐙 Engineer at <a href="https://github.com/JasonEtco">GitHub</a><br />
          🐦 Follow me on <a href="https://twitter.com/JasonEtco">Twitter</a>
        </p>
      </div>
    )
  }
}

export default Bio

import React from 'react'
import PropTypes from 'prop-types'

function StructuredData({ data }) {
  data['@context'] = 'http://schema.org/'
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  )
}

StructuredData.propTypes = {
  data: PropTypes.object
}

export default StructuredData

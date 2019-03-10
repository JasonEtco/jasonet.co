import React from 'react'
import PropTypes from 'prop-types'

function StructuredData({ data }) {
  data['@context'] = 'http://schema.org/'
  return <script type="application/ld+json">{JSON.stringify(data)}</script>
}

StructuredData.propTypes = {
  data: PropTypes.object
}

export default StructuredData

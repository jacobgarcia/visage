import React from 'react'
import PropTypes from 'prop-types'

import './styles.pcss'

function UsageBar(props) {
  return (
    <div className="usage-bar">
      {props.percentage !== undefined && (
        <div
          className="usage-indicactor"
          style={{left: `${props.percentage * 0.942}%`}}
        />
      )}
    </div>
  )
}

UsageBar.propTypes = {}

export default UsageBar

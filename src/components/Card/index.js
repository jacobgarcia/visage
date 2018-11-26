import React from 'react'
import PropTypes from 'prop-types'

function Card(props) {
  return (
    <div className="card-container">
      <div className={`card ${props.noPadding ? '--no-padding' : ''}`}>
        {props.children}
      </div>
    </div>
  )
}

Card.propTypes = {}

export default Card

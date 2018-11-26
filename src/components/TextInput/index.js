import React from 'react'
import PropTypes from 'prop-types'

import './styles.pcss'

function TextInput(props) {
  return (
    <div className="input-container">
      <label htmlFor={props.name}>{props.label}</label>
      <input
        id={props.name}
        name={props.name}
        type="text"
        placeholder={props.label}
      />
    </div>
  )
}

TextInput.propTypes = {}

export default TextInput

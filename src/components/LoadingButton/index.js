import React from 'react'
import PropTypes from 'prop-types'

import CircularProgress from '@material-ui/core/CircularProgress'

const setClass = (Component) => () => (
  <Component className="circular-progress--button" />
)

function LoadingButton(props) {
  return (
    <div className="circular-progress__container">
      <CircularProgress
        size={48}
        color="primary"
        className="circular-progress"
      />
      {setClass(props.component)}
    </div>
  )
}

LoadingButton.propTypes = {}

export default LoadingButton

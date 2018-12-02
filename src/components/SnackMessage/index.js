import React from 'react'
import PropTypes from 'prop-types'
import Snackbar from '@material-ui/core/Snackbar'

function ReactSnack(props) {
  return (
    <div className="snack-message">
      <Snackbar
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'center',
        }}
        open={props.open}
        autoHideDuration={3000}
        onClose={props.onClose}
        ContentProps={{
          'aria-describedby': 'message-id',
        }}
        message={<span id="message-id">{props.message}</span>}
        action={[]}
      />
    </div>
  )
}

ReactSnack.propTypes = {}

export default ReactSnack

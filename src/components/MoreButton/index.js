import React from 'react'
import Menu from '@material-ui/core/Menu'
import MenuItem from '@material-ui/core/MenuItem'
import MoreVertIcon from '@material-ui/icons/MoreVert'
import IconButton from '@material-ui/core/IconButton'
import PropTypes from 'prop-types'

function MoreButton(props) {
  console.log(props)
  function action(action) {
    return () => {
      console.log('CLICK', { DATA: props.data })
      props.handleClose()
      props.onAction(action, props.data)
    }
  }

  const { anchorEl, isActive } = props

  return (
    <div style={{ display: 'inline-block' }}>
      {JSON.stringify(props.data)}
      <IconButton
        aria-owns={anchorEl ? 'simple-menu' : null}
        aria-haspopup="true"
        onClick={props.handleClick}
      >
        <MoreVertIcon />
      </IconButton>
      <Menu
        id="simple-menu"
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={props.handleClose}
      >
        <MenuItem onClick={action('EDIT')}>Editar</MenuItem>
        <MenuItem onClick={action('DELETE')}>Eliminar</MenuItem>
        <MenuItem onClick={action(isActive ? 'DEACTIVATE' : 'ACTIVATE')}>
          {isActive ? 'Desactivar' : 'Activar'}
        </MenuItem>
      </Menu>
    </div>
  )
}

MoreButton.propTypes = {
  anchorEl: PropTypes.object,
  onAction: PropTypes.function,
}

export default MoreButton

import React from 'react'
import Menu from '@material-ui/core/Menu'
import MenuItem from '@material-ui/core/MenuItem'
import MoreVertIcon from '@material-ui/icons/MoreVert'
import IconButton from '@material-ui/core/IconButton'
import PropTypes from 'prop-types'

function MoreButton(props) {
  const { anchorEl, isActive } = props

  return (
    <div style={{ display: 'inline-block' }}>
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
        <MenuItem onClick={props.handleClose}>Editar</MenuItem>
        <MenuItem onClick={props.handleClose}>
          {isActive ? 'Desactivar' : 'Reactivar'}
        </MenuItem>
        <MenuItem onClick={props.handleClose}>Eliminar</MenuItem>
      </Menu>
    </div>
  )
}

MoreButton.propTypes = {
  anchorEl: PropTypes.object,
  isActive: PropTypes.bool,
}

MoreButton.defaultProps = {
  isActive: false,
}

export default MoreButton

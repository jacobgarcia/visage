import React from 'react'
import Menu from '@material-ui/core/Menu'
import MenuItem from '@material-ui/core/MenuItem'
import MoreVertIcon from '@material-ui/icons/MoreVert'
import IconButton from '@material-ui/core/IconButton'
import PropTypes from 'prop-types'

function MoreButton(props) {
  const { anchorEl, isActive, user } = props

  return (
    <div style={{ display: 'inline-block' }}>
      <IconButton
        aria-owns={anchorEl ? 'simple-menu' : null}
        aria-haspopup="true"
        onClick={(e) => props.handleClick(e, user)}
      >
        <MoreVertIcon />
      </IconButton>
      <Menu
        id="simple-menu"
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={props.handleClose}
      >
        <MenuItem
          onClick={() => {
            props.onEdit()
            props.handleClose()
          }}
        >
          Editar
        </MenuItem>
        <MenuItem
          onClick={() => {
            props.onToggleActive(isActive)
            props.handleClose()
          }}
        >
          {isActive ? 'Desactivar' : 'Reactivar'}
        </MenuItem>
        <MenuItem
          onClick={() => {
            props.onDelete()
            props.handleClose()
          }}
        >
          Eliminar
        </MenuItem>
      </Menu>
    </div>
  )
}

MoreButton.propTypes = {
  anchorEl: PropTypes.object,
  isActive: PropTypes.bool,
  user: PropTypes.object,
}

MoreButton.defaultProps = {
  isActive: false,
  user: '',
  onToggleActive: () => {},
}

export default MoreButton

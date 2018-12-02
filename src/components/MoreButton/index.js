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
        id={Date.now()}
        aria-owns={anchorEl ? 'simple-menu' : null}
        aria-haspopup="true"
        onClick={(evt) => props.handleClick(evt, user)}
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
        {!user.services && (
          <MenuItem
            onClick={() => {
              props.onToggleActive(isActive)
              props.handleClose()
            }}
          >
            {isActive ? 'Desactivar' : 'Reactivar'}
          </MenuItem>
        )}
        <MenuItem
          onClick={() => {
            props.onDelete(props.user)
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
  handleClose: PropTypes.function,
  isActive: PropTypes.bool,
  onDelete: PropTypes.onDelete,
  onEdit: PropTypes.onEdit,
  onToggleActive: PropTypes.function,
  user: PropTypes.string,
}

MoreButton.defaultProps = {
  onEdit: () => {},
  isActive: false,
  user: '',
  onToggleActive: () => {},
}

export default MoreButton

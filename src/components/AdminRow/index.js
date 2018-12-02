import React, { Component } from 'react'
import PropTypes from 'prop-types'

import TableRow from '@material-ui/core/TableRow'
import TableCell from '@material-ui/core/TableCell'
import Button from '@material-ui/core/Button'
import MoreButton from 'components/MoreButton'

class AdminRow extends Component {
  static propTypes = {}

  state = {
    anchorEl: null,
    selectedUser: null,
  }

  handleClose = () => this.setState({ anchorEl: null })

  handleClick = (evt, user) =>
    this.setState({
      anchorEl: evt.currentTarget,
      selectedUser: user,
    })

  render() {
    const {
      props,
      state: { anchorEl },
    } = this

    const isSuperAdmin =
      props.services.admins === 2 &&
      props.services.clients === 2 &&
      props.services.dashboard &&
      props.services.rates

    return (
      <TableRow key={props._id}>
        <TableCell component="th" scope="props">
          {props.name}
        </TableCell>
        <TableCell>{props.username}</TableCell>
        <TableCell>{props.email}</TableCell>
        <TableCell>
          <Button variant="outlined" disabled>
            {isSuperAdmin ? 'SUPERADMIN' : 'ADMIN'}
          </Button>
        </TableCell>
        <TableCell numeric>
          <MoreButton
            user={props}
            anchorEl={anchorEl}
            onDelete={props.onDelete}
            onEdit={() => {
              props.onToggleEditModal(props.admin)
            }}
            handleClick={this.handleClick}
            handleClose={this.handleClose}
          />
        </TableCell>
      </TableRow>
    )
  }
}

export default AdminRow

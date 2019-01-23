import React, { Component, Fragment } from 'react'
import PropTypes from 'prop-types'

import TableRow from '@material-ui/core/TableRow'
import TableCell from '@material-ui/core/TableCell'
import IconButton from '@material-ui/core/IconButton'
import Button from '@material-ui/core/Button'
import CircularProgress from '@material-ui/core/CircularProgress'

import BlockIcon from '@material-ui/icons/Block'
import RefreshIcon from '@material-ui/icons/Refresh'
import KeyIcon from '@material-ui/icons/VpnKey'

import SnackMessage from 'components/SnackMessage'
import MoreButton from 'components/MoreButton'
import NetworkOperation from 'utils/NetworkOperation'

class ClientRow extends Component {
  static propTypes = {}

  state = {
    guests: [],
  }

  revokeKey = async () => {
    this.setState({ revokeKeyLoading: true })
    try {
      await NetworkOperation.getGests(this.props.client.username)

      this.setState({ message: 'Llave revocada' })
    } catch (error) {
      console.error(error)
      this.setState({ message: 'Error al revocar llave' })
    } finally {
      this.setState({ revokeKeyLoading: false })
      this.props.reloadData()
    }
  }

  render() {
    const {
      props,
    } = this
    return (
      <Fragment>
        <TableRow
          key={props.guests._id}
          className={`user-row ${props.client.active ? 'active' : 'deactive'}`}
        >
          <TableCell component="th" scope="item" className="user-row__body">
            {props.guest.email}
          </TableCell>
          {props.canEdit && (
            <TableCell numeric>
            </TableCell>
          )}
        </TableRow>
      </Fragment>
    )
  }
}

ClientRow.propTypes = {
  client: PropTypes.object,
  reloadData: PropTypes.func,
}

export default ClientRow

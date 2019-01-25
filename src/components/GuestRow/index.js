import React, { Component, Fragment } from 'react'
import PropTypes from 'prop-types'

import TableRow from '@material-ui/core/TableRow'
import TableCell from '@material-ui/core/TableCell'
import IconButton from '@material-ui/core/IconButton'
import Button from '@material-ui/core/Button'
import CircularProgress from '@material-ui/core/CircularProgress'

import BlockIcon from '@material-ui/icons/Block'
import RefreshIcon from '@material-ui/icons/Refresh'
import EmailIcon from '@material-ui/icons/Email'
import DeleteForever from '@material-ui/icons/DeleteForever'

import SnackMessage from 'components/SnackMessage'
import MoreButton from 'components/MoreButton'
import NetworkOperation from 'utils/NetworkOperation'

class GuestRow extends Component {
  static propTypes = {}

  state = {
    guests: [],
    sendingInvitation: false,
    deletingInvitation: false,
  }

  resentInvitation = async () => {
    this.setState({ sendingInvitation: true })
    try {
      await NetworkOperation.inviteUser(this.props.guest.email)

      this.setState({ message: 'Invitación Reenviada' })
    } catch (error) {
      console.error(error)
      this.setState({ message: 'Error al enviar Invitación' })
    } finally {
      this.setState({ sendingInvitation: false })
      this.props.reloadData()
    }
  }

  deletingInvitation = async () => {
    this.setState({ deletingInvitation: true })
    try {
      await NetworkOperation.deleteGuest(this.props.guest.email)

      this.setState({ message: 'Invitación Eliminada' })
    } catch (error) {
      console.error(error)
      this.setState({ message: 'Error al eliminar Invitación' })
    } finally {
      this.setState({ deletingInvitation: false })
      this.props.reloadData()
    }
  }

  onCloseSnack = () => this.setState({ message: null })

  render() {
    const {
      props,
      state: { sendingInvitation, deletingInvitation, message },
    } = this
    return (
      <Fragment>
        <SnackMessage
          open={message}
          message={message}
          onClose={this.onCloseSnack}
        />
        <TableRow key={props.guest._id} className={'guest-row'}>
          <TableCell component="th" scope="item" className="user-row__body">
            {props.guest.email}
          </TableCell>
          <TableCell>
            <IconButton>
              <div className="circular-progress__container">
                {sendingInvitation && (
                  <CircularProgress
                    size={48}
                    color="primary"
                    className="circular-progress"
                  />
                )}
                <EmailIcon
                  onClick={this.resentInvitation}
                  className="circular-progress--button"
                />
              </div>
            </IconButton>
          </TableCell>
          <TableCell>
            <IconButton>
              <div className="circular-progress__container">
                {deletingInvitation && (
                  <CircularProgress
                    size={48}
                    color="primary"
                    className="circular-progress"
                  />
                )}
                <DeleteForever
                  onClick={this.deletingInvitation}
                  className="circular-progress--button"
                />
              </div>
            </IconButton>
          </TableCell>
        </TableRow>
      </Fragment>
    )
  }
}

GuestRow.propTypes = {
  guest: PropTypes.object,
  reloadData: PropTypes.func,
}

export default GuestRow

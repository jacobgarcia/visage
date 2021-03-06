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
    anchorEl: null,
    generateKeyLoading: false,
    revokeKeyLoading: false,
    renewKeyLoading: false,
    loadingDelte: false,
    toggleActiveLoading: false,
    isIndexing: this.props.client.isIndexing,
  }

  revokeKey = async () => {
    this.setState({ revokeKeyLoading: true })
    try {
      await NetworkOperation.revokeAPIKey(this.props.client.username)

      this.setState({ message: 'Llave revocada' })
    } catch (error) {
      console.error(error)
      this.setState({ message: 'Error al revocar llave' })
    } finally {
      this.setState({ revokeKeyLoading: false })
      this.props.reloadData()
    }
  }

  renewAPIKey = async () => {
    this.setState({ renewKeyLoading: true })
    try {
      await NetworkOperation.generateAPIKey(this.props.client.username)

      this.setState({ message: 'Llave regenerada' })
    } catch (error) {
      console.error({ error })
      this.setState({ message: 'Error al regenerar llave' })
    } finally {
      this.setState({ renewKeyLoading: false })
      this.props.reloadData()
    }
  }

  generateKey = async () => {
    this.setState({ generateKeyLoading: true })
    try {
      await NetworkOperation.generateAPIKey(this.props.client.username)

      this.setState({ message: 'Llaves generadas' })
    } catch (error) {
      console.error(error)
      this.setState({ message: 'Error al generar llaves' })
    } finally {
      this.setState({ generateKeyLoading: false })
      this.props.reloadData()
    }
  }

  onToggleActive = async (isActive) => {
    this.setState({ toggleActiveLoading: true })

    try {
      isActive
        ? await NetworkOperation.deactivateUser(this.props.client.username)
        : await NetworkOperation.reactivateUser(this.props.client.username)
      this.setState({
        message: `Usuario ${isActive ? 'desactivado' : 'activado'} con éxito`,
      })
    } catch (error) {
      console.error(error)
      this.setState({ message: 'Error al desactivar usuario' })
    } finally {
      this.setState({ toggleActiveLoading: false })
      this.props.reloadData()
    }
  }

  onDelete = async () => {
    this.setState({ loadingDelte: true })

    if (
      window.confirm(
        `Estas seguro de borrar al usuario ${this.props.client.username}`
      )
    ) {
      try {
        await NetworkOperation.deleteUser(this.props.client.username)
        this.setState({ message: 'Usuario eliminado' })
      } catch (error) {
        console.error(error)
        this.setState({ message: 'Error al eliminar usuario' })
      } finally {
        this.setState({ loadingDelete: false })
        this.props.reloadData()
      }
    }
  }

  onIndex = async () => {
    try {
      this.setState({ isIndexing: true })
      await NetworkOperation.indexImages(this.props.client.username)
      this.setState({ message: 'Imágenes indexandose' })
    } catch (error) {
      console.error(error)
      this.setState({ message: 'Error al indexar imágenes' })
    } finally {
      this.props.reloadData()
    }
  }

  onCloseSnack = () => this.setState({ message: null })

  handleClose = () => this.setState({ anchorEl: null })
  handleClick = (event) => this.setState({ anchorEl: event.currentTarget })

  render() {
    const {
      props,
      state: {
        anchorEl,
        generateKeyLoading,
        revokeKeyLoading,
        renewKeyLoading,
        message,
        isIndexing,
      },
    } = this
    let label
    if (isIndexing) {
      label = 'INDEXANDO'
    } else if (props.client.toIndex.length > 0) {
      label = 'INDEXAR'
    } else {
      label = 'INDEXADO'
    }
    return (
      <Fragment>
        <SnackMessage
          open={message}
          message={message}
          onClose={this.onCloseSnack}
        />
        <TableRow
          key={props.client._id}
          className={`user-row ${props.client.active ? 'active' : 'deactive'}`}
        >
          <TableCell component="th" scope="item" className="user-row__body">
            {props.client.name}
          </TableCell>
          <TableCell className="user-row__body">
            {props.client.company}
          </TableCell>
          <TableCell className="user-row__body">{props.client.email}</TableCell>
          <TableCell>
            <Button
              variant="outlined"
              disabled={isIndexing ? true : !(props.client.toIndex.length > 0)}
              onClick={this.onIndex}
            >
              {label}
            </Button>
          </TableCell>
          <TableCell>
            {props.client.apiKey ? (
              !props.client.apiKey.active && (
                <IconButton>
                  <div className="circular-progress__container">
                    {generateKeyLoading && (
                      <CircularProgress
                        size={48}
                        color="primary"
                        className="circular-progress"
                      />
                    )}
                    <KeyIcon
                      onClick={this.generateKey}
                      className="circular-progress--button"
                    />
                  </div>
                </IconButton>
              )
            ) : (
              <IconButton>
                <div className="circular-progress__container">
                  {generateKeyLoading && (
                    <CircularProgress
                      size={48}
                      color="primary"
                      className="circular-progress"
                    />
                  )}
                  <KeyIcon
                    onClick={this.generateKey}
                    className="circular-progress--button"
                  />
                </div>
              </IconButton>
            )}
            {props.client.apiKey
              ? props.client.apiKey.active && (
                  <IconButton>
                    <div className="circular-progress__container">
                      {renewKeyLoading && (
                        <CircularProgress
                          size={48}
                          color="primary"
                          className="circular-progress"
                        />
                      )}
                      <RefreshIcon
                        onClick={this.renewAPIKey}
                        className="circular-progress--button"
                      />
                    </div>
                  </IconButton>
                )
              : ''}
            {props.client.apiKey
              ? props.client.apiKey.active && (
                  <IconButton>
                    <div className="circular-progress__container">
                      {revokeKeyLoading && (
                        <CircularProgress
                          size={48}
                          color="primary"
                          className="circular-progress"
                        />
                      )}
                      <BlockIcon
                        onClick={this.revokeKey}
                        className="circular-progress--button"
                      />
                    </div>
                  </IconButton>
                )
              : ''}
          </TableCell>
          {props.canEdit && (
            <TableCell numeric>
              <MoreButton
                isActive={props.client.active}
                anchorEl={anchorEl}
                onToggleActive={this.onToggleActive}
                onDelete={this.onDelete}
                handleClick={this.handleClick}
                handleClose={this.handleClose}
                onEdit={() => props.onSelectClient(props.client)}
              />
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

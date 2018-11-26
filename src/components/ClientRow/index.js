import React, { Component } from 'react'
import PropTypes from 'prop-types'

import TableRow from '@material-ui/core/TableRow'
import TableCell from '@material-ui/core/TableCell'
import IconButton from '@material-ui/core/IconButton'
import Button from '@material-ui/core/Button'
import CircularProgress from '@material-ui/core/CircularProgress'

import BlockIcon from '@material-ui/icons/Block'
import RefreshIcon from '@material-ui/icons/Refresh'
import KeyIcon from '@material-ui/icons/VpnKey'

import LoadingButton from 'components/LoadingButton'
import MoreButton from 'components/MoreButton'
import NetworkOperation from 'utils/NetworkOperation'

class ClientRow extends Component {
  static propTypes = {

  }

  state = {
    anchorEl: null,
    generateKeyLoading: false,
    revokeKeyLoading: false,
    renewKeyLoading: false,
    loadingDelte: false,
    toggleActiveLoading: false
  }

  revokeKey = async () => {
    this.setState({ revokeKeyLoading: true })
    try {
      const response = await NetworkOperation.revokeAPIKey(this.props.client.username)
      console.log({response})
    } catch(error) {
      console.log({ error })
    } finally {
      this.setState({ revokeKeyLoading: false })
    }
  }

  renewAPIKey = async () => {
    this.setState({ renewKeyLoading: true })
    try {
      const response = await NetworkOperation.generateAPIKey(this.props.client.username)
      console.log({response})
    } catch(error) {
      console.log({ error })
    } finally {
      this.setState({ renewKeyLoading: false })
    }
  }

  generateKey = async () => {
    this.setState({ generateKeyLoading: true })
    try {
      const response = await NetworkOperation.generateAPIKey(this.props.client.username)
      console.log({response})
    } catch(error) {
      console.error(error)
    } finally {
      this.setState({ generateKeyLoading: false })
    }
  }

  onToggleActive = async (isActive) => {
    this.setState({ toggleActiveLoading: true })

    try {
      const response = isActive ? await NetworkOperation.deactivateUser(this.props.client.username) : await NetworkOperation.reactivateUser(this.props.client.username)
      console.log(response)
    } catch (error) {
      console.error(error)
    } finally {
      this.setState({ toggleActiveLoading: false })
    }
  }

  onDelete = async () => {
    this.setState({ loadingDelte: true })

    try {
      const response = await NetworkOperation.deleteUser(this.props.client.username)
      console.log(response)
    } catch (error) {
      console.error(error)
    } finally {
      this.setState({ loadingDelte: false })
    }
  }

  handleClose = () => this.setState({ anchorEl: null })
  handleClick = (event) => this.setState({ anchorEl: event.currentTarget })

  render() {
    const { props, state: { anchorEl, generateKeyLoading, revokeKeyLoading, renewKeyLoading } } = this

    return (
      <TableRow
        key={props.client._id}
        className={`user-row ${
          props.client.active ? 'active' : 'deactive'
        }`}
      >
        <TableCell
          component="th"
          scope="item"
          className="user-row__body"
        >
          {props.client.name} {props.client.surname}
        </TableCell>
        <TableCell className="user-row__body">
          {props.client.company}
        </TableCell>
        <TableCell className="user-row__body">
          {props.client.email}
        </TableCell>
        <TableCell>
          <Button variant="outlined" disabled={!props.client.isIndexing}>
            {props.client.isIndexing ? 'INDEXANDO' : 'INDEXADO'}
          </Button>
        </TableCell>
        <TableCell>
          <IconButton>
            <div className="circular-progress__container">
              {generateKeyLoading && <CircularProgress
                size={48}
                color="primary"
                className="circular-progress"
              />}
              <KeyIcon onClick={this.generateKey} className="circular-progress--button" />
            </div>
          </IconButton>
          <IconButton>
            <div className="circular-progress__container">
              {renewKeyLoading && <CircularProgress
                size={48}
                color="primary"
                className="circular-progress"
              />}
              <RefreshIcon onClick={this.renewAPIKey} className="circular-progress--button" />
            </div>
          </IconButton>
          <IconButton>
            <div className="circular-progress__container">
              {revokeKeyLoading && <CircularProgress
                size={48}
                color="primary"
                className="circular-progress"
              />}
              <BlockIcon onClick={this.revokeKey} className="circular-progress--button" />
            </div>
          </IconButton>
        </TableCell>
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
      </TableRow>
    )
  }
}

export default ClientRow

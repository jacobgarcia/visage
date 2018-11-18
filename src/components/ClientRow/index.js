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
  }

  revokeKey = async () => {
    this.setState({ revokeKeyLoading: true })
    try {
      const response = await NetworkOperation.revokeAPIKey(this.props.username)
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
      const response = await NetworkOperation.generateAPIKey(this.props.username)
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
      const response = await NetworkOperation.generateAPIKey(this.props.username)
      console.log({response})
    } catch(error) {
      console.log({ error })
    } finally {
      this.setState({ generateKeyLoading: false })
    }
  }

  handleClose = () => this.setState({ anchorEl: null })
  handleClick = (event) => this.setState({ anchorEl: event.currentTarget })

  render() {
    console.log({props})
    const { props, state: { anchorEl, generateKeyLoading, revokeKeyLoading, renewKeyLoading } } = this

    return (
      <TableRow
        key={props._id}
        className={`user-row ${
          props.active ? 'active' : 'deactive'
        }`}
      >
        <TableCell
          component="th"
          scope="item"
          className="user-row__body"
        >
          {props.name} {props.surname}
        </TableCell>
        <TableCell className="user-row__body">
          {props.company}
        </TableCell>
        <TableCell className="user-row__body">
          {props.email}
        </TableCell>
        <TableCell>
          <Button variant="outlined" disabled={!props.isIndexing}>
            {props.isIndexing ? 'INDEXANDO' : 'INDEXADO'}
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
          <IconButton />

        </TableCell>
        <TableCell number>
          <MoreButton
            anchorEl={anchorEl}
            handleClick={this.handleClick}
            handleClose={this.handleClose}
          />
</TableCell>
      </TableRow>
    )
  }
}

export default ClientRow

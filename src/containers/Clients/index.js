import React, { Component } from 'react'
import Table from '@material-ui/core/Table'
import TableBody from '@material-ui/core/TableBody'
import TableCell from '@material-ui/core/TableCell'
import TableHead from '@material-ui/core/TableHead'
import TableRow from '@material-ui/core/TableRow'
import Button from '@material-ui/core/Button'
import TextField from '@material-ui/core/TextField'
import IconButton from '@material-ui/core/IconButton'
import Modal from '@material-ui/core/Modal'
import Card from '@material-ui/core/Card'
import FormControlLabel from '@material-ui/core/FormControlLabel'
import Checkbox from '@material-ui/core/Checkbox'

import BlockIcon from '@material-ui/icons/Block'
import RefreshIcon from '@material-ui/icons/Refresh'
import KeyIcon from '@material-ui/icons/VpnKey'
import PropTypes from 'prop-types'

import MoreButton from 'components/MoreButton'
import NetworkOperation from 'utils/NetworkOperation'
import { withSaver } from 'utils/portals'

import './styles.pcss'

class Clients extends Component {
  static propTypes = {
    saving: PropTypes.any,
    stopSaving: PropTypes.any,
    toggle: PropTypes.any,
  }

  state = {
    search: '',
    rows: [],
    anchorEl: null,
    addUserModalOpen: false,
    admin: true,
  }

  async componentDidMount() {
    this.props.toggle(true)

    try {
      let users = await NetworkOperation.getUsers()
      users = users.data.users || []
      console.log({ users })
      this.setState({
        rows: users,
      })
    } catch (error) {
      console.log({ error })
    }
  }

  componentDidUpdate(prevProps) {
    if (this.props.saving && !prevProps.saving) {
      this.onSave()
    }
  }

  componentWillUnmount() {
    this.props.stopSaving(null)
  }

  onSave() {
    setTimeout(() => {
      this.props.stopSaving(true)
    }, 10000)
  }

  handleClose = () => this.setState({ anchorEl: null })

  handleClick = (event) => this.setState({ anchorEl: event.currentTarget })

  onAction = (action, client) => {
    console.log({action, client})
  }

  onAPIKeyAction = async (action, user) =>
     async () => {
       try {
      if (action === 'REVOKE') {
        console.log('REVOKE')
        const result = await NetworkOperation.revokeAPIKey(user.username)
        console.log({result})
      }
      if (action === 'RENEW') {
        console.log('RENEW')
        const result = await NetworkOperation.renewAPIKey(user.username)
      }
      if (action === 'GENERATE') {
        const result = await NetworkOperation.generateAPIKey(user.username)
      }} catch(error) {
        console.warn(error)
      } finally {
        console.log('STOP LOADING')
      }
    }


  render() {
    const {
      state: { search, rows, anchorEl, addUserModalOpen, admin, user = '' },
    } = this

    return (
      <div className="clients">

        <div className="actions">
          <TextField
            id="standard-name"
            label="Buscar"
            className="text-field"
            value={search}
            onChange={() => {}}
            margin="normal"
            variant="outlined"
          />
          <div className="buttons">
            <Button
              color="primary"
              className="button"

            >
              Añadir
            </Button>
            <Button color="primary" className="button">
              Exportar
            </Button>
          </div>
        </div>
        <Table className="table">
          <TableHead>
            <TableRow>
              <TableCell>Nombre</TableCell>
              <TableCell>Empresa</TableCell>
              <TableCell>Mail</TableCell>
              <TableCell>Indexación</TableCell>
              <TableCell>API Keys</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((item) => {
              return (
                <TableRow
                  key={item._id}
                  className={`user-row ${item.active ? 'active' : 'deactive'}`}
                >
                  <TableCell
                    component="th"
                    scope="item"
                    className="user-row__body"
                  >
                    {item.name} {item.surname}
                  </TableCell>
                  <TableCell className="user-row__body">
                    {item.company}
                  </TableCell>
                  <TableCell className="user-row__body">{item.email}</TableCell>
                  <TableCell>
                    <Button variant="outlined" disabled={!item.isIndexing}>
                      {item.isIndexing ? 'INDEXANDO' : 'INDEXADO'}
                    </Button>
                  </TableCell>
                  <TableCell>
                    <IconButton>
                      <KeyIcon  onClick={this.onAPIKeyAction('GENERATE', item)}  />
                    </IconButton>
                    <IconButton>
                      <RefreshIcon onClick={this.onAPIKeyAction('RENEW', item)}  />
                    </IconButton>
                    <IconButton>
                      <BlockIcon onClick={this.onAPIKeyAction('REVOKE', item)} />
                    </IconButton>
                    <MoreButton
                      onAction={(action) => this.onAction(action, item)}
                      isActive={item.active}
                      anchorEl={anchorEl}
                      handleClick={this.handleClick}
                      handleClose={this.handleClose}
                    />
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </div>
    )
  }
}

export default withSaver(Clients)
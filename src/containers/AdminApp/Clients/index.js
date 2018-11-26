import React, { Component } from 'react'
import Table from '@material-ui/core/Table'
import TableBody from '@material-ui/core/TableBody'
import TableCell from '@material-ui/core/TableCell'
import TableHead from '@material-ui/core/TableHead'
import TableRow from '@material-ui/core/TableRow'
import Button from '@material-ui/core/Button'
import Card from '@material-ui/core/Card'
import TextField from '@material-ui/core/TextField'

import PropTypes from 'prop-types'

import ClientRow from 'components/ClientRow'
import ClientModal from 'components/ClientModal'
import NetworkOperation from 'utils/NetworkOperation'
import { withSaver } from 'utils/portals'

import './styles.pcss'

class Clients extends Component {
  static propTypes = {
    saving: PropTypes.any,
    toggle: PropTypes.any,
  }

  state = {
    search: '',
    rows: [],
    filteredRows: [],
    anchorEl: null,
    addUserModalOpen: false,
    admin: true,
    selectedClient: null,
  }

  componentDidMount() {
    this.props.toggle({ saveButton: false, dateFilter: false })

    this.reloadData()
  }

  reloadData = async () => {
    try {
      let users = await NetworkOperation.getUsers()
      users = users.data.users || []

      this.setState({ rows: users, filteredRows: users })
    } catch (error) {
      console.log({ error })
    }
  }

  handleClose = () => this.setState({ anchorEl: null })

  handleClick = (event) => this.setState({ anchorEl: event.currentTarget })

  toggleUserAddModal = (isOpen = null) => () =>
    this.setState(
      ({ prev }) => ({
        addUserModalOpen: isOpen !== null ? isOpen : !prev.addUserModalOpen,
      }),
      () =>
        this.setState(
          ({ addUserModalOpen, selectedClient }) =>
            addUserModalOpen === false && selectedClient
              ? { selectedClient: null }
              : null
        )
    )

  onSelectClient = (client) => {
    this.setState({ selectedClient: client, addUserModalOpen: true })
  }

  onChange = (name) => ({ target: { value } }) => {
    this.setState({ [name]: value }, () => {
      if (name === 'search') {
        this.setState((prevState) => ({
          filteredRows: prevState.search
            ? prevState.rows.filter(({ name }) =>
                String(name)
                  .toLowerCase()
                  .includes(String(prevState.search).toLowerCase())
              )
            : prevState.rows,
        }))
      }
    })
  }

  render() {
    const {
      state: { search, filteredRows, addUserModalOpen, selectedClient },
    } = this

    return (
      <div className="clients">
        <ClientModal
          selectedClient={selectedClient}
          toggleUserAddModal={this.toggleUserAddModal}
          addUserModalOpen={addUserModalOpen}
        />
        <div className="actions">
          <TextField
            id="standard-name"
            label="Buscar"
            className="text-field"
            value={search}
            onChange={this.onChange('search')}
            margin="normal"
          />
          <div className="buttons">
            <Button
              color="primary"
              className="button"
              onClick={this.toggleUserAddModal(true)}
            >
              Nuevo
            </Button>
            <Button color="secondary" className="button" variant="contained">
              Exportar
            </Button>
          </div>
        </div>
        <Card>
          <Table className="table">
            <TableHead>
              <TableRow>
                <TableCell>Nombre</TableCell>
                <TableCell>Empresa</TableCell>
                <TableCell>Mail</TableCell>
                <TableCell>Indexación</TableCell>
                <TableCell>API Keys</TableCell>
                <TableCell numeric />
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredRows.map((item) => (
                <ClientRow
                  client={item}
                  reloadData={this.reloadData}
                  selectedClient={selectedClient}
                  onSelectClient={this.onSelectClient}
                  key={item._id}
                />
              ))}
            </TableBody>
          </Table>
        </Card>
      </div>
    )
  }
}

export default withSaver(Clients)

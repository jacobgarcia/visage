import React, { Component } from 'react'
import Table from '@material-ui/core/Table'
import TableBody from '@material-ui/core/TableBody'
import TableCell from '@material-ui/core/TableCell'
import TableHead from '@material-ui/core/TableHead'
import TableRow from '@material-ui/core/TableRow'
import Button from '@material-ui/core/Button'
import TextField from '@material-ui/core/TextField'
import Card from '@material-ui/core/Card'

import PropTypes from 'prop-types'

import SnackMessage from 'components/SnackMessage'
import NetworkOperation from 'utils/NetworkOperation'
import { withSaver } from 'utils/portals'
import EditAdminModal from 'components/EditAdminModal'
import AdminRow from 'components/AdminRow'

import './styles.pcss'

class Admins extends Component {
  static propTypes = {
    toggle: PropTypes.function,
  }

  state = {
    anchorEl: null,
    search: '',
    rows: [],
    filteredRows: [],
    openAdmin: false,
    isSaving: false,
    selectedUser: null,
    message: null,
  }

  componentDidMount() {
    this.props.toggle({ saveButton: false, dateFilter: false })

    this.reloadData()
  }

  onDelete = async ({ username }) => {
    try {
      await NetworkOperation.deleteAdmin(username)
      this.setState({ message: 'Administrador eliminado con éxito' })
    } catch (error) {
      console.error(error)
      this.setState({ message: 'Error al eliminar administrador' })
    } finally {
      this.reloadData()
    }
  }

  reloadData = async () => {
    try {
      const response = await NetworkOperation.getAdmins()
      const admins = response.data.admins || []

      this.setState({ rows: admins, filteredRows: admins })
    } catch (error) {
      console.error(error)
    }
  }

  onChange = (name) => ({ target: { value } }) => {
    this.setState({ [name]: value }, () => {
      if (name === 'search') {
        this.setState((prevState) => ({
          filteredRows: prevState.search
            ? prevState.rows.filter(
                ({ name, username, email }) =>
                  String(name)
                    .toLowerCase()
                    .includes(String(prevState.search).toLowerCase()) ||
                  String(username)
                    .toLowerCase()
                    .includes(String(prevState.search).toLowerCase()) ||
                  String(email)
                    .toLowerCase()
                    .includes(String(prevState.search).toLowerCase())
              )
            : prevState.rows,
        }))
      }
    })
  }

  onToggleEditModal = (item) => {
    const newState = {}
    if (item) newState.selectedUser = item
    this.setState(({ openAdmin }) => ({ openAdmin: !openAdmin, ...newState }))
  }

  onCloseSnack = () => this.setState({ message: null })

  onSaveAdmin = async (newAdmin, oldUsername) => {
    const { _id: newAdminId, ...data } = newAdmin

    try {
      console.log({ data })
      if (newAdminId) {
        await NetworkOperation.updateAdmin(data, oldUsername)
        this.setState({ message: 'Usuario actualizado con éxito' })
      } else {
        await NetworkOperation.createAdmin(data)
        this.setState({ message: 'Usuario creado con éxito' })
      }

      this.reloadData()
    } catch (error) {
      this.setState({ message: 'Error al crear/actualizar usuario' })
      console.error(error)
    }
  }

  render() {
    const {
      state: {
        search,
        filteredRows,
        openAdmin,
        isSaving,
        selectedUser,
        message,
      },
    } = this

    return (
      <div className="admins">
        <SnackMessage
          open={message}
          message={message}
          onClose={this.onCloseSnack}
        />
        <EditAdminModal
          user={selectedUser}
          loading={isSaving}
          onClose={this.onToggleEditModal}
          open={openAdmin}
          onSave={this.onSaveAdmin}
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
              onClick={this.onToggleEditModal}
              color="primary"
              className="button"
            >
              Añadir
            </Button>
            <Button color="primary" className="button" variant="contained">
              Exportar
            </Button>
          </div>
        </div>
        <Card>
          <Table className="table">
            <TableHead>
              <TableRow>
                <TableCell>Nombre</TableCell>
                <TableCell>Username</TableCell>
                <TableCell>Mail</TableCell>
                <TableCell>Rol</TableCell>
                <TableCell numeric />
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredRows.map((item) => {
                return (
                  <AdminRow
                    {...item}
                    admin={item}
                    key={item._id}
                    onDelete={this.onDelete}
                    onToggleEditModal={this.onToggleEditModal}
                  />
                )
              })}
            </TableBody>
          </Table>
        </Card>
      </div>
    )
  }
}

export default withSaver(Admins)

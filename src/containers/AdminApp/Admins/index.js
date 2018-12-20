import React, { Component } from 'react'
import Table from '@material-ui/core/Table'
import TableBody from '@material-ui/core/TableBody'
import TableCell from '@material-ui/core/TableCell'
import TablePagination from '@material-ui/core/TablePagination'
import TableHead from '@material-ui/core/TableHead'
import TableRow from '@material-ui/core/TableRow'
import Button from '@material-ui/core/Button'
import TextField from '@material-ui/core/TextField'
import Card from '@material-ui/core/Card'
import FileSaver from 'file-saver'

import PropTypes from 'prop-types'

import SnackMessage from 'components/SnackMessage'
import NetworkOperation from 'utils/NetworkOperation'
import { withSaver } from 'utils/portals'
import EditAdminModal from 'components/EditAdminModal'
import AdminRow from 'components/AdminRow'
import { UserContext } from 'utils/context'

import './styles.pcss'

class Admins extends Component {
  static propTypes = {
    toggle: PropTypes.function,
  }

  static contextType = UserContext

  state = {
    anchorEl: null,
    search: '',
    rows: [],
    filteredRows: [],
    openAdmin: false,
    isSaving: false,
    selectedUser: null,
    message: null,
    reverseSort: true,
    selectedSort: null,
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

  reloadData = async (currentPage) => {
    try {
      const response = await NetworkOperation.getAdmins()
      const admins = response.data.admins || []

      this.setState({ rows: admins, filteredRows: admins })
    } catch (error) {
      console.error(error)
    }
  }

  exportData = async () => {
    try {
      const response = await NetworkOperation.exportAdmins()
      const blob = new Blob([response.data], {
        type: 'text/plain;charset=utf-8',
      })
      FileSaver.saveAs(blob, new Date().toLocaleDateString() + '_admins.csv')
    } catch (error) {
      console.log({ error })
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

  handleChangePage = (_, page) => {
    this.reloadData(page)
  }

  sortBy = (sortField) => () => {
    const newFilteredRows = this.state.filteredRows.sort(
      (
        {
          name: name1,
          username: username1,
          email: email1,
          services: services1,
        },
        { name: name2, username: username2, email: email2, services: services2 }
      ) => {
        const isSuperAdmin1 =
          services1.admins === 2 &&
          services1.clients === 2 &&
          services1.dashboard &&
          services1.rates

        const isSuperAdmin2 =
          services2.admins === 2 &&
          services2.clients === 2 &&
          services2.dashboard &&
          services2.rates

        switch (sortField) {
          case 'name':
            return name1 > name2
          case 'email':
            return email1 > email2
          case 'username':
            return username1 > username2
          case 'rol':
            return isSuperAdmin1 > isSuperAdmin2
        }
      }
    )

    this.setState(({ reverseSort }) => ({
      selectedSort: sortField,
      filteredRows: reverseSort ? newFilteredRows.reverse() : newFilteredRows,
      reverseSort: !reverseSort,
    }))
  }

  render() {
    const ROWS = 15

    const {
      state: {
        search,
        filteredRows,
        openAdmin,
        isSaving,
        selectedUser,
        message,
        selectedSort,
        reverseSort,
      },
    } = this

    const canEdit = this.context?.user?.services?.admins === 2

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
              style={{ marginRight: 16 }}
            >
              Añadir
            </Button>
            <Button
              color="primary"
              className="button"
              variant="contained"
              onClick={this.exportData}
            >
              Exportar
            </Button>
          </div>
        </div>
        <Card>
          <Table className="table">
            <TableHead>
              <TableRow>
                <TableCell className={selectedSort === 'name' ? `--selected-sort ${reverseSort ? '--reverse' : ''}` : ''} onClick={this.sortBy('name')}>Nombre</TableCell>
                <TableCell className={selectedSort === 'username' ? `--selected-sort ${reverseSort ? '--reverse' : ''}` : ''} onClick={this.sortBy('username')}>
                  Username
                </TableCell>
                <TableCell className={selectedSort === 'email' ? `--selected-sort ${reverseSort ? '--reverse' : ''}` : ''} onClick={this.sortBy('email')}>Mail</TableCell>
                <TableCell className={selectedSort === 'rol' ? `--selected-sort ${reverseSort ? '--reverse' : ''}` : ''} onClick={this.sortBy('rol')}>Rol</TableCell>
                {canEdit && <TableCell numeric />}
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
                    canEdit={canEdit}
                  />
                )
              })}
            </TableBody>
          </Table>
          <TablePagination
            rowsPerPageOptions={[1]}
            component="div"
            count={filteredRows.length}
            rowsPerPage={ROWS}
            page={0}
            backIconButtonProps={{
              'aria-label': 'Anterior',
            }}
            nextIconButtonProps={{
              'aria-label': 'Siguiente',
            }}
            onChangePage={this.handleChangePage}
          />
        </Card>
      </div>
    )
  }
}

export default withSaver(Admins)

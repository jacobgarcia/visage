import React, { Component } from 'react'
import Table from '@material-ui/core/Table'
import TableBody from '@material-ui/core/TableBody'
import TableCell from '@material-ui/core/TableCell'
import TableHead from '@material-ui/core/TableHead'
import TablePagination from '@material-ui/core/TablePagination'
import TableRow from '@material-ui/core/TableRow'
import Button from '@material-ui/core/Button'
import Card from '@material-ui/core/Card'
import TextField from '@material-ui/core/TextField'
import FileSaver from 'file-saver'

import PropTypes from 'prop-types'

import ClientRow from 'components/ClientRow'
import ClientModal from 'components/ClientModal'
import NetworkOperation from 'utils/NetworkOperation'
import { withSaver } from 'utils/portals'
import { UserContext } from 'utils/context'

import './styles.pcss'

class Clients extends Component {
  static propTypes = {
    saving: PropTypes.any,
    toggle: PropTypes.any,
  }

  static contextType = UserContext

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

  exportData = async () => {
    try {
      const response = await NetworkOperation.exportUsers()
      const blob = new Blob([response.data], {
        type: 'text/plain;charset=utf-8',
      })
      FileSaver.saveAs(blob, new Date().toLocaleDateString() + '_users.csv')
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
        this.setState(({ addUserModalOpen, selectedClient }) =>
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
            ? prevState.rows.filter(
                ({ name, company, email }) =>
                  String(name)
                    .toLowerCase()
                    .includes(String(prevState.search).toLowerCase()) ||
                  String(company)
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

  render() {
    const ROWS = 15
    const {
      state: { search, filteredRows, addUserModalOpen, selectedClient },
    } = this

    const canEdit = this.context?.user?.services?.clients === 2

    return (
      <div className="clients">
        <ClientModal
          selectedClient={selectedClient}
          toggleUserAddModal={this.toggleUserAddModal}
          addUserModalOpen={addUserModalOpen}
          reloadData={this.reloadData}
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
            <Button
              color="secondary"
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
                <TableCell>Nombre</TableCell>
                <TableCell>Empresa</TableCell>
                <TableCell>Mail</TableCell>
                <TableCell>Indexación</TableCell>
                <TableCell>API Keys</TableCell>
                {canEdit && <TableCell numeric />}
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
                  canEdit={canEdit}
                />
              ))}
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

export default withSaver(Clients)

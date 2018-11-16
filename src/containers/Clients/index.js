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
import CircularProgress from '@material-ui/core/CircularProgress'
import Card from '@material-ui/core/Card'
import FormControlLabel from '@material-ui/core/FormControlLabel'
import Checkbox from '@material-ui/core/Checkbox'

import BlockIcon from '@material-ui/icons/Block'
import RefreshIcon from '@material-ui/icons/Refresh'
import KeyIcon from '@material-ui/icons/VpnKey'
import PropTypes from 'prop-types'

import ClientRow from 'components/ClientRow'
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

  handlecheckChange = (name) => () => this.setState({ [name]: false })

  toggleUserAddModal = (isOpen = null) => () =>
    this.setState(({ prev }) => ({
      addUserModalOpen: isOpen !== null ? isOpen : !prev.addUserModalOpen,
    }))

  render() {
    const {
      state: { search, rows, anchorEl, addUserModalOpen, admin, user = '' },
    } = this

    return (
      <div className="clients">
        <Modal
          open={addUserModalOpen}
          onClose={this.toggleUserAddModal(false)}
          className="modal"
        >
          <Card className="card">
            <div className="card-header">
              <h2>Añadir usuario</h2>
              <Button
                onClick={this.toggleUserAddModal(false)}
                variant="outlined"
              >
                Cerrar
              </Button>
            </div>
            <div>
              <div>
                <TextField
                  id="standard-name"
                  label="Nombre"
                  value={user}
                  name="user"
                  onChange={this.onChange}
                  margin="normal"
                  variant="outlined"
                />
                <TextField
                  id="standard-name"
                  label="Email"
                  value={user}
                  name="user"
                  onChange={this.onChange}
                  margin="normal"
                  variant="outlined"
                />
              </div>
            </div>
            <div>
              <h4>Función</h4>
              <div className="list">
                <div>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={admin}
                        onChange={this.handlecheckChange('admin')}
                        value="checkedG"
                        color="primary"
                      />
                    }
                    label="Administrador"
                  />
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={admin}
                        onChange={this.handlecheckChange('admin')}
                        value="checkedG"
                        color="primary"
                      />
                    }
                    label="Superadministrador"
                  />
                </div>
              </div>
            </div>
            <div>
              <h4>Permisos</h4>
              <div className="list">
                <div>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={admin}
                        onChange={this.handlecheckChange('admin')}
                        value="checkedG"
                        color="primary"
                      />
                    }
                    label="Ver dashboard"
                  />
                </div>
                <div>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={admin}
                        onChange={this.handlecheckChange('admin')}
                        value="checkedG"
                        color="primary"
                      />
                    }
                    label="Ver clientes"
                  />
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={admin}
                        onChange={this.handlecheckChange('admin')}
                        value="checkedG"
                        color="primary"
                      />
                    }
                    label="Crear y editar clientes"
                  />
                </div>
                <div>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={admin}
                        onChange={this.handlecheckChange('admin')}
                        value="checkedG"
                        color="primary"
                      />
                    }
                    label="Ver administradores"
                  />
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={admin}
                        onChange={this.handlecheckChange('admin')}
                        value="checkedG"
                        color="primary"
                      />
                    }
                    label="Crear y editar administradores"
                  />
                </div>
                <div>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={admin}
                        onChange={this.handlecheckChange('admin')}
                        value="checkedG"
                        color="primary"
                      />
                    }
                    label="Ver tarifas"
                  />
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={admin}
                        onChange={this.handlecheckChange('admin')}
                        value="checkedG"
                        color="primary"
                      />
                    }
                    label="Crear y editar tarifas"
                  />
                </div>
              </div>
            </div>
          </Card>
        </Modal>
        <div className="actions">
          <TextField
            id="standard-name"
            label="Buscar"
            className="text-field"
            value={search}
            onChange={() => {}}
            margin="normal"
          />
          <div className="buttons">
            <Button
              color="primary"
              className="button"
              onClick={this.toggleUserAddModal(true)}
            >
              Nuevo cliente
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
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.map((item) => <ClientRow {...item} key={item._id} />)}
            </TableBody>
          </Table>
        </Card>
      </div>
    )
  }
}

export default withSaver(Clients)

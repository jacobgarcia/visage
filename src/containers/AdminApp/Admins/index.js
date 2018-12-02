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

import NetworkOperation from 'utils/NetworkOperation'
import { withSaver } from 'utils/portals'
import EditAdminModal from 'components/EditAdminModal'
import MoreButton from 'components/MoreButton'

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
  }

  componentDidMount() {
    this.props.toggle({ saveButton: false, dateFilter: false })

    this.reloadData()
  }

  componentDidUpdate(prevProps) {
    // if (this.props.saving && !prevProps.saving) {
    //   this.onSave()
    // }
  }

  handleClose = () => this.setState({ anchorEl: null })

  handleClick = (evt, user) => {
    this.setState({
      anchorEl: evt.currentTarget,
      selectedUser: user,
    })
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

  onSaveAdmin = async (newAdmin, oldUsername) => {
    const { _id: newAdminId, ...data } = newAdmin

    try {
      let response
      if (newAdminId) {
        response = await NetworkOperation.updateAdmin(data, oldUsername)
      } else {
        response = await NetworkOperation.createAdmin(data)
      }

      console.log({ response })

      this.reloadData()
    } catch (error) {
      console.error(error)
    }
  }

  render() {
    const {
      state: {
        anchorEl,
        search,
        filteredRows,
        openAdmin,
        isSaving,
        selectedUser,
      },
    } = this

    return (
      <div className="admins">
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
                  <TableRow key={item._id}>
                    <TableCell component="th" scope="item">
                      {item.name}
                    </TableCell>
                    <TableCell>{item.username}</TableCell>
                    <TableCell>{item.email}</TableCell>
                    <TableCell>
                      <Button variant="outlined" disabled>
                        {item.superAdmin ? 'SUPERADMIN' : 'ADMIN'}
                      </Button>
                    </TableCell>
                    <TableCell numeric>
                      <MoreButton
                        user={item}
                        anchorEl={anchorEl}
                        onEdit={() => {
                          this.onToggleEditModal(selectedUser)
                        }}
                        handleClick={(e, user) => this.handleClick(e, user)}
                        handleClose={this.handleClose}
                      />
                    </TableCell>
                  </TableRow>
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

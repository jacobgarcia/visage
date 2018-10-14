import React, { Component } from 'react'
import Table from '@material-ui/core/Table'
import TableBody from '@material-ui/core/TableBody'
import TableCell from '@material-ui/core/TableCell'
import TableHead from '@material-ui/core/TableHead'
import TableRow from '@material-ui/core/TableRow'
import Button from '@material-ui/core/Button'
import TextField from '@material-ui/core/TextField'
// import MoreVertIcon from '@material-ui/icons/MoreVert'
// import IconButton from '@material-ui/core/IconButton'
// import BlockIcon from '@material-ui/icons/Block'
// import RefreshIcon from '@material-ui/icons/Refresh'
import PropTypes from 'prop-types'

import MoreButton from 'components/MoreButton'

import AddAdminModal from 'components/AddAdminModal'
import NetworkOperation from 'utils/NetworkOperation'
import { withSaver } from '../../utils/portals'

import './styles.pcss'

class Admins extends Component {
  static propTypes = {
    saving: PropTypes.any,
    stopSaving: PropTypes.any,
    toggle: PropTypes.any,
  }

  state = {
    search: '',
    rows: [],
    addUserModalOpen: false,
    anchorEl: null,
    selectedAdmin: null,
  }

  async componentDidMount() {
    this.props.toggle(true)

    try {
      const response = await NetworkOperation.getAdmins()
      const admins = response.data.admins || []
      this.setState({ rows: admins })
    } catch (error) {
      console.error(error)
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

  handleClose = () => this.setState({ anchorEl: null })
  handleClick = (event) => this.setState({ anchorEl: event.currentTarget })

  onSave = () => {
    setTimeout(() => {
      this.props.stopSaving(true)
    }, 2000)
  }

  toggleUserAddModal = (isOpen = null) => () => {
    this.setState(
      ({ prev }) => ({
        addUserModalOpen: isOpen !== null ? isOpen : !prev.addUserModalOpen,
      }),
      () =>
        this.state.addUserModalOpen === false &&
        this.setState({ selectedAdmin: null })
    )
  }

  onAction = (action, admin) => {
    console.log({ action, admin })
    if (action === 'EDIT') this.setState({ selectedAdmin: admin, addUserModalOpen: true })
  }

  render() {
    const {
      state: { search, rows, addUserModalOpen, anchorEl, selectedAdmin },
    } = this

    return (
      <div className="admins">
        <AddAdminModal
          admin={selectedAdmin}
          addUserModalOpen={addUserModalOpen}
          toggleUserAddModal={this.toggleUserAddModal}
          onSave={this.onSave}
        />
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
              onClick={this.toggleUserAddModal(true)}
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
              <TableCell numeric>Mail</TableCell>
              <TableCell numeric>Rol</TableCell>
              <TableCell />
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((item) => (
              <TableRow key={item._id}>
                <TableCell component="th" scope="item">
                  {item.name} {item.surname} {item._id}
                </TableCell>
                <TableCell numeric>{item.email}</TableCell>
                <TableCell numeric>
                  <Button variant="outlined">
                    {item.superAdmin ? 'Super administrador' : 'Administrador'}
                  </Button>
                </TableCell>
                <TableCell>
                  <MoreButton
                    data={item}
                    onAction={this.onAction}
                    isActive={item.active}
                    anchorEl={anchorEl}
                    handleClick={this.handleClick}
                    handleClose={this.handleClose}
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    )
  }
}

export default withSaver(Admins)

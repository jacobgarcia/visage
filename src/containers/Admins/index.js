import React, { Component } from 'react'
import Table from '@material-ui/core/Table'
import TableBody from '@material-ui/core/TableBody'
import TableCell from '@material-ui/core/TableCell'
import TableHead from '@material-ui/core/TableHead'
import TableRow from '@material-ui/core/TableRow'
import Button from '@material-ui/core/Button'
import TextField from '@material-ui/core/TextField'
import Card from '@material-ui/core/Card'
import MoreVertIcon from '@material-ui/icons/MoreVert'
import IconButton from '@material-ui/core/IconButton'

import PropTypes from 'prop-types'

import NetworkOperation from 'utils/NetworkOperation'
import { withSaver } from '../../utils/portals'
import EditAdminModal from '../../components/EditAdminModal'

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
    openAdmin: true,
  }

  async componentDidMount() {
    this.props.toggle(true)

    try {
      const response = await NetworkOperation.getAdmins()
      const admins = response.data.admins || []
      console.log({ admins })
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

  onSave() {
    setTimeout(() => {
      this.props.stopSaving(true)
    }, 2000)
  }

  onCloseEditModal = () => {
    this.setState(({ openAdmin }) => ({ openAdmin: !openAdmin }))
  }

  render() {
    const {
      state: { search, rows, openAdmin },
    } = this

    return (
      <div className="admins">
        <EditAdminModal onClose={this.onCloseEditModal} open={openAdmin} />
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
            <Button color="primary" className="button">
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
                <TableCell numeric>Mail</TableCell>
                <TableCell numeric>Rol</TableCell>
                <TableCell />
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.map((item) => {
                return (
                  <TableRow key={item.id}>
                    <TableCell component="th" scope="item">
                      {item.name} {item.surname}
                    </TableCell>
                    <TableCell numeric>{item.email}</TableCell>
                    <TableCell numeric>
                      <Button variant="outlined" disabled>
                        ADMIN
                      </Button>
                    </TableCell>

                    <TableCell>
                      <IconButton
                        aria-label="More"
                        aria-owns={open ? 'long-menu' : null}
                        aria-haspopup="true"
                        onClick={this.handleClick}
                      >
                        <MoreVertIcon />
                      </IconButton>
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

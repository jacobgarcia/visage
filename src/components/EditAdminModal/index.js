import React, { Component } from 'react'
import PropTypes from 'prop-types'

import Modal from '@material-ui/core/Modal'
import TextField from '@material-ui/core/TextField'
// import Switch from '@material-ui/core/Switch'
import Button from '@material-ui/core/Button'
import Radio from '@material-ui/core/Radio'

import './styles.pcss'

function getInitialState() {
  return {
    _id: null,
    email: '',
    name: '',
    username: '',
    services: {},
    superAdmin: false,
    dashboardAccess: 0,
    clientsAccess: 0,
    adminsAccess: 0,
    ratesAccess: 0,
    valid: false,
  }
}

class EditAdminModal extends Component {
  state = {
    ...getInitialState(),
  }

  static getDerivedStateFromProps(nextProps, state) {
    const user = nextProps.user

    if (user?._id && !state._id) {
      const isSuperAdmin =
        user.services.admins === 2 &&
        user.services.clients === 2 &&
        user.services.dashboard &&
        user.services.rates

      return {
        name: user?.name || '',
        email: user?.email || '',
        superAdmin: isSuperAdmin,
        _id: user?._id,
        valid: true,
        username: user?.username,
        dashboardAccess: user.services.dashboard ? 1 : 0,
        clientsAccess: user.services.clients,
        adminsAccess: user.services.admins,
        ratesAccess: user.services.rates ? 1 : 0,
      }
    }

    if (nextProps.open === false) {
      return getInitialState()
    }

    return {}
  }

  onChange = (name) => ({ target: { value } }) => {
    this.setState({ [name]: value }, () => {
      this.setState({
        valid: this.state.name && this.state.email && this.state.username,
      })
    })
  }

  onRadioChange = (name, setValue) => () => {
    if (name === 'superAdmin' && setValue === 1) {
      this.setState({
        dashboardAccess: 1,
        clientsAccess: 2,
        adminsAccess: 2,
        ratesAccess: 1,
      })
    }
    this.setState({ [name]: setValue })
  }

  onSave = () => {
    const nextUser = {}
    if (this.state._id) nextUser._id = this.state._id

    nextUser.name = this.state.name
    nextUser.email = this.state.email
    nextUser.username = this.state.username
    nextUser.services = {
      dashboard: this.state.dashboardAccess,
      clients: this.state.clientsAccess,
      admins: this.state.adminsAccess,
      rates: this.state.ratesAccess,
    }

    this.props.onSave(nextUser, this.props.user.username)
    this.props.onClose()
  }

  render() {
    const {
      props,
      state: {
        name,
        superAdmin,
        email,
        _id,
        dashboardAccess,
        clientsAccess,
        adminsAccess,
        ratesAccess,
        valid,
        username,
      },
    } = this

    return (
      <div>
        <Modal
          aria-labelledby="simple-modal-title"
          aria-describedby="simple-modal-description"
          open={props.open}
          onClose={props.onClose}
          className="modal"
        >
          <div className="paper-container">
            <div className="paper">
              <h4>{_id ? 'Editar' : 'Nuevo'} administrador</h4>
              <div>
                <TextField
                  required
                  label="Nombre del administrador"
                  margin="normal"
                  variant="outlined"
                  value={name}
                  onChange={this.onChange('name')}
                  className="user-name"
                />
                <TextField
                  required
                  label="Nombre de usuario"
                  margin="normal"
                  variant="outlined"
                  value={username}
                  onChange={this.onChange('username')}
                />
              </div>
              <div>
                <TextField
                  required
                  label="Email"
                  margin="normal"
                  variant="outlined"
                  value={email}
                  onChange={this.onChange('email')}
                />
              </div>
              <div>
                <div className="radio-inputs-container">
                  <div>
                    <Radio
                      onChange={this.onRadioChange('superAdmin', 0)}
                      checked={!superAdmin}
                    />
                    <label>Administrador</label>
                  </div>
                  <div>
                    <Radio
                      onChange={this.onRadioChange('superAdmin', 1)}
                      checked={superAdmin}
                    />
                    <label>Super administrador</label>
                  </div>
                </div>
              </div>
              <hr />
              <div className="permits-container">
                <h5>Permisos</h5>
                <h6>Dashboard</h6>
                <div className="radio-inputs-container">
                  <div>
                    <Radio
                      onChange={this.onRadioChange('dashboardAccess', 1)}
                      checked={dashboardAccess === 1}
                      disabled={superAdmin}
                    />
                    <label>Con acceso</label>
                  </div>
                  <div>
                    <Radio
                      onChange={this.onRadioChange('dashboardAccess', 0)}
                      checked={dashboardAccess === 0}
                      disabled={superAdmin}
                    />
                    <label>Sin acceso</label>
                  </div>
                </div>
                <hr />
                <h6>Clientes</h6>
                <div className="radio-inputs-container">
                  <div>
                    <Radio
                      onChange={this.onRadioChange('clientsAccess', 2)}
                      checked={clientsAccess === 2}
                      disabled={superAdmin}
                    />
                    <label>Ver y editar</label>
                  </div>
                  <div>
                    <Radio
                      onChange={this.onRadioChange('clientsAccess', 1)}
                      checked={clientsAccess === 1}
                      disabled={superAdmin}
                    />
                    <label>Sólo ver</label>
                  </div>
                  <div>
                    <Radio
                      onChange={this.onRadioChange('clientsAccess', 0)}
                      checked={clientsAccess === 0}
                      disabled={superAdmin}
                    />
                    <label>Sin acceso</label>
                  </div>
                </div>
                <hr />
                <h6>Administradores</h6>
                <div className="radio-inputs-container">
                  <div>
                    <Radio
                      onChange={this.onRadioChange('adminsAccess', 2)}
                      checked={adminsAccess === 2}
                      disabled={superAdmin}
                    />
                    <label>Ver y editar</label>
                  </div>
                  <div>
                    <Radio
                      onChange={this.onRadioChange('adminsAccess', 1)}
                      checked={adminsAccess === 1}
                      disabled={superAdmin}
                    />
                    <label>Sólo ver</label>
                  </div>
                  <div>
                    <Radio
                      onChange={this.onRadioChange('adminsAccess', 0)}
                      checked={adminsAccess === 0}
                      disabled={superAdmin}
                    />
                    <label>Sin acceso</label>
                  </div>
                </div>
                <hr />
                <h6>Tarifas</h6>
                <div className="radio-inputs-container">
                  <div>
                    <Radio
                      onChange={this.onRadioChange('ratesAccess', 1)}
                      checked={ratesAccess === 1}
                      disabled={superAdmin}
                    />
                    <label>Ver y editar</label>
                  </div>
                  <div>
                    <Radio
                      onChange={this.onRadioChange('ratesAccess', 0)}
                      checked={ratesAccess === 0}
                      disabled={superAdmin}
                    />
                    <label>Sólo ver</label>
                  </div>
                </div>
              </div>
              <Button
                disabled={!valid}
                onClick={this.onSave}
                variant="contained"
                color="secondary"
              >
                {_id ? 'Guardar' : 'Añadir'}
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    )
  }
}
EditAdminModal.propTypes = {}

const SimpleModalWrapped = EditAdminModal

export default SimpleModalWrapped

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
    services: [],
    superAdmin: false,
    dashboardAccess: 0,
    clientsAccess: 0,
    adminsAccess: 0,
    tarifsAccess: 0,
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
      return {
        name: user?.name || '',
        email: user?.email || '',
        superAdmin: user?.superAdmin,
        _id: user?._id,
        valid: true,
        username: user?.username,
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

  onChangeRadio = (name, value) => () => this.setState({ [name]: value })

  onSave = () => {
    const nextUser = {}
    if (this.state._id) nextUser._id = this.state._id
    nextUser.name = this.state.name
    nextUser.email = this.state.email
    nextUser.username = this.state.username
    nextUser.services = this.state.services
    nextUser.superAdmin = this.state.superAdmin

    this.props.onSave(nextUser)
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
        tarifsAccess,
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
              <h4>Editar administrador</h4>
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
                    <Radio checked={!superAdmin} />
                    <label>Administrador</label>
                  </div>
                  <div>
                    <Radio checked={superAdmin} />
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
                      onChange={this.onChangeRadio('dashboardAccess', 1)}
                      checked={dashboardAccess === 1}
                    />
                    <label>Con acceso</label>
                  </div>
                  <div>
                    <Radio
                      onChange={this.onChangeRadio('dashboardAccess', 0)}
                      checked={dashboardAccess === 0}
                    />
                    <label>Sin acceso</label>
                  </div>
                </div>
                <hr />
                <h6>Clientes</h6>
                <div className="radio-inputs-container">
                  <div>
                    <Radio
                      onChange={this.onChangeRadio('clientsAccess', 2)}
                      checked={clientsAccess === 2}
                    />
                    <label>Ver y editar</label>
                  </div>
                  <div>
                    <Radio
                      onChange={this.onChangeRadio('clientsAccess', 1)}
                      checked={clientsAccess === 1}
                    />
                    <label>Sólo ver</label>
                  </div>
                  <div>
                    <Radio
                      onChange={this.onChangeRadio('clientsAccess', 0)}
                      checked={clientsAccess === 0}
                    />
                    <label>Sin acceso</label>
                  </div>
                </div>
                <hr />
                <h6>Administradores</h6>
                <div className="radio-inputs-container">
                  <div>
                    <Radio
                      onChange={this.onChangeRadio('adminsAccess', 2)}
                      checked={adminsAccess === 2}
                    />
                    <label>Ver y editar</label>
                  </div>
                  <div>
                    <Radio
                      onChange={this.onChangeRadio('adminsAccess', 1)}
                      checked={adminsAccess === 1}
                    />
                    <label>Sólo ver</label>
                  </div>
                  <div>
                    <Radio
                      onChange={this.onChangeRadio('adminsAccess', 0)}
                      checked={adminsAccess === 0}
                    />
                    <label>Sin acceso</label>
                  </div>
                </div>
                <hr />
                <h6>Tarifas</h6>
                <div className="radio-inputs-container">
                  <div>
                    <Radio
                      onChange={this.onChangeRadio('tarifsAccess', 1)}
                      checked={tarifsAccess === 1}
                    />
                    <label>Ver y editar</label>
                  </div>
                  <div>
                    <Radio
                      onChange={this.onChangeRadio('tarifsAccess', 0)}
                      checked={tarifsAccess === 0}
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

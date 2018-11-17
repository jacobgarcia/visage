import React, { Component } from 'react'
import PropTypes from 'prop-types'

import Modal from '@material-ui/core/Modal'
import TextField from '@material-ui/core/TextField'
import Switch from '@material-ui/core/Switch'
import Button from '@material-ui/core/Button'
import Radio from '@material-ui/core/Radio'

import './styles.pcss'

function getInitialState() {
  return {
    _id: null,
    email: '',
    name: '',
    services: [],
    superAdmin: false,
    dashboardAccess: 0,
    clientsAccess: 0,
    adminsAccess: 0,
    tarifsAccess: 0,
  }
}

class EditAdminModal extends Component {
  state = {
    ...getInitialState(),
  }

  static getDerivedStateFromProps(nextProps) {
    const user = nextProps.user

    if (user?._id) {
      return {
        name: user?.name || '',
        email: user?.email || '',
        superAdmin: user?.superAdmin,
        _id: user?._id,
      }
    }

    if (nextProps.open === false) {
      return getInitialState()
    }

    return {}
  }

  onChangeRadio = (name, value) => () => this.setState({ [name]: value })

  onSave = () => {
    const nextUser = {}
    if (this.state._id) nextUser._id = this.state._id

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
      },
    } = this

    console.log({ props })

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
                />
                <TextField
                  required
                  label="Email"
                  margin="normal"
                  variant="outlined"
                  value={email}
                />
              </div>
              <div>
                <div className="radio-inputs-container">
                  <div>
                    <Radio checked={!superAdmin} />
                    <label htmlFor="">Administrador</label>
                  </div>
                  <div>
                    <Radio checked={superAdmin} />
                    <label htmlFor="">Super administrador</label>
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
                    <label htmlFor="">Con acceso</label>
                  </div>
                  <div>
                    <Radio
                      onChange={this.onChangeRadio('dashboardAccess', 0)}
                      checked={dashboardAccess === 0}
                    />
                    <label htmlFor="">Sin acceso</label>
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
                    <label htmlFor="">Ver y editar</label>
                  </div>
                  <div>
                    <Radio
                      onChange={this.onChangeRadio('clientsAccess', 1)}
                      checked={clientsAccess === 1}
                    />
                    <label htmlFor="">Sólo ver</label>
                  </div>
                  <div>
                    <Radio
                      onChange={this.onChangeRadio('clientsAccess', 0)}
                      checked={clientsAccess === 0}
                    />
                    <label htmlFor="">Sin acceso</label>
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
                    <label htmlFor="">Ver y editar</label>
                  </div>
                  <div>
                    <Radio
                      onChange={this.onChangeRadio('adminsAccess', 1)}
                      checked={adminsAccess === 1}
                    />
                    <label htmlFor="">Sólo ver</label>
                  </div>
                  <div>
                    <Radio
                      onChange={this.onChangeRadio('adminsAccess', 0)}
                      checked={adminsAccess === 0}
                    />
                    <label htmlFor="">Sin acceso</label>
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
                    <label htmlFor="">Ver y editar</label>
                  </div>
                  <div>
                    <Radio
                      onChange={this.onChangeRadio('tarifsAccess', 0)}
                      checked={tarifsAccess === 0}
                    />
                    <label htmlFor="">Sólo ver</label>
                  </div>
                </div>
              </div>
              <Button
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

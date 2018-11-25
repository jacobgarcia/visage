import React, { Component } from 'react'
import PropTypes from 'prop-types'

import TextField from '@material-ui/core/TextField'
import Modal from '@material-ui/core/Modal'
import FormControlLabel from '@material-ui/core/FormControlLabel'
import Checkbox from '@material-ui/core/Checkbox'
import Button from '@material-ui/core/Button'
import Card from '@material-ui/core/Card'

class ClientModal extends Component {
  static propTypes = {}

  state = {}

  handlecheckChange = (name) => () => this.setState({ [name]: false })

  onChange = () => {}

  render() {
    const {
      props: { addUserModalOpen, admin, user, toggleUserAddModal },
    } = this

    return (
      <Modal
        open={addUserModalOpen}
        onClose={toggleUserAddModal(false)}
        className="modal"
      >
        <Card className="card">
          <div className="card-header">
            <h2>Añadir usuario</h2>
            <Button onClick={toggleUserAddModal(false)} variant="outlined">
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
    )
  }
}

export default ClientModal

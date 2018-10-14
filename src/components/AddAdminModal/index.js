import React, { Component } from 'react'
import Button from '@material-ui/core/Button'
import TextField from '@material-ui/core/TextField'
import Modal from '@material-ui/core/Modal'
import Card from '@material-ui/core/Card'
import FormControlLabel from '@material-ui/core/FormControlLabel'
import Checkbox from '@material-ui/core/Checkbox'

import PropTypes from 'prop-types'

function getInitialState() {
  return {
    _id: null,
    name: '',
    surname: '',
    email: '',
  }
}

class AddClientModal extends Component {
  static propTypes = {
    addUserModalOpen: PropTypes.bool,
    admin: PropTypes.func,
    toggleUserAddModal: PropTypes.function,
  }

  state = getInitialState()

  componentDidUpdate(prevProps) {
    if (this.props.admin !== null && prevProps.admin === null) this.setState({ ...this.props.admin })
    if (this.props.admin === null && prevProps.admin !== null) this.setState(getInitialState())
  }

  handlecheckChange = ($0) => () => this.setState({ [$0]: false })

  onChange = ({ target: { name, value } }) => {
    console.log({ name, value })
    this.setState({ [name]: value })
  }

  onSave = () => {
    console.log(this.state)
  }

  render() {
    const {
      props: { addUserModalOpen, toggleUserAddModal },
      state: { name, surname, email },
    } = this

    return (
      <Modal
        open={addUserModalOpen}
        onClose={toggleUserAddModal(false)}
        className="modal"
      >
        <Card className="card">
          <div className="card-header">
            <h2>Añadir admin</h2>
            <Button onClick={toggleUserAddModal(false)} variant="outlined">
              Cerrar
            </Button>
          </div>
          <div>
            <div>
              <TextField
                id="standard-name"
                label="Nombre"
                value={name}
                name="name"
                onChange={this.onChange}
                margin="normal"
                variant="outlined"
              />
              <TextField
                id="standard-name"
                label="Email"
                value={email}
                name="email"
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
                      checked={true}
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
                      checked={true}
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
                      checked={true}
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
                      checked={true}
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
                      checked={true}
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
                      checked={true}
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
                      checked={true}
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
                      checked={true}
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
                      checked={true}
                      onChange={this.handlecheckChange('admin')}
                      value="checkedG"
                      color="primary"
                    />
                  }
                  label="Crear y editar tarifas"
                />
              </div>
            </div>
            <Button variant="contained" color="primary" onClick={this.onSave}>
              Guardar
            </Button>
          </div>
        </Card>
      </Modal>
    )
  }
}

export default AddClientModal

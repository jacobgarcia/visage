import React, { Component } from 'react'

import Modal from '@material-ui/core/Modal'
import TextField from '@material-ui/core/TextField'
// import Switch from '@material-ui/core/Switch'
import Button from '@material-ui/core/Button'
import NetworkOperation from 'utils/NetworkOperation'
import './styles.pcss'

function getInitialState() {
  return {
    valid: false,
    error: '',
    name: '',
    company: '',
    email: '',
  }
}

class EditUserModal extends Component {
  state = {
    ...getInitialState(),
  }
  componentDidMount() {
    this.setState({
      name: this.props.name,
      company: this.props.company,
      email: this.props.email,
    })
  }
  onChange = (name) => ({ target: { value } }) => {
    this.setState({ [name]: value }, () => {
      this.setState({
        valid: this.state.name && this.state.company && this.state.email &&
               this.state.searchLimit && this.state.indexLimit,
      })
    })
  }

  onSave = async () => {
    const info = {
      name : this.state.name,
      company: this.state.company,
      email: this.state.email,
      searchLimit: this.state.searchLimit,
      indexLimit: this.state.indexLimit,
      username: this.props.username,
    }
    try {
      await NetworkOperation.updateClient(info, this.props.username)
      this.setState({ error: 'Informacion Cambiada'})
      window.setTimeout(() => {
        this.props.onClose()
      }, 2000)
    } catch (error) {
      this.setState({ error: 'Error de datos'})
    }
  }

  render() {
    const {
      props,
      state: {
        valid,
        name,
        company,
        email,
        searchLimit,
        indexLimit,
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
              <h4>Cambiar Contraseña</h4>
              <div>
                <TextField
                  required
                  className="name"
                  label="Nombre"
                  margin="normal"
                  variant="outlined"
                  value={name}
                  onChange={this.onChange('name')}
                />
                <TextField
                  required
                  className="company"
                  label="Compañia"
                  margin="normal"
                  variant="outlined"
                  value={company}
                  onChange={this.onChange('company')}
                />
                <TextField
                  required
                  className="email"
                  label="Email"
                  margin="normal"
                  variant="outlined"
                  value={email}
                  onChange={this.onChange('email')}
                />
                <TextField
                  required
                  className="searchLimit"
                  label="Limite de Busquedas"
                  margin="normal"
                  variant="outlined"
                  value={searchLimit}
                  onChange={this.onChange('searchLimit')}
                />
                <TextField
                  required
                  className="indexLimit"
                  label="Limite de Indexacion"
                  margin="normal"
                  variant="outlined"
                  value={indexLimit}
                  onChange={this.onChange('indexLimit')}
                />
                <p className="error-pass" >{this.state.error}</p>
              </div>
              <Button
                disabled={!valid}
                onClick={this.onSave}
                variant="contained"
                color="secondary"
              >
              Guardar
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    )
  }
}
EditUserModal.propTypes = {}

const SimpleModalWrapped = EditUserModal

export default SimpleModalWrapped

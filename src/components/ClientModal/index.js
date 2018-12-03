import React, { Component } from 'react'
import PropTypes from 'prop-types'

import TextField from '@material-ui/core/TextField'
import Modal from '@material-ui/core/Modal'
import FormControlLabel from '@material-ui/core/FormControlLabel'
import Checkbox from '@material-ui/core/Checkbox'
import Button from '@material-ui/core/Button'
import Card from '@material-ui/core/Card'
import Radio from '@material-ui/core/Radio'

import NetworkOperation from 'utils/NetworkOperation'
import '../EditAdminModal/styles.pcss'

function getInitialState() {
  return {
    _id: null,
    name: '',
    username: '',
    email: '',
    company: '',
    valid: false,
    pastUsername: '',
  }
}

class ClientModal extends Component {
  static propTypes = {}

  state = {
    ...getInitialState,
  }

  componentDidUpdate(prevProps) {
    if (
      !prevProps.selectedClient &&
      this.props.selectedClient &&
      !this.state.username
    ) {
      this.setState({
        ...this.props.selectedClient,
        pastUsername: this.props.selectedClient.username,
      })
      return
    }

    if (
      prevProps.addUserModalOpen &&
      !this.props.addUserModalOpen &&
      this.state.username
    ) {
      this.setState(getInitialState)
    }
  }

  handlecheckChange = (name) => () => this.setState({ [name]: false })

  onChange = (name) => ({ target: { value } }) => {
    this.setState({ [name]: value, error: null }, () => {
      this.setState({
        valid: this.state._id && this.state.name && this.state.email && this.state.username && this.state.company || !this.state._id && this.state.email ,
      })
    })
  }
  onSave = async () => {
    this.setState({ error: null })
    const data = {
      name: this.state.name,
      username: this.state.username,
      email: this.state.email,
      company: this.state.company,
    }

    try {
      let response
      if (this.state._id) {
        response = await NetworkOperation.updateClient(data, this.state.pastUsername)
      } else {
        response = await NetworkOperation.inviteUser(this.state.email)
      }
      console.log({ response })
      this.props.toggleUserAddModal(false)()
      this.props.reloadData()
    } catch ({ response }) {
      const { status = 500 } = response

      let message
      switch (status) {
        case 200:
          message = 'Invitacion enviada'
          break
        case 409:
          message = 'Usuario ya registrado'
          break
        case 401:
          message = 'El nombre ya fue definido'
          break
        default:
          message = 'Problemas al registrar usuario'
      }

      this.setState({ error: message })
    }
  }

  render() {
    const {
      props: { addUserModalOpen, toggleUserAddModal },
      state: { username, name, valid, _id, email, company, error },
    } = this

    return (
      <Modal
        open={addUserModalOpen}
        onClose={toggleUserAddModal(false)}
        className="modal"
      >
        <div className="paper-container">
          <div className="paper">
            <h3>{_id ? 'Editar' : 'Nuevo'} usuario</h3>
            {_id && <div>
              <TextField
                required
                label="Nombre"
                margin="normal"
                variant="outlined"
                value={name}
                onChange={this.onChange('name')}
                className="user-name"
              />
            </div>}
            {_id && <div>
              <TextField
                required
                label="Nombre de usuario"
                margin="normal"
                variant="outlined"
                value={username}
                onChange={this.onChange('username')}
              />
            </div>}
            {_id && <div>
              <TextField
                required
                label="Company"
                margin="normal"
                variant="outlined"
                value={company}
                onChange={this.onChange('company')}
              />
            </div>}
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
            {error && <p>{error}</p>}
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
    )
  }
}

export default ClientModal

import React, { Component } from 'react'
import PropTypes from 'prop-types'

import TextField from '@material-ui/core/TextField'
import Modal from '@material-ui/core/Modal'
import FormControlLabel from '@material-ui/core/FormControlLabel'
import Checkbox from '@material-ui/core/Checkbox'
import Button from '@material-ui/core/Button'
import Card from '@material-ui/core/Card'
import Radio from '@material-ui/core/Radio'

import '../EditAdminModal/styles.pcss'

function getInitialState() {
  return {
    _id: null,
    name: '',
    username: '',
    email: '',
    company: '',
    valid: false,
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
      this.setState(this.props.selectedClient)
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
    this.setState({ [name]: value }, () => {
      this.setState({
        valid: this.state.name && this.state.email && this.state.username,
      })
    })
  }

  onSave = () => {
    console.log('ON SAVE')
  }

  render() {
    const {
      props: { addUserModalOpen, toggleUserAddModal },
      state: { username, name, valid, _id, email, company },
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
            <div>
              <TextField
                required
                label="Nombre"
                margin="normal"
                variant="outlined"
                value={name}
                onChange={this.onChange('name')}
                className="user-name"
              />
            </div>
            <div>
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
              <TextField
                required
                label="Company"
                margin="normal"
                variant="outlined"
                value={company}
                onChange={this.onChange('company')}
              />
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
    )
  }
}

export default ClientModal

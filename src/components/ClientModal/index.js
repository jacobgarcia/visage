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
  }
}

class ClientModal extends Component {
  static propTypes = {}

  state = {
    ...getInitialState,
  }

  handlecheckChange = (name) => () => this.setState({ [name]: false })

  onChange = () => {}

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
      console.log('SETTING INTIAL STATE')
      this.setState(getInitialState)
    }
  }

  render() {
    const {
      props: { addUserModalOpen, toggleUserAddModal },
      state: { username, name, _id },
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
                label="Nombre del usuario"
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
          </div>
        </div>
      </Modal>
    )
  }
}

export default ClientModal

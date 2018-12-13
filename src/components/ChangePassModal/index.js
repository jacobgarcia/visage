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
  }
}

class ChangePassModal extends Component {
  state = {
    ...getInitialState(),
  }


  onChange = (name) => ({ target: { value } }) => {
    this.setState({ [name]: value }, () => {
      this.setState({
        valid: this.state.lastpass && this.state.newpass && this.state.confirmnewpass,
        error: this.state.newpass === this.state.confirmnewpass ? '' : 'La contraseña no coincide',
      })
    })
  }

  onSave = async () => {
    const info = {
      currentPassword: this.state.lastpass,
      newPassword: this.state.newpass,
      confirmPassword: this.state.confirmnewpass,
    }
    try {
      await NetworkOperation.updatePassword(info)
      this.setState({ error: 'Contraseña cambiada'})
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
        lastpass,
        newpass,
        confirmnewpass,
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
                  label="Contraseña antigua"
                  margin="normal"
                  variant="outlined"
                  value={lastpass}
                  onChange={this.onChange('lastpass')}
                />
                <TextField
                  required
                  label="Nueva contraseña"
                  margin="normal"
                  variant="outlined"
                  value={newpass}
                  onChange={this.onChange('newpass')}
                />
                <TextField
                  required
                  label="Confirmar nueva contraseña"
                  margin="normal"
                  variant="outlined"
                  value={confirmnewpass}
                  onChange={this.onChange('confirmnewpass')}
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
ChangePassModal.propTypes = {}

const SimpleModalWrapped = ChangePassModal

export default SimpleModalWrapped

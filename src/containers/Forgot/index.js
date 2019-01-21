import React, { Component } from 'react'
import { Link } from 'react-router-dom'
import PropTypes from 'prop-types'

import TextField from '@material-ui/core/TextField'
import Button from '@material-ui/core/Button'
import Typography from '@material-ui/core/Typography'

import SnackMessage from 'components/SnackMessage'
import NetworkOperation from 'utils/NetworkOperation'

import qboLogo from 'assets/qbo-logo.svg'

class Forgot extends Component {
  static propTypes = {}

  state = {
    email: '',
    loading: false,
    message: null,
  }

  onChange = ({ target: { name, value } }) =>
    this.setState({ [name]: value, error: null })

  handleSubmit = (event) => {
    event.preventDefault()

    this.setState({ loading: true })

    const email = this.state.email

    NetworkOperation.forgot({ email })
      .then(() => {
        this.setState({
          message: 'Correo enviado, verifica tu bandeja de entrada',
        })
      })
      .catch(() =>
        this.setState({
          message: 'No fue posible enviar el correo, intenta nuevamente',
        })
      )
      .then(() => {
        this.setState({ loading: false })
      })
  }

  onCloseSnack = () => this.setState({ message: null })

  render() {
    const {
      state: { email, loading, message },
    } = this

    return (
      <div className="login">
        <SnackMessage
          open={message}
          message={message}
          onClose={this.onCloseSnack}
        />

        <form onSubmit={this.handleSubmit}>
          <img src={qboLogo} alt="" />
          <Typography variant="body">
            Escribe tu dirección de correo electrónico, si está registrado
            recibiras un correo con un link para la reconfiguración de tu
            contraseña.
          </Typography>
          <TextField
            label="Correo electrónico"
            value={email}
            name="email"
            onChange={this.onChange}
            margin="normal"
            variant="outlined"
            InputLabelProps={{ shrink: true }}
            required
          />
          <div>
            <Button
              className="submit"
              variant="contained"
              color="primary"
              type="submit"
              disabled={loading}
            >
              Enviar correo
            </Button>
          </div>
          <Link to="/login">
            <Typography variant="button" gutterBottom>
              Regresar a inicio de sesión
            </Typography>
          </Link>
        </form>
      </div>
    )
  }
}

export default Forgot

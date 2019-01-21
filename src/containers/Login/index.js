import React, { Component } from 'react'
import { Link } from 'react-router-dom'

import TextField from '@material-ui/core/TextField'
import Button from '@material-ui/core/Button'
import Typography from '@material-ui/core/Typography'

import PropTypes from 'prop-types'
import NetworkOperation from 'utils/NetworkOperation'

import './styles.pcss'
import qboLogo from 'assets/qbo-logo.svg'
import { UserContext } from 'utils/context'

class Login extends Component {
  static propTypes = {
    history: PropTypes.object.isRequired,
  }

  static contextType = UserContext

  state = {
    email: '',
    password: '',
    error: null,
  }

  componentDidMount() {
    localStorage.clear()
  }

  onChange = ({ target: { name, value } }) =>
    this.setState({ [name]: value, error: null })

  onSubmit = (event) => {
    event.preventDefault()

    const { email, password } = this.state

    NetworkOperation.login({ email, password })
      .then(({ data }) => {
        localStorage.setItem('token', data.token)

        // Set user context
        this.context.setUserData({
          user: data.user,
          loadingSelf: false,
        })

        this.props.history.replace('/')
      })
      .catch(({ response = {} }) => {
        const { status = 500 } = response
        switch (status) {
          case 400:
            this.setState({
              error: 'Error General',
            })
            break
          default:
            this.setState({
              error: 'Problemas al iniciar sesión, intenta nuevamente',
            })
        }
      })
  }

  render() {
    const {
      state: { email, password, error },
    } = this

    return (
      <div className="login">
        <form onSubmit={this.onSubmit}>
          <img src={qboLogo} alt="" />
          <TextField
            id="standard-name"
            label="Correo electrónico"
            value={email}
            name="email"
            onChange={this.onChange}
            margin="normal"
            variant="outlined"
            InputLabelProps={{ shrink: true }}
            required
          />
          <TextField
            id="standard-password"
            label="Contraseña"
            value={password}
            name="password"
            type="password"
            onChange={this.onChange}
            margin="normal"
            variant="outlined"
            InputLabelProps={{ shrink: true }}
            required
          />
          {error ? <p>Error: {error}</p> : ''}
          <Button
            className="submit"
            variant="contained"
            color="primary"
            type="submit"
          >
            Ingresar
          </Button>
          <Link to="/forgot">
            <Typography variant="button" gutterBottom>
              ¿Olvidaste tu contraseña?
            </Typography>
          </Link>
        </form>
      </div>
    )
  }
}

Login.propTypes = {
  history: PropTypes.object,
  setCredentials: PropTypes.func,
}

export default Login

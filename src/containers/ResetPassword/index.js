import React, { Component } from 'react'
import queryString from 'query-string'
import jwtDecode from 'jwt-decode'
import PropTypes from 'prop-types'

import Typography from '@material-ui/core/Typography'
import TextField from '@material-ui/core/TextField'
import Button from '@material-ui/core/Button'
import CircularProgress from '@material-ui/core/CircularProgress'

import SnackMessage from 'components/SnackMessage'
import NetworkOperation from 'utils/NetworkOperation'
import { UserContext } from 'utils/context'

import qboLogo from 'assets/qbo-logo.svg'

class ResetPassword extends Component {
  static propTypes = {}

  static contextType = UserContext

  constructor(props) {
    super(props)

    const token = queryString.parse(this.props.location.search)?.token
    let decoded = {}

    try {
      decoded = jwtDecode(token)
    } catch (error) {
      console.log(error)
    }

    this.state = {
      email: decoded?.email,
      message: null,
    }
  }

  handleChange = ({ target: { name, value } }) => {
    this.setState({ [name]: value })
  }

  handleSubmit = async (event) => {
    event.preventDefault()

    this.setState({ loading: true })

    const token = queryString.parse(this.props.location.search)?.token
    const password = this.state.password

    try {
      const data = await NetworkOperation.passwordReset({ token, password })
      localStorage.setItem('token', data.token)

      // Set user context
      this.context.setUserData({
        user: data.user,
        loadingSelf: false,
      })

      this.props.history.replace('/')
    } catch (error) {
      this.setState({
        message: 'No fue posible enviar el correo, intenta nuevamente',
      })
    } finally {
      this.setState({ loading: false })
    }
  }

  onCloseSnack = () => this.setState({ message: null })

  render() {
    const {
      state: { message, email, password, repeatPassword, loading },
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
          <TextField
            label="Correo electrónico"
            value={email}
            type="email"
            name="email"
            margin="normal"
            variant="outlined"
            InputLabelProps={{ shrink: true }}
            readOnly
            required
          />
          <Typography variant="body">Escribe tu nueva contraseña</Typography>
          <TextField
            label="Contraseña"
            value={password}
            type="password"
            name="password"
            margin="normal"
            variant="outlined"
            InputLabelProps={{ shrink: true }}
            onChange={this.handleChange}
            required
          />
          <TextField
            label="Repetir contraseña"
            value={repeatPassword}
            type="password"
            name="repeatPassword"
            margin="normal"
            variant="outlined"
            InputLabelProps={{ shrink: true }}
            onChange={this.handleChange}
            required
          />
          <div
            style={{
              position: 'relative',
              display: 'inline-block',
              marginRight: 'auto',
              marginTop: 16,
            }}
          >
            <Button
              className="submit"
              variant="contained"
              color="primary"
              type="submit"
              disabled={loading}
              style={{ margin: 0 }}
            >
              Cambiar contraseña
            </Button>
            {loading && (
              <CircularProgress
                size={24}
                style={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  marginTop: -12,
                  marginLeft: -12,
                }}
              />
            )}
          </div>
        </form>
      </div>
    )
  }
}

export default ResetPassword

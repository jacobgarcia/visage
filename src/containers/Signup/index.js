import React, { Component } from 'react'
import TextField from '@material-ui/core/TextField'
import Button from '@material-ui/core/Button'
import PropTypes from 'prop-types'
import NetworkOperation from 'utils/NetworkOperation'

import './styles.pcss'
import qboLogo from '../../assets/qbo-logo.svg'

class Signup extends Component {
  static propTypes = {
    history: PropTypes.object.isRequired,
  }

  state = {
    username: '',
    password: '',
    error: '',
    email: '',
    second_password: '',
    invitation: '',
    fullName: '',
  }
  componentDidMount() {
    localStorage.clear()
  }
  onChange = ({ target: { name, value } }) => this.setState({ [name]: value })

  onSubmit = (event) => {
    event.preventDefault()
    const {email, invitation, username, password, second_password, fullName } = this.state
    if (second_password !== password) {
        this.setState({error: 'Las contraseñas no coinciden'})
      } else {
      NetworkOperation.signup(invitation ,{email, password, username, fullName})
        .then(({ data }) => {
          console.log(data)
          this.props.history.replace(this.state.return || '/login')
        })
        .catch(({ response = {} }) => {
          const { status = 500 } = response
          switch (status) {
            case 400:
            case 401:
              this.setState({
                error: 'Nombre ya fue definido',
              })
              break
            default:
              this.setState({
                error: 'Problemas al dar de alta la cuenta',
              })
          }
        })
      }
  }

  render() {
    const {
      state: {email, username, password, second_password , fullName, error },
    } = this

    return (
      <div className="login">
        <form onSubmit={this.onSubmit}>
          <img src={qboLogo} alt="" />
          <TextField
          id="standard-name"
          label="Nombre completo"
          value={fullName}
          name="fullName"
          onChange={this.onChange}
          margin="normal"
          variant="outlined"
          />
          <TextField
            id="standard-name"
            label="Nombre de usuario"
            value={username}
            name="username"
            onChange={this.onChange}
            margin="normal"
            variant="outlined"
          />
          <TextField
            id="standard-name"
            label="Correo"
            value={email}
            name="email"
            onChange={this.onChange}
            margin="normal"
            variant="outlined"
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
          />
          <TextField
            id="standard-password"
            label="Repita la Contraseña"
            value={second_password}
            name="second_password"
            type="password"
            onChange={this.onChange}
            margin="normal"
            variant="outlined"
          />
          {error ? <p>Error: {error}</p> : ''}
          <Button
            className="submit"
            variant="contained"
            color="primary"
            type="submit"
          >
            Registrar
          </Button>
        </form>
      </div>
    )
  }
}

Signup.propTypes = {
  history: PropTypes.object,
  setCredentials: PropTypes.func,
}

export default Signup

import React, { Component } from 'react'
import PropTypes from 'prop-types'
import TextField from '@material-ui/core/TextField'
import InputAdornment from '@material-ui/core/InputAdornment'
import FormControl from '@material-ui/core/FormControl'
import IconButton from '@material-ui/core/IconButton'
import Visibility from '@material-ui/icons/Visibility'
import VisibilityOff from '@material-ui/icons/VisibilityOff'
import InputLabel from '@material-ui/core/InputLabel'
import Input from '@material-ui/core/Input'
import NetworkOperation from 'utils/NetworkOperation'

import { UserContext } from 'utils/context'

import './style.pcss'

class Profile extends Component {
  static propTypes = {}

  static contextType = UserContext

  state = {
    name: this.context?.user?.name,
    company: this.context?.user?.company,
    email: this.context?.user?.email,
    username: this.context?.user?.username,
    apitoken: '',
    showPassword: false,
  }

  componentDidMount() {
    document.body.style.backgroundColor = '#fff'
    console.log(this.context)
  }

  componentWillUnmount() {
    document.body.style.backgroundColor = '#f5f5f5'
  }

  onChange = ({ target: { name, value } }) => {
    this.setState({ [name]: value })
  }

  async componentDidMount() {
    const { data: data } = await NetworkOperation.getApiToken()
    this.setState({
      apitoken: data.user?.apiKey?.value || "Token no generado"
    })
  }

  handleClickShowPassword = () => {
    this.setState(state => ({ showPassword: !state.showPassword }))
  }

  render() {
    const {
      state: { name, company, email, username, apitoken },
    } = this

    return (
      <div className="profile">
        <div>
          <h2>General</h2>
          <div className="fields-container">
            <TextField
              name="name"
              label="Nombre"
              value={name}
              onChange={this.onChange}
            />
            <TextField
              name="username"
              label="Nombre de usuario"
              value={username}
              onChange={this.onChange}
            />
            <TextField
              name="company"
              label="Empresa"
              value={company}
              onChange={this.onChange}
            />
            <TextField
              name="email"
              label="Email"
              value={email}
              onChange={this.onChange}
            />
          </div>
        </div>
        <hr />
        <div>
          <h2>Estatus</h2>
          <p>Usuario activo</p>
        </div>
        <hr />
        <div>
          <h2>Llaves de API</h2>
          <FormControl>
            <InputLabel htmlFor="adornment-password">Token</InputLabel>
            <Input
              id="adornment-password"
              type={this.state.showPassword ? 'text' : 'password'}
              value={apitoken}
              name="password"
              onChange={this.onChange}
              fullWidth
              endAdornment={
                <InputAdornment position="end">
                  <IconButton
                    aria-label="Toggle token visibility"
                    onClick={this.handleClickShowPassword}
                  >
                    {this.state.showPassword ? (
                      <Visibility />
                    ) : (
                      <VisibilityOff />
                    )}
                  </IconButton>
                </InputAdornment>
              }
            />
          </FormControl>
        </div>
        <hr />
        <div>
          <h2>Rangos de consultas</h2>
          <div className="consults-range">
            <label>Consultas</label>
            {this.context?.user?.searchRates?.map((rate) => (
              <p>
                ${rate.cost}MXN{' '}
                <span>
                  Entre {rate.min} y {rate.max}
                </span>
              </p>
            ))}
          </div>
          <div className="consults-range">
            <label>Indexación</label>
            {this.context?.user?.indexRates?.map((rate) => (
              <p>
                ${rate.cost}MXN{' '}
                <span>
                  Entre {rate.min} y {rate.max}
                </span>
              </p>
            ))}
          </div>
        </div>
        <hr />
        <div>
          <h2>Datos de facturación</h2>
          <div className="fields-container">
            <TextField label="RFC" name="rfc" />
            <TextField label="Razón social" name="social-name" />
            <TextField label="CP" />
          </div>
        </div>
      </div>
    )
  }
}

export default Profile

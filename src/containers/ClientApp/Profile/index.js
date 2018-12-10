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
    apiToken: '',
    showPassword: false,
    cp: '',
    socialName: '',
    rfc: '',
    currentRange: null,
  }

  componentDidMount() {
    document.body.style.backgroundColor = '#fff'

    this.setToken()
    this.setCurrentRate()
  }

  componentWillUnmount() {
    document.body.style.backgroundColor = '#f5f5f5'
  }

  setToken = async () => {
    try {
      const tokenRes = await NetworkOperation.getApiToken()
      const apiToken = tokenRes.data?.user?.apiKey?.value || 'Token no generado'

      this.setState({ apiToken })
    } catch (error) {
      console.error('SET TOKEN ERROR', error)
    }
  }

  setCurrentRate = async () => {
    try {
      const userRateRes = await NetworkOperation.getUserRate(
        this.context?.user?.username
      )

      this.setState({ currentRange: userRateRes.data })
    } catch (error) {
      console.error(error)
    }
  }

  onChange = ({ target: { name, value } }) => this.setState({ [name]: value })

  handleClickShowPassword = () =>
    this.setState((state) => ({ showPassword: !state.showPassword }))

  render() {
    const {
      state: {
        name,
        company,
        email,
        username,
        apiToken,
        currentRange,
        cp,
        socialName,
        rfc,
      },
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
          <FormControl fullWidth>
            <InputLabel htmlFor="adornment-password">Token</InputLabel>
            <Input
              id="adornment-password"
              type={this.state.showPassword ? 'text' : 'password'}
              value={apiToken}
              name="password"
              onChange={this.onChange}
              multiline={Boolean(this.state.showPassword)}
              endAdornment={
                <InputAdornment position="start">
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
            <label>Rango de Busquedas</label>
            <div>
              {this.context?.user?.indexRates?.map((rate, index) => (
                (currentRange?.requests?.indexings > rate.min && currentRange?.requests?.indexings < rate.max) ?
                  <span>
                    Rango actual entre {rate.min} y {rate.max}
                  </span> : ""
              ))}
            </div>
          </div>
          <div className="consults-range">
            <label>Rango de Indexación</label>
            <div>
              {this.context?.user?.searchRates?.map((rate, index) => (
                (currentRange?.requests?.searches > rate.min && currentRange?.requests?.searches < rate.max) ?
                  <span>
                    Rango actual entre {rate.min} y {rate.max}
                  </span> : ""
              ))}
            </div>
          </div>
        </div>
        <hr />
        <div>
          <h2>Datos de facturación</h2>
          <div className="fields-container">
            <TextField
              onChange={this.onChange}
              value={rfc}
              label="RFC"
              name="rfc"
            />
            <TextField
              onChange={this.onChange}
              value={socialName}
              label="Razón social"
              name="socialName"
            />
            <TextField onChange={this.onChange} value={cp} label="CP" />
          </div>
        </div>
      </div>
    )
  }
}

export default Profile

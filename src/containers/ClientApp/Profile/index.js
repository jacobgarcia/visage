import React, { Component } from 'react'
import PropTypes from 'prop-types'
import NetworkOperation from 'utils/NetworkOperation'

import TextInput from 'components/TextInput'

import TextField from '@material-ui/core/TextField'
import InputAdornment from '@material-ui/core/InputAdornment'
import IconButton from '@material-ui/core/IconButton'
import Visibility from '@material-ui/icons/Visibility'
import VisibilityOff from '@material-ui/icons/VisibilityOff'

import { UserContext } from 'utils/context'

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
    this.setState(state => ({ showPassword: !state.showPassword }));
  }
  render() {
    const {
      state: { name, company, email, username, apitoken },
    } = this

    return (
      <div className="profile">
        <div>
          <h5>Datos de usuario</h5>
          <div>
            <TextInput
              name="name"
              label="Nombre"
              value={name}
              onChange={this.onChange}
            />
            <TextInput
              name="user"
              label="Nombre de usuario"
              value={username}
              onChange={this.onChange}
            />
            <TextInput
              name="company"
              label="Empresa"
              value={company}
              onChange={this.onChange}
            />
            <TextInput
              name="email"
              label="Email"
              value={email}
              onChange={this.onChange}
            />
          </div>
        </div>
        <div>
          <h5>Estatus</h5>
          <p>Usuario activo</p>
        </div>
        <div>
          <h5>Llaves de API</h5>
          <p>pbCI6Im1hcmlvQG51cmUubXgiLCJ1c2VybmFt</p>
        </div>
        <div>
          <h5>Rangos de consultas</h5>
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
        <div>
          <h5>Datos de facturación</h5>
          <TextInput label="RFC" name="rfc" />
          <TextInput label="Razón social" name="social-name" />
          <TextInput label="CP" />
        </div>
      </div>
    )
  }
}

export default Profile

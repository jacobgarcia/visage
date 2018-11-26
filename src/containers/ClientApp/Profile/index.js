import React, { Component } from 'react'
import PropTypes from 'prop-types'

import TextInput from 'components/TextInput'
import './styles.pcss'

class Profile extends Component {
  static propTypes = {}

  state = {}

  onLogout = () => {
    this.props.history.replace('/login')
  }

  render() {
    return (
      <div className="profile-content">
        <div>
          <h5>Datos de usuario</h5>
          <div>
            <TextInput
              name="name"
              label="Nombre"
              value={''}
              onChange={this.onChange}
            />
            <TextInput
              name="user"
              label="Nombre de usuario"
              value={''}
              onChange={this.onChange}
            />
            <TextInput
              name="company"
              label="Empresa"
              value={''}
              onChange={this.onChange}
            />
            <TextInput
              name="email"
              label="Email"
              value={''}
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
            <p>
              $0.89MXN <span>Entre 1000 y 9999</span>
            </p>
          </div>
          <div className="consults-range">
            <label>Indexación</label>
            <p>
              $0.89MXN <span>Entre 1000 y 9999</span>
            </p>
          </div>
        </div>
        <div>
          <h5>Datos de facturación</h5>
          <TextInput label="RFC" name="rfc" />
          <TextInput label="Razón social" name="social-name" />
          <TextInput label="CP" />
        </div>
        <div>
          <p onClick={this.onLogout}>Cerrar sesión</p>
        </div>
      </div>
    )
  }
}

export default Profile

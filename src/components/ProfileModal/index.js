import React, { Component } from 'react'
import PropTypes from 'prop-types'

import Modal from '@material-ui/core/Modal'
import TextInput from 'components/TextInput'
import './styles.pcss'

import { UserContext } from 'utils/context'

class ProfileModal extends Component {
  static propTypes = {}

  static contextType = UserContext

  state = {
    name: this.context?.user?.name,
    company: this.context?.user?.company,
    email: this.context?.user?.email,
    username: this.context?.user?.username,
  }

  onChange = ({ target: { name, value } }) => {
    this.setState({ [name]: value })
  }

  render() {
    const {
      state: { name, company, email, username },
    } = this

    return (
      <Modal
        open={this.props.open}
        onClose={this.props.onClose}
        className="modal"
      >
        <div className="profile-modal-content">
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
          <div>
            <p onClick={this.props.onLogout}>Cerrar sesión</p>
          </div>
        </div>
      </Modal>
    )
  }
}

export default ProfileModal
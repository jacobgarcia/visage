import React, { Component } from 'react'
import PropTypes from 'prop-types'
import TextField from '@material-ui/core/TextField'
import InputAdornment from '@material-ui/core/InputAdornment'
import FormControl from '@material-ui/core/FormControl'
import IconButton from '@material-ui/core/IconButton'
import Button from '@material-ui/core/Button'
import Visibility from '@material-ui/icons/Visibility'
import VisibilityOff from '@material-ui/icons/VisibilityOff'
import InputLabel from '@material-ui/core/InputLabel'
import Input from '@material-ui/core/Input'
import Drawer from '@material-ui/core/Drawer'
import ChangePassModal from 'components/ChangePassModal'
import EditUserModal from 'components/EditUserModal'
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
    indexLimit: this.context?.user?.indexLimit,
    searchLimit: this.context?.user?.searchLimit,
    apiToken: '',
    showPassword: false,
    postalCode: this.context?.user?.postalCode,
    businessName:this.context?.user?.businessName,
    rfc: this.context?.user?.rfc,
    currentRange: null,
    changePassModal: false,
    editingBilling: false,
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

  onSaveBillingInfo = async () => {
    try {
      const { postalCode, rfc, businessName } = this.state
      await NetworkOperation.setBillingInfo({
        postalCode,
        rfc,
        businessName,
        name: this.state.name,
        company: this.state.company,
        email: this.state.email,
        username: this.state.username,
        searchLimit: this.state.searchLimit,
        indexLimit: this.state.indexLimit,
       })
    } catch (error) {
      console.error(error)
    }
  }

  onChange = ({ target: { name, value } }) => this.setState({ [name]: value })

  handleClickShowPassword = () =>
    this.setState((state) => ({ showPassword: !state.showPassword }))

  handleClickPassModal = () =>
    this.setState((state) => ({ changePassModal: !state.changePassModal }))

  handleClickUserModal = () =>
    this.setState((state) => ({ changeUserModal: !state.changeUserModal }))

  render() {
    const {
      state: {
        name,
        company,
        email,
        username,
        apiToken,
        currentRange,
        postalCode,
        businessName,
        rfc,
        editingBilling,
      },
    } = this

    return (
      <Drawer
        anchor="right"
        open={this.props.open}
        onClose={this.props.onClose}
        className="profile-drawer"
      >
        <ChangePassModal
          onClose={this.handleClickPassModal}
          open={this.state.changePassModal}
        />
        <EditUserModal
          onClose={this.handleClickUserModal}
          open={this.state.changeUserModal}
          username={this.state.username}
          name={this.state.name}
          company={this.state.company}
          email={this.state.email}
        />
        <div className="profile-drawer-header">
          <div className="profile-data">
            <div className="profile-image" />
            <div>
              <p>Frans Ramirez</p>
              <p className="indexing-status">Indexado</p>
            </div>
          </div>
          <div onClick={this.props.onClose}>Cerrar</div>
        </div>
        <div className="profile-drawer-content">
          <div>
            <div className="title-action-container">
              <h4>Datos personales</h4>
              <p tabIndex={0} role="button" onClick={this.handleClickUserModal}>
                Editar datos
              </p>
            </div>
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
              {/* <TextField
                name="company"
                label="Empresa"
                value={company}
                onChange={this.onChange}
              /> */}
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
            <h4>Contraseña</h4>
            <div className="signout-container">
              <Button variant="outline" onClick={this.handleClickPassModal}>
                Cambiar contraseña
              </Button>
            </div>
          </div>
          <hr />
          <div>
            <h4>Llaves de API</h4>
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
            <h4>Rangos de consultas</h4>
            <div className="consults-range">
              <label>Rango de Busquedas</label>
              <div>
                {this.context?.user?.indexRates?.map((rate, index) =>
                  currentRange?.requests?.indexings > rate.min &&
                  currentRange?.requests?.indexings < rate.max ? (
                    <span>
                      Rango actual entre {rate.min} y {rate.max}
                    </span>
                  ) : (
                    ''
                  )
                )}
              </div>
            </div>
            <div className="consults-range">
              <label>Rango de Indexación</label>
              <div>
                {this.context?.user?.searchRates?.map((rate, index) =>
                  currentRange?.requests?.searches > rate.min &&
                  currentRange?.requests?.searches < rate.max ? (
                    <span>
                      Rango actual entre {rate.min} y {rate.max}
                    </span>
                  ) : (
                    ''
                  )
                )}
              </div>
            </div>
          </div>
          <hr />
          <div>
            <div className="title-action-container">
              <h4>Datos de facturación</h4>
              <p
                onClick={() =>
                  this.setState(({ editingBilling }) => ({
                    editingBilling: !editingBilling,
                  }))
                }
              >
                {editingBilling ? 'Cancelar' : 'Editar datos'}
              </p>
            </div>
            <div className="fields-container">
              <TextField
                onChange={this.onChange}
                value={rfc}
                label="RFC"
                name="rfc"
                InputProps={{
                  readOnly: !editingBilling,
                }}
              />
              <TextField
                onChange={this.onChange}
                value={businessName}
                label="Razón social"
                name="businessName"
                InputProps={{
                  readOnly: !editingBilling,
                }}
              />
              <TextField
                onChange={this.onChange}
                name="postalCode"
                value={postalCode}
                label="CP"
                InputProps={{
                  readOnly: !editingBilling,
                }}
              />
            </div>
            {editingBilling && (
              <Button onClick={this.onSaveBillingInfo}>Guardar</Button>
            )}
          </div>
          <hr />
          <div className="signout-container">
            <Button
              className="logout"
              color="red"
              onClick={() => {
                this.props.history.replace('/login')
              }}
            >
              Cerrar sesión
            </Button>
          </div>
        </div>
      </Drawer>
    )
  }
}

export default Profile

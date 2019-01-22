import React, { Component } from 'react'
import PropTypes from 'prop-types'
import Typography from '@material-ui/core/Typography'
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
    businessName: this.context?.user?.businessName,
    rfc: this.context?.user?.rfc,
    currentRange: null,
    changePassModal: false,
    editingBilling: false,
  }

  componentDidMount() {
    this.setToken()
    this.setCurrentRate()
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
            <div
              className="profile-image"
              style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                color: 'black',
              }}
            >
              {this.context?.user?.name?.charAt?.(0)}
            </div>
            <div>
              <p>{this.context?.user?.name}</p>
              <p className="indexing-status">Indexado</p>
            </div>
          </div>
          <Button
            style={{ color: 'white' }}
            variant="outlined"
            onClick={this.props.onClose}
          >
            Cerrar
          </Button>
        </div>
        <div className="profile-drawer-content">
          <div>
            <div className="title-action-container">
              <Typography variant="h6">Datos personales</Typography>
              <Typography
                component="button"
                variant="button"
                gutterBottom
                onClick={this.handleClickUserModal}
              >
                Editar datos
              </Typography>
            </div>
            <div className="fields-container">
              <TextField
                name="name"
                label="Nombre"
                disabled
                value={name}
                onChange={this.onChange}
              />
              <TextField
                name="username"
                label="Nombre de usuario"
                disabled
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
                disabled
                value={email}
                onChange={this.onChange}
              />
            </div>
          </div>
          <hr />
          <div>
            <div className="signout-container">
              <Button variant="outlined" onClick={this.handleClickPassModal}>
                Cambiar contraseña
              </Button>
            </div>
          </div>
          <hr />
          <div>
            <Typography variant="h6">Llaves de API</Typography>
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
            <Typography variant="h6">Total de búsquedas</Typography>
            <div className="consults-range">
              <p>{this.context?.user?.searches?.length}</p>
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
              <div style={{ display: 'flex', marginTop: 16 }}>
                <div style={{ marginRight: 8, flex: 1, flexBasis: 200 }}>
                  <h4>Límite de búsquedas</h4>

                  {this.context?.user?.searchRates?.map((rate, index) =>
                    currentRange?.requests?.searches > rate.min &&
                    currentRange?.requests?.searches < rate.max ? (
                      <p>
                        {rate.min} a {rate.max}
                      </p>
                    ) : (
                      ''
                    )
                  )}
                </div>
                <div style={{ marginLeft: 8, flex: 1, flexBasis: 200 }}>
                  <h4>Tarifa por búsqueda</h4>
                  <p>
                    <span style={{ display: 'inline-block', marginRight: 4 }}>
                      $
                    </span>
                    {this.context?.user?.searchCost}{' '}
                    <span
                      style={{ display: 'inline-block', fontSize: '0.8rem' }}
                    >
                      MXN
                    </span>
                  </p>
                </div>
              </div>
              <p style={{ color: 'gray', fontSize: 13, marginTop: 16 }}>
                * Al exeder el máximo de búsquedas los límites y la tarifa
                actual se actualizarán automáticamente.
              </p>
            </div>
          </div>
          <hr />
          <div>
            <div className="title-action-container">
              <Typography variant="h6">Datos de facturación</Typography>
              <Typography
                component="button"
                variant="button"
                gutterBottom
                onClick={() =>
                  this.setState(({ editingBilling }) => ({
                    editingBilling: !editingBilling,
                  }))
                }
              >
                {editingBilling ? 'Cancelar' : 'Editar datos'}
              </Typography>
            </div>
            <div className="fields-container">
              <TextField
                onChange={this.onChange}
                value={rfc}
                label="RFC"
                name="rfc"
                style={{ color: 'black' }}
                disabled={!editingBilling}
              />
              <TextField
                onChange={this.onChange}
                value={businessName}
                label="Razón social"
                name="businessName"
                style={{ color: 'black' }}
                disabled={!editingBilling}
              />
              <TextField
                onChange={this.onChange}
                name="postalCode"
                value={postalCode}
                label="CP"
                style={{ color: 'black' }}
                disabled={!editingBilling}
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

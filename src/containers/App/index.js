import React, { Component, Fragment } from 'react'
import { NavLink, Switch, Route } from 'react-router-dom'
import PropTypes from 'prop-types'
import { DateUtils } from 'react-day-picker'
import 'react-day-picker/lib/style.css'

import CssBaseline from '@material-ui/core/CssBaseline'

import ListItem from '@material-ui/core/ListItem'
import ListItemIcon from '@material-ui/core/ListItemIcon'

import Dashboard from 'containers/Dashboard'
import Clients from 'containers/Clients'
import Admins from 'containers/Admins'
import Tarifs from 'containers/Tarifs'

import AppBar from 'components/AppBar'
import Drawer from 'components/Drawer'

import SaveIcon from '@material-ui/icons/Save'

import NetworkOperation from 'utils/NetworkOperation'
import { UserContext } from 'utils/context'
import { SaverProvider } from '../../utils/portals'

import qboLogoColor from '../../assets/qbo-logo.svg'
import './styles.pcss'

class App extends Component {
  static propTypes = {
    location: PropTypes.object,
  }

  static contextType = UserContext

  state = {
    loadingSelf: true,
    showSaveButton: false,
    saving: false,
    toolBarHidden: true,
    showDateFilter: true,
    showDayPicker: false,
    ...this.getInitialState(),
  }

  async componentDidMount() {
    try {
      const { data } = await NetworkOperation.getSelf()

      // Set user context
      this.context.setUserData(
        {
          isSuperAdmin: data.superAdmin,
          services: data.services,
          name: data.name,
          username: data.username,
          email: data.email,
          userImage: data.userImage ? data.userImage : '',
        })

        this.setState({ loadingSelf: false })
    } catch (error) {
      if (error.response?.status === 401) this.props.history.replace('/login')
      // TODO Other error should be displayed
    }
  }


  onCloseClick = () => {
    localStorage.clear()

  }

  setSaveButtonValue = (value = false) => {
    this.setState({ showSaveButton: value })
  }

  onSaveClicked = () => this.setState({ saving: true })

  setStopSaving = () => this.setState({ saving: false })

  onToggle = (name) => () => this.setState((prev) => ({ [name]: !prev[name] }))

  onDateSelect = () => {}

  getInitialState() {
    return {
      from: undefined,
      to: undefined,
    }
  }

  handleDayClick = (day) => {
    const range = DateUtils.addDayToRange(day, this.state)
    this.setState(range)
  }

  handleResetClick = () => {
    this.setState(this.getInitialState())
  }

  render() {
    const {
      state: {
        showSaveButton,
        saving,
        toolBarHidden,
        showDateFilter,
        showDayPicker,
        loadingSelf,
        name,
        userImage,
      },

      props: {
        location: { pathname },
      },
    } = this

    if (loadingSelf) {
      return (
        <div className="loading-screen">
          <img src={qboLogoColor} alt="QBO" />
          <p>Cargando...</p>
        </div>
      )
    }

    let title = ''
    if (pathname === '/') title = 'Dashboard'
    if (pathname === '/clients') title = 'Clientes'
    if (pathname === '/admins') title = 'Administradores'
    if (pathname === '/tarifs') title = 'Tarifas'

    const { from, to } = this.state
    const modifiers = { start: from, end: to }
    return (
      <SaverProvider
        value={{
          toggle: this.setSaveButtonValue,
          value: showSaveButton,
          saving,
          stopSaving: this.setStopSaving,
          showDateFilter,
          onDateSelect: this.onDateSelect,
        }}
      >
        <Fragment>
          <CssBaseline />
          <div className="root">
            <AppBar
              onToggle={this.onToggle}
              saving={saving}
              showSaveButton={showSaveButton}
              showDateFilter={showDateFilter}
              from={from}
              to={to}
              modifiers={modifiers}
              showDayPicker={showDayPicker}
              toolBarHidden={toolBarHidden}
              title={title}
              handleDayClick={this.handleDayClick}
              numberOfMonths={1}
            />
            <Drawer
              onToggle={this.onToggle}
              onLinkClick={this.onLinkClick}
              toolBarHidden={toolBarHidden}
              onCloseClick={this.onCloseClick}
            />
            <main className={`content ${toolBarHidden ? '--full-width' : ''}`}>
              <Switch>
                <Route exact path="/" component={Dashboard} />
                <Route exact path="/clients" component={Clients} />
                <Route exact path="/admins" component={Admins} />
                <Route exact path="/tarifs" component={Tarifs} />
              </Switch>
            </main>
          </div>
        </Fragment>
      </SaverProvider>
    )
  }
}

App.propTypes = {}

export default App

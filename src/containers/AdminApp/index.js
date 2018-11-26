import React, { Component, Fragment } from 'react'
import { NavLink, Switch, Route } from 'react-router-dom'
import PropTypes from 'prop-types'
import { DateUtils } from 'react-day-picker'
import 'react-day-picker/lib/style.css'

import CssBaseline from '@material-ui/core/CssBaseline'

import ListItem from '@material-ui/core/ListItem'
import ListItemIcon from '@material-ui/core/ListItemIcon'

import Dashboard from 'containers/AdminApp/Dashboard'
import Clients from 'containers/AdminApp/Clients'
import Admins from 'containers/AdminApp/Admins'
import Rates from 'containers/AdminApp/Rates'

import AppBar from 'components/AppBar'
import Drawer from 'components/Drawer'

import SaveIcon from '@material-ui/icons/Save'

import NetworkOperation from 'utils/NetworkOperation'
import { UserContext } from 'utils/context'
import { SaverProvider } from 'utils/portals'


import './styles.pcss'

class App extends Component {
  static propTypes = {
    location: PropTypes.object,
  }

  static contextType = UserContext

  state = {
    showSaveButton: false,
    saving: false,
    toolBarHidden: true,
    showDateFilter: true,
    showDayPicker: false,
    ...this.getInitialState(),
  }

  getInitialState() {
    return {
      from: undefined,
      to: undefined,
    }
  }

  onCloseClick = () => {
    localStorage.clear()
  }

  toggleNavActions = ({ saveButton = false, dateFilter = false } = {}) => {
    this.setState({ showSaveButton: saveButton, showDateFilter: dateFilter })
  }

  onSaveClicked = () => {
    this.saveFunction()
    console.log('ON SAVE CLICKED...')
    this.setState({ saving: true })
  }

  setStopSaving = ({ success = true } = {}) => {
    const newState = { saving: false }
    
    if (success) {
      newState.showSaveButton = false
    }
    
    this.setState(newState)
  }

  onToggle = (name) => () => this.setState((prev) => ({ [name]: !prev[name] }))

  onDateSelect = () => {}

  handleDayClick = (day) => {
    const range = DateUtils.addDayToRange(day, this.state)
    this.setState(range)
  }

  handleResetClick = () => {
    this.setState(this.getInitialState())
  }

  setSaveFunction = (saveFunction) => this.saveFunction = saveFunction

  render() {
    const {
      state: {
        showSaveButton,
        saving,
        toolBarHidden,
        showDateFilter,
        showDayPicker,
        loadingSelf,
      },
      props: {
        location: { pathname },
      },
    } = this


    let title = ''
    if (pathname === '/') title = 'Dashboard'
    if (pathname === '/clients') title = 'Clientes'
    if (pathname === '/admins') title = 'Administradores'
    if (pathname === '/rates') title = 'Tarifas'

    const { from, to } = this.state
    const modifiers = { start: from, end: to }
    return (
      <SaverProvider
        value={{
          toggle: this.toggleNavActions,
          value: showSaveButton,
          saving,
          stopSaving: this.setStopSaving,
          showDateFilter,
          onDateSelect: this.onDateSelect,
          setSaveFunction: this.setSaveFunction
        }}
      >
        <Fragment>
          <CssBaseline />
          <div className="root" id="admin-app">
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
              onSaveClicked={this.onSaveClicked}
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
                <Route exact path="/rates" component={Rates} />
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

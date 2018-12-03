import React, { Component } from 'react'
import { Route } from 'react-router-dom'
import PropTypes from 'prop-types'

import Dashboard from 'containers/ClientApp/Dashboard'
import Profile from 'containers/ClientApp/Profile'
import AppBar from 'components/AppBar'
import Drawer from 'components/Drawer'

import './styles.pcss'

class ClientApp extends Component {
  static propTypes = {}

  state = {
    profileModalOpen: false,
    toolBarHidden: false,
  }

  onToggleProfileModal = () => {
    this.setState(({ profileModalOpen }) => ({
      profileModalOpen: !profileModalOpen,
    }))
  }

  onLogout = () => {
    this.props.history.replace('/login')
  }

  onToggleProfileModal = () => {}

  onCloseClick = () => {
    localStorage.clear()
  }

  onToggle = (name) => () => this.setState((prev) => ({ [name]: !prev[name] }))

  render() {
    const {
      state: { toolBarHidden },
      props: {
        location: { pathname },
      },
    } = this

    let title = ''
    if (pathname === '/') title = 'Dashboard'
    if (pathname === '/profile') title = 'Mi información'

    return (
      <div id="client-app">
        <AppBar onToggle={this.onToggle} title={title} />
        <Drawer
          isClient
          onToggle={this.onToggle}
          toolBarHidden={toolBarHidden}
          onCloseClick={this.onCloseClick}
        />
        <div className="content dashboard">
          <Route exact path="/" component={Dashboard} />
          <Route path="/profile" component={Profile} />
        </div>
      </div>
    )
  }
}

export default ClientApp

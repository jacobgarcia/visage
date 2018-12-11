import React, { Component } from 'react'
import { Route } from 'react-router-dom'
import PropTypes from 'prop-types'

import Dashboard from 'containers/ClientApp/Dashboard'
import AppBar from 'components/AppBar'
import ProfileDrawer from 'components/ProfileDrawer'

import qboLogo from 'assets/qbo-logo-mono.svg'
import './styles.pcss'

class ClientApp extends Component {
  static propTypes = {}

  state = {
    profileModalOpen: false,
    toolBarHidden: false,
    profileDrawerOpen: false,
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

  toggleProfileDrawer = () => {
    this.setState(({ profileDrawerOpen }) => ({
      profileDrawerOpen: !profileDrawerOpen,
    }))
  }

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
        <AppBar
          closeProfileDrawer={this.toggleProfileDrawer}
          title={title}
          history={this.props.history}
          isClient
        />
        <div className={'toolbar__logo'}>
          <img src={qboLogo} alt="QBO" />
          <div className={'toggle-button'} />
        </div>
        <ProfileDrawer
          history={this.props.history}
          open={this.state.profileDrawerOpen}
          onClose={this.toggleProfileDrawer}
        />
        <div className="content dashboard">
          <Dashboard closeProfileDrawer={this.toggleProfileDrawer} />
        </div>
      </div>
    )
  }
}

export default ClientApp

import React, { Component } from 'react'
import { Switch, Route } from 'react-router'
import PropTypes from 'prop-types'

import Header from 'components/Header'

// import NetworkOperation from 'lib/NetworkOperation'

import Dashboard from 'containers/ClientApp/Dashboard'
import Profile from 'containers/ClientApp/Profile'

import './styles.pcss'

class ClientApp extends Component {
  static propTypes = {}

  state = {}

  render() {
    return (
      <div id="client-app">
        <Header user={null} location={this.props.location} />
        <Switch>
          <Route exact path="/" component={Dashboard} />
          <Route path="/profile" component={Profile} />
        </Switch>
      </div>
    )
  }
}

export default ClientApp

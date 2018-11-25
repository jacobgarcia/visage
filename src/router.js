import React, { PureComponent } from 'react'
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom'
import { MuiThemeProvider, createMuiTheme } from '@material-ui/core/styles'
import { hot } from 'react-hot-loader'

import App from 'containers/App'
import Login from 'containers/Login'
import Signup from 'containers/Signup'
import NotFound from 'containers/NotFound'

import { UserContext, defaultUser } from 'utils/context'

const theme = createMuiTheme({
  palette: {
    primary: { main: '#333333' }, // Purple and green play nicely together.
    secondary: { main: '#5BC3D7' }, // This is just green.A700 as hex.
    action: { main: '#fff' },
  },
})

class Routes extends PureComponent {
  constructor(props) {
    super(props)

    this.setUserData = (data) => {
      this.setState({ user: data })
    }

    this.state = {
      user: defaultUser,
      setUserData: this.setUserData,
    }
  }

  render() {
    return (
      <MuiThemeProvider theme={theme}>
        <UserContext.Provider value={this.state}>
          <Router>
            <Switch>
              <Route exact path="/login" component={Login} />
              <Route exact path="/signup" component={Signup} />
              <Route exact path="/(|tarifs|admins|clients)/" component={App} />
              <Route component={NotFound} />
            </Switch>
          </Router>
        </UserContext.Provider>
      </MuiThemeProvider>
    )
  }
}

export default hot(module)(Routes)

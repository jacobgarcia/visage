import React, { PureComponent, Fragment } from 'react'
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom'
import { MuiThemeProvider, createMuiTheme } from '@material-ui/core/styles'
import { hot } from 'react-hot-loader'

import AdminApp from 'containers/AdminApp'
import ClientApp from 'containers/ClientApp'
import Login from 'containers/Login'
import Signup from 'containers/Signup'
import NotFound from 'containers/NotFound'

import NetworkOperation from 'utils/NetworkOperation'
import { UserContext, defaultUser } from 'utils/context'
import qboLogoColor from 'assets/qbo-logo.svg'

const theme = createMuiTheme({
  palette: {
    primary: { main: '#333333' }, // Purple and green play nicely together.
    secondary: { main: '#5BC3D7' }, // This is just green.A700 as hex.
    action: { main: '#fff' },
  },
})

class SessionLoader extends PureComponent {
  static contextType = UserContext

  async componentDidMount() {
    console.log('SESSION LOADER DID MOUNT')
    try {
      const { data } = await NetworkOperation.getSelf()

      // Set user context
      this.context.setUserData({
        user: data.user,
        loadingSelf: false,
      })
    } catch (error) {
      if (error.response?.status === 401) {
        this.props.history.replace('/login')
      }
      // TODO Other error should be displayed
    }
  }

  render() {
    return null
  }
}

class Routes extends PureComponent {
  constructor(props) {
    super(props)

    this.setUserData = (data) => {
      this.setState({ user: data.user, loadingSelf: false })
    }

    this.state = {
      loadingSelf: true,
      user: null,
      setUserData: this.setUserData,
    }
  }

  render() {
    const {
      state: { loadingSelf },
    } = this

    return (
      <MuiThemeProvider theme={theme}>
        <UserContext.Provider
          value={{ user: this.state.user, setUserData: this.state.setUserData }}
        >
          <Router>
            <Fragment>
              <Route component={SessionLoader} />
              <Switch>
                <Route exact path="/login" component={Login} />
                {this.state.user === null ? (
                  <div className="loading-screen">
                    <img src={qboLogoColor} alt="QBO" />
                    <p>Cargando...</p>
                  </div>
                ) : (
                  <Fragment>
                    <Switch>
                      <Route exact path="/signup" component={Signup} />
                      {this.state.user?.access === 'admin' ? (
                        <Route
                          exact
                          path="/(|tarifs|admins|clients)/"
                          component={AdminApp}
                        />
                      ) : (
                        <Route
                          exact
                          path="/(|profile)/"
                          component={ClientApp}
                        />
                      )}
                      <Route component={NotFound} />
                    </Switch>
                  </Fragment>
                )}
              </Switch>
            </Fragment>
          </Router>
        </UserContext.Provider>
      </MuiThemeProvider>
    )
  }
}

export default hot(module)(Routes)

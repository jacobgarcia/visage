import React, { PureComponent, Fragment } from 'react'
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom'
import { MuiThemeProvider, createMuiTheme } from '@material-ui/core/styles'
import { hot } from 'react-hot-loader'
import PropTypes from 'prop-types'

import AdminApp from 'containers/AdminApp'
import ClientApp from 'containers/ClientApp'
import Login from 'containers/Login'
import Signup from 'containers/Signup'
import NotFound from 'containers/NotFound'

import NetworkOperation from 'utils/NetworkOperation'
import { UserContext } from 'utils/context'
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

  static propTypes = {
    history: PropTypes.object.isRequired,
  }

  async componentDidMount() {
    const pathname = this.props.location.pathname
    if (pathname === '/login' || pathname === '/signup') {
      return
    }

    try {
      const { data } = await NetworkOperation.getSelf()

      console.log({ data })

      this.context.setUserData({
        user: data.user,
        loadingSelf: false,
      })
    } catch (error) {
      if (error.response?.status === 401) {
        this.props.history.replace('/login')
      } else if (error.response?.status === 400) {
        this.props.history.replace('/login')
      } else {
        // TODO Other error should be displayed
        console.error(error)
      }
    }
  }

  render() {
    return null
  }
}

class Routes extends PureComponent {
  static getDerivedStateFromError() {
    // Update state so the next render will show the fallback UI.
    return { hasError: true }
  }

  constructor(props) {
    super(props)

    this.setUserData = (data) => {
      this.setState({ user: data.user, loadingSelf: false })
    }

    this.state = {
      user: null,
      setUserData: this.setUserData,
    }
  }

  componentDidCatch(error, info) {
    console.error('COMPONENT DID CATCH', error, info)
  }

  render() {
    const {
      state: { hasError },
    } = this

    if (hasError) {
      return (
        <div className="error">
          <div className="message-container">
            <h2>Error en la aplicación</h2>
            <p className="message">Favor de recargar la página</p>
            <p
              onClick={() => {
                window.location.reload(true)
              }}
              className="reload"
            >
              Recargar
            </p>
          </div>
        </div>
      )
    }

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
                <Route path="/signup" component={Signup} />
                {this.state.user === null ? (
                  <Route
                    render={() => (
                      <div className="loading-screen">
                        <img src={qboLogoColor} alt="QBO" />
                        <p>Cargando...</p>
                      </div>
                    )}
                  />
                ) : (
                  <Fragment>
                    <Switch>
                      {this.state.user?.access === 'admin' ? (
                        <Route
                          exact
                          path="/(|rates|admins|clients)/"
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

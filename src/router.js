import React from 'react'
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom'
import { MuiThemeProvider, createMuiTheme } from '@material-ui/core/styles'
import { hot } from 'react-hot-loader'

import App from 'containers/App'
import Login from 'containers/Login'
import NotFound from 'containers/NotFound'

const theme = createMuiTheme({
  palette: {
    primary: { main: '#333333' }, // Purple and green play nicely together.
    secondary: { main: '#5BC3D7' }, // This is just green.A700 as hex.
    action: { main: '#fff' },
  },
})

function Routes() {
  return (
    <MuiThemeProvider theme={theme}>
      <Router>
        <Switch>
          <Route path="/login" component={Login} />
          <Route exact path="/(|tarifs|admins|clients)/" component={App} />
          <Route component={NotFound} />
        </Switch>
      </Router>
    </MuiThemeProvider>
  )
}

export default hot(module)(Routes)

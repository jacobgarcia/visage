import React, { Component, Fragment } from 'react'
import { NavLink, Switch, Route } from 'react-router-dom'
import PropTypes from 'prop-types'

import CssBaseline from '@material-ui/core/CssBaseline'
import Drawer from '@material-ui/core/Drawer'
import AppBar from '@material-ui/core/AppBar'
import Toolbar from '@material-ui/core/Toolbar'
import CircularProgress from '@material-ui/core/CircularProgress'
import Typography from '@material-ui/core/Typography'
import Divider from '@material-ui/core/Divider'
import IconButton from '@material-ui/core/IconButton'
import Button from '@material-ui/core/Button'

import MenuIcon from '@material-ui/icons/Menu'
import ListItem from '@material-ui/core/ListItem'
import ListItemIcon from '@material-ui/core/ListItemIcon'
import ListItemText from '@material-ui/core/ListItemText'
import DashboardIcon from '@material-ui/icons/Dashboard'
import SaveIcon from '@material-ui/icons/Save'
import PeopleIcon from '@material-ui/icons/People'
import AttachMoneyIcon from '@material-ui/icons/AttachMoney'
import SecurityIcon from '@material-ui/icons/Security'
import ExitIcon from '@material-ui/icons/ExitToApp'

import Dashboard from '../Dashboard'
import Clients from '../Clients'
import Admins from '../Admins'
import Tarifs from '../Tarifs'

import { SaverProvider } from '../../utils/portals'

import './styles.pcss'

function listItem(text, Component) {
  return (
    <ListItem button>
      <ListItemIcon>
        <Component color="secondary" />
      </ListItemIcon>
      <ListItemText primary={text} />
    </ListItem>
  )
}

class App extends Component {
  static propTypes = {
    location: PropTypes.object,
  }

  state = {
    open: false,
    showSaveButton: false,
    saving: false,
  }

  onDrawerToggle = () => this.setState(({ open }) => ({ open: !open }))

  handleDrawerClose = () => this.setState({ open: false })

  onLinkClick = () => this.setState({ open: false })

  setSaveButtonValue = (value = false) => {
    this.setState({ showSaveButton: value })
  }

  onSaveClicked = () => this.setState({ saving: true })

  setStopSaving = () => this.setState({ saving: false })

  render() {
    const {
      state: { open, showSaveButton, saving },
      props: {
        location: { pathname },
      },
    } = this

    let title = ''
    if (pathname === '/') title = 'Dashboard'
    if (pathname === '/clients') title = 'Clientes'
    if (pathname === '/admins') title = 'Administradores'
    if (pathname === '/tarifs') title = 'Tarifas'

    return (
      <SaverProvider
        value={{
          toggle: this.setSaveButtonValue,
          value: showSaveButton,
          saving,
          stopSaving: this.setStopSaving,
        }}
      >
        <Fragment>
          <CssBaseline />
          <div className="root">
            <AppBar position="absolute" className="app-bar">
              <Toolbar className="toolbar">
                <div className="toolbar__content">
                  <Typography variant="subtitle" color="inherit" noWrap>
                    {title}
                  </Typography>

                  <div className="toolbar__actions">
                    {showSaveButton &&
                      (saving ? (
                        <div className="circular-progress-container">
                          <CircularProgress
                            className="circular-progress"
                            size={30}
                            color="inherit"
                          />
                        </div>
                      ) : (
                        <Button
                          variant="contained"
                          color="secondary"
                          onClick={this.onSaveClicked}
                          size="small"
                        >
                          Guardar
                          <SaveIcon color="inherit" className="save-icon" />
                        </Button>
                      ))}
                  </div>
                </div>
                <div>
                  <div className="user-image" />
                </div>
              </Toolbar>
            </AppBar>

            <Drawer
              className="drawer"
              variant="permanent"
              // classes={{
              //   paper: `drawer-paper${open ? '--open' : '--closed'}`,
              // }}
              anchor="left"
            >
              <div className="toolbar__logo" />
              {/* <Divider /> */}
              <NavLink onClick={this.onLinkClick} exact to="/">
                {listItem('Dashboard', DashboardIcon)}
              </NavLink>
              {/* <Divider /> */}
              <NavLink onClick={this.onLinkClick} to="/clients">
                {listItem('Clientes', PeopleIcon)}
              </NavLink>
              <NavLink onClick={this.onLinkClick} to="/admins">
                {listItem('Administradores', SecurityIcon)}
              </NavLink>
              <NavLink onClick={this.onLinkClick} to="/tarifs">
                {listItem('Tarifas', AttachMoneyIcon)}
              </NavLink>
              {/* <Divider /> */}
              <NavLink onClick={this.onLinkClick} to="/login" className="login">
                {listItem('Cerrar sesión', ExitIcon)}
              </NavLink>
            </Drawer>
            <main className={'content'}>
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
